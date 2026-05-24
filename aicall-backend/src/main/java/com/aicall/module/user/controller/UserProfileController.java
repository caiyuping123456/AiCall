package com.aicall.module.user.controller;

import com.aicall.common.result.Result;
import com.aicall.module.user.dto.ProfileCompleteRequest;
import com.aicall.module.user.entity.Patient;
import com.aicall.module.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/profile")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService userProfileService;

    @PutMapping("/complete")
    public Result<Void> completeProfile(@Valid @RequestBody ProfileCompleteRequest request) {
        Long patientId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        userProfileService.completeProfile(patientId, request);
        return Result.success();
    }

    @GetMapping
    public Result<Patient> getProfile() {
        Long patientId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Result.success(userProfileService.getProfile(patientId));
    }
}
