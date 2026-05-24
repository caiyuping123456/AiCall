package com.aicall.module.admin.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.LoginRequest;
import com.aicall.module.admin.dto.LoginResponse;
import com.aicall.module.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/login")
    @Log("管理员登录")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(adminService.login(request));
    }
}
