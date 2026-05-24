package com.aicall.module.doctor.controller;

import com.aicall.common.result.Result;
import com.aicall.module.doctor.dto.DoctorLoginRequest;
import com.aicall.module.doctor.dto.DoctorLoginResponse;
import com.aicall.module.doctor.service.DoctorAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctor/auth")
@RequiredArgsConstructor
public class DoctorAuthController {
    private final DoctorAuthService doctorAuthService;

    @PostMapping("/login")
    public Result<DoctorLoginResponse> login(@Valid @RequestBody DoctorLoginRequest request) {
        return Result.success(doctorAuthService.login(request));
    }
}
