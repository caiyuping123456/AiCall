package com.aicall.module.evaluation.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.evaluation.dto.EvaluationVO;
import com.aicall.module.evaluation.dto.SubmitEvaluationRequest;
import com.aicall.module.evaluation.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EvaluationController {
    private final EvaluationService evaluationService;

    @GetMapping("/user/evaluation/pending")
    @Log("患者待评价列表")
    public Result<List<EvaluationVO>> pending(Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        return Result.success(evaluationService.getPendingByPatient(patientId));
    }

    @PutMapping("/user/evaluation/{consultationId}")
    @Log("提交评价")
    public Result<Void> submit(@PathVariable Long consultationId,
                               @RequestBody SubmitEvaluationRequest request, Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        evaluationService.submitEvaluation(consultationId, patientId, request);
        return Result.success();
    }

    @GetMapping("/doctor/evaluation/{consultationId}")
    @Log("查看评价")
    public Result<EvaluationVO> getByConsultation(@PathVariable Long consultationId) {
        return Result.success(evaluationService.getByConsultation(consultationId));
    }
}
