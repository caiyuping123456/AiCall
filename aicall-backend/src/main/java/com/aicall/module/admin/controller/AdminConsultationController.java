package com.aicall.module.admin.controller;

import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.AdminAssignDoctorsRequest;
import com.aicall.module.admin.dto.AdminConsultationCancelRequest;
import com.aicall.module.admin.dto.AdminConsultationDetailVO;
import com.aicall.module.admin.dto.AdminConsultationListItemVO;
import com.aicall.module.admin.service.AdminConsultationService;
import com.aicall.module.common.dto.PageResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/consultations")
@RequiredArgsConstructor
public class AdminConsultationController {
    private final AdminConsultationService adminConsultationService;

    @GetMapping
    public Result<PageResult<AdminConsultationListItemVO>> list(@RequestParam(required = false) Integer status,
                                                                @RequestParam(required = false) String keyword,
                                                                @RequestParam Integer page,
                                                                @RequestParam Integer size) {
        return Result.success(adminConsultationService.getConsultations(status, keyword, page, size));
    }

    @GetMapping("/{id}")
    public Result<AdminConsultationDetailVO> detail(@PathVariable Long id) {
        return Result.success(adminConsultationService.getConsultationDetail(id));
    }

    @PostMapping("/{id}/doctors")
    public Result<Void> assignDoctors(@PathVariable Long id,
                                       @Valid @RequestBody AdminAssignDoctorsRequest request) {
        adminConsultationService.assignDoctors(id, request);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    public Result<Void> cancel(@PathVariable Long id,
                               @Valid @RequestBody AdminConsultationCancelRequest request) {
        adminConsultationService.cancelConsultation(id, request.getReason());
        return Result.success();
    }
}