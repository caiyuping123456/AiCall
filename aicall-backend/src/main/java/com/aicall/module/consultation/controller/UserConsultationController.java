package com.aicall.module.consultation.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.consultation.dto.*;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.entity.ConsultationUpload;
import com.aicall.module.consultation.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/user/consultation")
@RequiredArgsConstructor
public class UserConsultationController {
    private final ConsultationService consultationService;

    @PostMapping("/draft")
    @Log("创建会诊草稿")
    public Result<Long> createDraft(@Valid @RequestBody CreateDraftRequest request) {
        Long patientId = getCurrentPatientId();
        return Result.success(consultationService.createDraft(patientId, request));
    }

    @PostMapping("/{id}/chat")
    @Log("AI预问诊对话")
    public Result<ChatResponse> chat(@PathVariable Long id, @Valid @RequestBody ChatRequest request) {
        return Result.success(consultationService.chat(id, request.getMessage()));
    }

    @PostMapping("/{id}/form-submit")
    @Log("表单预问诊提交")
    public Result<String> formSubmit(@PathVariable Long id, @Valid @RequestBody FormSubmitRequest request) {
        return Result.success(consultationService.formSubmit(id, request));
    }

    @PostMapping("/{id}/generate-summary")
    @Log("生成病情摘要")
    public Result<String> generateSummary(@PathVariable Long id) {
        return Result.success(consultationService.generateSummaryFromChat(id));
    }

    @GetMapping("/{id}/summary")
    @Log("获取病情摘要")
    public Result<String> getSummary(@PathVariable Long id) {
        return Result.success(consultationService.getSummary(id));
    }

    @PutMapping("/{id}/summary")
    @Log("修改病情摘要")
    public Result<Void> updateSummary(@PathVariable Long id, @Valid @RequestBody SummaryUpdateRequest request) {
        consultationService.updateSummary(id, request);
        return Result.success();
    }

    @PostMapping("/{id}/upload")
    @Log("上传资料")
    public Result<ConsultationUpload> uploadFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "fileType", defaultValue = "1") Integer fileType) {
        return Result.success(consultationService.uploadFile(id, file, fileType));
    }

    @GetMapping("/{id}/uploads")
    @Log("获取已上传资料列表")
    public Result<List<ConsultationUpload>> getUploads(@PathVariable Long id) {
        return Result.success(consultationService.getUploads(id));
    }

    @DeleteMapping("/{id}/upload/{uploadId}")
    @Log("删除已上传资料")
    public Result<Void> deleteUpload(@PathVariable Long id, @PathVariable Long uploadId) {
        consultationService.deleteUpload(id, uploadId);
        return Result.success();
    }

    @PostMapping("/{id}/calculate-fee")
    @Log("计算费用")
    public Result<BigDecimal> calculateFee(@PathVariable Long id, @Valid @RequestBody FeeCalculateRequest request) {
        return Result.success(consultationService.calculateFee(id, request));
    }

    @PostMapping("/{id}/pay")
    @Log("模拟支付")
    public Result<Void> pay(@PathVariable Long id) {
        consultationService.pay(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @Log("查询会诊详情")
    public Result<ConsultationDetailVO> getDetail(@PathVariable Long id) {
        return Result.success(consultationService.getDetail(id));
    }

    @GetMapping("/meetings")
    @Log("查询我的会诊")
    public Result<List<Consultation>> meetings() {
        Long patientId = getCurrentPatientId();
        return Result.success(consultationService.getMeetings(patientId));
    }

    @GetMapping("/query")
    @Log("查询会诊列表")
    public Result<List<Consultation>> query() {
        Long patientId = getCurrentPatientId();
        return Result.success(consultationService.queryByPatientId(patientId));
    }

    private Long getCurrentPatientId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long patientId) {
            return patientId;
        }
        throw new com.aicall.common.exception.BusinessException(com.aicall.common.result.ResultCode.UNAUTHORIZED);
    }
}
