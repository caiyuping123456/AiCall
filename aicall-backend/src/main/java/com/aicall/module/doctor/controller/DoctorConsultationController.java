package com.aicall.module.doctor.controller;

import com.aicall.common.result.Result;
import com.aicall.module.doctor.dto.*;
import com.aicall.module.doctor.service.DoctorConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor/consultations")
@RequiredArgsConstructor
public class DoctorConsultationController {
    private final DoctorConsultationService service;

    private Long getDoctorId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    @GetMapping
    public Result<List<ConsultationListItemVO>> list(@RequestParam(required = false) Integer status,
                                                      Authentication auth) {
        return Result.success(service.getConsultations(getDoctorId(auth), status));
    }

    @GetMapping("/{id}")
    public Result<DoctorConsultationDetailVO> detail(@PathVariable Long id, Authentication auth) {
        return Result.success(service.getConsultationDetail(getDoctorId(auth), id));
    }

    @PostMapping("/{id}/confirm")
    public Result<Void> confirm(@PathVariable Long id, Authentication auth) {
        service.confirmConsultation(getDoctorId(auth), id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id,
                                @Valid @RequestBody RejectRequest request,
                                Authentication auth) {
        service.rejectConsultation(getDoctorId(auth), id);
        return Result.success();
    }

    @PostMapping("/{id}/generate-report")
    public Result<ReportVO> generateReport(@PathVariable Long id, Authentication auth) {
        return Result.success(service.generateReport(getDoctorId(auth), id));
    }

    @GetMapping("/{id}/report")
    public Result<ReportVO> getReport(@PathVariable Long id, Authentication auth) {
        return Result.success(service.getReport(getDoctorId(auth), id));
    }

    @PutMapping("/{id}/report")
    public Result<Void> updateReport(@PathVariable Long id,
                                      @Valid @RequestBody ReportUpdateRequest request,
                                      Authentication auth) {
        service.updateReport(getDoctorId(auth), id, request.getContent());
        return Result.success();
    }

    @PostMapping("/{id}/submit-report")
    public Result<QcResultVO> submitReport(@PathVariable Long id, Authentication auth) {
        return Result.success(service.submitReport(getDoctorId(auth), id));
    }

    @GetMapping("/{id}/qc-result")
    public Result<QcResultVO> getQcResult(@PathVariable Long id, Authentication auth) {
        return Result.success(service.getQcResult(getDoctorId(auth), id));
    }

    @PostMapping("/{id}/sign")
    public Result<Void> sign(@PathVariable Long id, Authentication auth) {
        service.signReport(getDoctorId(auth), id);
        return Result.success();
    }
}
