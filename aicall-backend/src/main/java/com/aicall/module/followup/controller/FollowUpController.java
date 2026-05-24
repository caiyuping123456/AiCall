package com.aicall.module.followup.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.followup.dto.AnswerRequest;
import com.aicall.module.followup.dto.FollowUpVO;
import com.aicall.module.followup.service.FollowUpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FollowUpController {
    private final FollowUpService followUpService;

    @GetMapping("/user/followup/pending")
    @Log("患者待填写随访")
    public Result<List<FollowUpVO>> pending(Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        return Result.success(followUpService.getPendingByPatient(patientId));
    }

    @GetMapping("/user/followup/{id}/detail")
    @Log("患者查看随访详情")
    public Result<FollowUpVO> detail(@PathVariable Long id) {
        return Result.success(followUpService.getDetail(id));
    }

    @PutMapping("/user/followup/{id}/answer")
    @Log("提交随访回答")
    public Result<Void> answer(@PathVariable Long id, @RequestBody AnswerRequest request, Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        followUpService.submitAnswer(id, patientId, request);
        return Result.success();
    }

    @GetMapping("/doctor/followup/{consultationId}")
    @Log("医生查看随访列表")
    public Result<List<FollowUpVO>> list(@PathVariable Long consultationId) {
        return Result.success(followUpService.getByConsultation(consultationId));
    }

    @GetMapping("/doctor/followup/{id}/detail")
    @Log("医生查看随访详情")
    public Result<FollowUpVO> doctorDetail(@PathVariable Long id) {
        return Result.success(followUpService.getDetail(id));
    }

    @GetMapping("/doctor/followup/abnormal")
    @Log("医生查看异常随访")
    public Result<List<FollowUpVO>> abnormal(Authentication auth) {
        Long doctorId = (Long) auth.getPrincipal();
        return Result.success(followUpService.getAbnormalByDoctor(doctorId));
    }
}
