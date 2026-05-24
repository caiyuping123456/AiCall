package com.aicall.module.doctor.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.doctor.dto.LoginRequest;
import com.aicall.module.doctor.dto.LoginResponse;
import com.aicall.module.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;

    @PostMapping("/login")
    @Log("医生登录")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(doctorService.login(request));
    }
}
