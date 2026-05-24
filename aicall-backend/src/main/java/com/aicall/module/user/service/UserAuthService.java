package com.aicall.module.user.service;

import cn.hutool.crypto.digest.DigestUtil;
import cn.hutool.core.util.RandomUtil;
import com.aicall.common.exception.BusinessException;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.user.dto.RegisterRequest;
import com.aicall.module.user.dto.UserLoginRequest;
import com.aicall.module.user.dto.UserLoginResponse;
import com.aicall.module.user.entity.Patient;
import com.aicall.module.user.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserAuthService {
    private final PatientMapper patientMapper;
    private final JwtTokenProvider jwtTokenProvider;

    public void register(RegisterRequest request) {
        Patient existing = patientMapper.findByPhone(request.getPhone());
        if (existing != null) {
            throw BusinessException.fail("该手机号已注册");
        }

        String salt = RandomUtil.randomString(32);
        String encryptedPassword = DigestUtil.md5Hex(request.getPassword() + salt);

        Patient patient = new Patient();
        patient.setPhone(request.getPhone());
        patient.setName(request.getName() != null ? request.getName() : "用户" + request.getPhone().substring(7));
        patient.setPassword(encryptedPassword);
        patient.setSalt(salt);
        patientMapper.insert(patient);
    }

    public UserLoginResponse login(UserLoginRequest request) {
        Patient patient = patientMapper.findByPhone(request.getPhone());
        if (patient == null) {
            throw BusinessException.fail("手机号未注册");
        }

        String encryptedPassword = DigestUtil.md5Hex(request.getPassword() + patient.getSalt());
        if (!encryptedPassword.equals(patient.getPassword())) {
            throw BusinessException.fail("密码错误");
        }

        String token = jwtTokenProvider.generateToken(patient.getId(), patient.getPhone(), "PATIENT");
        return new UserLoginResponse(token, patient.getId(), patient.getPhone());
    }
}