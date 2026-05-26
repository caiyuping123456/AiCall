package com.aicall.module.user.controller;

import com.aicall.common.result.Result;
import com.aicall.module.user.dto.RegistrationRequest;
import com.aicall.module.user.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/registration")
@RequiredArgsConstructor
public class UserRegistrationController {
    private final RegistrationService registrationService;

    @PostMapping
    public Result<Long> register(@Valid @RequestBody RegistrationRequest request) {
        Long patientId = getCurrentPatientId();
        return Result.success(registrationService.register(patientId, request));
    }

    private Long getCurrentPatientId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long id) {
            return id;
        }
        throw new com.aicall.common.exception.BusinessException(com.aicall.common.result.ResultCode.UNAUTHORIZED);
    }
}