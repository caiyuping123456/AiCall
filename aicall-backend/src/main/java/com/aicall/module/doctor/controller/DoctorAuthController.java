package com.aicall.module.doctor.controller;

import com.aicall.common.result.Result;
import com.aicall.module.common.service.RedisSessionService;
import com.aicall.module.doctor.dto.DoctorLoginRequest;
import com.aicall.module.doctor.dto.DoctorLoginResponse;
import com.aicall.module.doctor.service.DoctorAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/doctor/auth")
@RequiredArgsConstructor
public class DoctorAuthController {
    private final DoctorAuthService doctorAuthService;
    private final RedisSessionService redisSessionService;

    @PostMapping("/login")
    public Result<DoctorLoginResponse> login(@Valid @RequestBody DoctorLoginRequest request) {
        return Result.success(doctorAuthService.login(request));
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long userId) {
            redisSessionService.destroySession(userId, "DOCTOR");
        }
        return Result.success(null);
    }
}
