package com.aicall.module.live.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.ai.service.ReportGenerateService;
import com.aicall.module.consultation.entity.Report;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.consultation.mapper.ReportMapper;
import com.aicall.module.live.dto.*;
import com.aicall.module.evaluation.service.EvaluationService;
import com.aicall.module.followup.service.FollowUpService;
import com.aicall.module.live.service.LiveRoomService;
import com.aicall.module.live.service.MinutesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/live/rooms")
@RequiredArgsConstructor
public class LiveRoomController {
    private final LiveRoomService liveRoomService;
    private final MinutesService minutesService;
    private final FollowUpService followUpService;
    private final EvaluationService evaluationService;
    private final ConsultationMapper consultationMapper;
    private final ReportGenerateService reportGenerateService;
    private final ReportMapper reportMapper;

    @PostMapping
    @Log("创建会诊室")
    public Result<RoomVO> createRoom(@RequestBody CreateRoomRequest request) {
        return Result.success(liveRoomService.createRoom(request.getConsultationId()));
    }

    @GetMapping("/consultation/{consultationId}")
    @Log("查询会诊室")
    public Result<RoomVO> getRoomByConsultation(@PathVariable Long consultationId) {
        return Result.success(liveRoomService.getRoomByConsultation(consultationId));
    }

    @PutMapping("/{id}/start")
    @Log("开始会诊")
    public Result<RoomVO> startRoom(@PathVariable Long id) {
        return Result.success(liveRoomService.startRoom(id));
    }

    @PutMapping("/{id}/end")
    @Log("结束会诊")
    public Result<RoomVO> endRoom(@PathVariable Long id) {
        RoomVO room = liveRoomService.endRoom(id);
        Long consultationId = room.getConsultationId();
        // Mark as completed first, then auto-generate report asynchronously
        consultationMapper.updateStatus(consultationId, 6);
        final Long cid = consultationId;
        new Thread(() -> {
            try { minutesService.generateMinutes(cid); } catch (Exception e) {
                log.error("Minutes generation failed for consultation {}: {}", cid, e.getMessage());
            }
            try { followUpService.createFollowUps(cid); } catch (Exception e) {
                log.error("Follow-up creation failed for consultation {}: {}", cid, e.getMessage());
            }
            try { evaluationService.createEvaluation(cid); } catch (Exception e) {
                log.error("Evaluation creation failed for consultation {}: {}", cid, e.getMessage());
            }
            // Auto-generate AI report draft after consultation ends
            try {
                if (reportMapper.findByConsultationId(cid) == null) {
                    String reportContent = reportGenerateService.generateReport(cid);
                    Report report = new Report();
                    report.setConsultationId(cid);
                    report.setType(1);
                    report.setContent(reportContent);
                    report.setStatus(0);
                    reportMapper.insert(report);
                    // Transition to status 4 so doctor sees report editing UI
                    consultationMapper.updateStatus(cid, 4);
                    log.info("Auto-generated AI report for consultation {}, status → 4", cid);
                }
            } catch (Exception e) {
                log.error("Auto report generation failed for consultation {}: {}", cid, e.getMessage());
            }
        }).start();
        return Result.success(room);
    }

    @GetMapping("/{id}/sig")
    @Log("获取TRTC签名")
    public Result<UserSigVO> getUserSig(@PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = auth.getAuthorities().stream()
                .map(g -> g.getAuthority())
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst()
                .orElse("ROLE_USER");
        String prefix = role.contains("DOCTOR") ? "doc_" : "pat_";
        return Result.success(liveRoomService.generateUserSig(id, prefix + userId));
    }

    @GetMapping("/{id}/recordings")
    @Log("查看录像列表")
    public Result<List<RecordingVO>> getRecordings(@PathVariable Long id) {
        return Result.success(liveRoomService.getRecordings(id));
    }

    @PostMapping("/{id}/recordings")
    @Log("保存录像")
    public Result<RecordingVO> saveRecording(@PathVariable Long id, @RequestBody SaveRecordingRequest request) {
        return Result.success(liveRoomService.saveRecording(id, request));
    }
}
