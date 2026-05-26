package com.aicall.module.live.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.consultation.mapper.ConsultationMapper;
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
        // Immediately mark consultation as completed — don't block on LLM
        consultationMapper.updateStatus(room.getConsultationId(), 6);
        // Generate minutes & follow-ups asynchronously
        new Thread(() -> {
            try {
                minutesService.generateMinutes(room.getConsultationId());
                followUpService.createFollowUps(room.getConsultationId());
                evaluationService.createEvaluation(room.getConsultationId());
            } catch (Exception e) {
                log.error("Post-consultation processing failed for {}: {}", room.getConsultationId(), e.getMessage());
            }
        }).start();
        return Result.success(room);
    }

    @GetMapping("/{id}/sig")
    @Log("获取TRTC签名")
    public Result<UserSigVO> getUserSig(@PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return Result.success(liveRoomService.generateUserSig(id, String.valueOf(userId)));
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
