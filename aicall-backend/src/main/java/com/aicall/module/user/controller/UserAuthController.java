package com.aicall.module.user.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.user.dto.LoginByCodeRequest;
import com.aicall.module.user.dto.SendCodeRequest;
import com.aicall.module.user.dto.UserLoginResponse;
import com.aicall.module.user.service.UserAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/auth")
@RequiredArgsConstructor
public class UserAuthController {
    private final UserAuthService userAuthService;

    @PostMapping("/send-code")
    @Log("用户发送验证码")
    public Result<Void> sendCode(@Valid @RequestBody SendCodeRequest request) {
        userAuthService.sendCode(request);
        return Result.success();
    }

    @PostMapping("/login")
    @Log("用户验证码登录")
    public Result<UserLoginResponse> login(@Valid @RequestBody LoginByCodeRequest request) {
        return Result.success(userAuthService.login(request));
    }
}
