package com.aicall.module.user.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.common.service.RedisSessionService;
import com.aicall.module.user.dto.RegisterRequest;
import com.aicall.module.user.dto.UserLoginRequest;
import com.aicall.module.user.dto.UserLoginResponse;
import com.aicall.module.user.service.UserAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/auth")
@RequiredArgsConstructor
public class UserAuthController {
    private final UserAuthService userAuthService;
    private final RedisSessionService redisSessionService;

    @PostMapping("/register")
    @Log("用户注册")
    public Result<Void> register(@Valid @RequestBody RegisterRequest request) {
        userAuthService.register(request);
        return Result.success();
    }

    @PostMapping("/login")
    @Log("用户登录")
    public Result<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        return Result.success(userAuthService.login(request));
    }

    @PostMapping("/logout")
    @Log("用户登出")
    public Result<Void> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long userId) {
            redisSessionService.destroySession(userId, "PATIENT");
        }
        return Result.success(null);
    }
}
