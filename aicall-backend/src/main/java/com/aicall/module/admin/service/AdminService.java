package com.aicall.module.admin.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.ResultCode;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.admin.dto.LoginRequest;
import com.aicall.module.admin.dto.LoginResponse;
import com.aicall.module.admin.entity.Admin;
import com.aicall.module.admin.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Admin admin = adminMapper.findByUsername(request.getUsername());
        if (admin == null || !passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw BusinessException.fail(ResultCode.UNAUTHORIZED.getCode(), "账号或密码错误");
        }
        if (admin.getStatus() != 1) {
            throw BusinessException.fail("账号已禁用");
        }
        String token = jwtTokenProvider.generateToken(admin.getId(), admin.getUsername(), "ADMIN");
        return new LoginResponse(token, admin.getUsername(), admin.getName());
    }
}
