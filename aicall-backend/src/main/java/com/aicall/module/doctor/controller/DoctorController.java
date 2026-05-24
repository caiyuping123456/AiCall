package com.aicall.module.doctor.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.doctor.dto.*;
import com.aicall.module.doctor.service.DoctorConsultationService;
import com.aicall.module.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;
    private final DoctorConsultationService consultationService;

    @PostMapping("/login")
    @Log("医生登录")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(doctorService.login(request));
    }

    @GetMapping("/workbench")
    public Result<WorkbenchVO> workbench(Authentication auth) {
        return Result.success(consultationService.getWorkbench((Long) auth.getPrincipal()));
    }

    @GetMapping("/profile")
    public Result<DoctorProfileVO> profile(Authentication auth) {
        return Result.success(consultationService.getProfile((Long) auth.getPrincipal()));
    }
}
