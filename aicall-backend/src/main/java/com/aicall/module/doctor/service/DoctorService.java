package com.aicall.module.doctor.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.ResultCode;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.doctor.dto.LoginRequest;
import com.aicall.module.doctor.dto.LoginResponse;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorMapper doctorMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Doctor doctor = doctorMapper.findByUsername(request.getUsername());
        if (doctor == null || !passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
            throw BusinessException.fail(ResultCode.DOCTOR_LOGIN_FAILED);
        }
        if (doctor.getStatus() != 1) {
            throw BusinessException.fail(ResultCode.DOCTOR_ACCOUNT_DISABLED);
        }
        String token = jwtTokenProvider.generateToken(doctor.getId(), doctor.getUsername(), "DOCTOR");
        return new LoginResponse(token, doctor.getUsername(), doctor.getName());
    }
}
