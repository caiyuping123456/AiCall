package com.aicall.module.admin.controller;

import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.PatientListItemVO;
import com.aicall.module.admin.dto.PatientStatusRequest;
import com.aicall.module.admin.service.AdminPatientService;
import com.aicall.module.common.dto.PageResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/patients")
@RequiredArgsConstructor
public class AdminPatientController {
    private final AdminPatientService adminPatientService;

    @GetMapping
    public Result<PageResult<PatientListItemVO>> list(@RequestParam(required = false) String keyword,
                                                       @RequestParam Integer page,
                                                       @RequestParam Integer size) {
        return Result.success(adminPatientService.getPatients(keyword, page, size));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @Valid @RequestBody PatientStatusRequest request) {
        adminPatientService.updateStatus(id, request.getStatus());
        return Result.success();
    }

    @PutMapping("/{id}/reset-password")
    public Result<Void> resetPassword(@PathVariable Long id) {
        adminPatientService.resetPassword(id);
        return Result.success();
    }
}
