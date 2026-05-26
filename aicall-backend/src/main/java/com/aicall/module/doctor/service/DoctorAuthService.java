package com.aicall.module.doctor.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.common.service.RedisSessionService;
import com.aicall.module.doctor.dto.DoctorLoginRequest;
import com.aicall.module.doctor.dto.DoctorLoginResponse;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DoctorAuthService {
    private final DoctorMapper doctorMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisSessionService redisSessionService;

    public DoctorLoginResponse login(DoctorLoginRequest request) {
        Doctor doctor = doctorMapper.findByUsername(request.getUsername());
        if (doctor == null) {
            throw BusinessException.fail("用户名或密码错误");
        }
        if (!passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
            throw BusinessException.fail("用户名或密码错误");
        }
        if (doctor.getStatus() != 1) {
            throw BusinessException.fail("账号已被禁用");
        }
        String token = jwtTokenProvider.generateToken(doctor.getId(), doctor.getUsername(), "DOCTOR");
        redisSessionService.createSession(doctor.getId(), "DOCTOR",
                Map.of("doctorId", doctor.getId(), "name", doctor.getName(), "department", doctor.getDepartment(), "title", doctor.getTitle()));
        DoctorLoginResponse resp = new DoctorLoginResponse();
        resp.setToken(token);
        resp.setDoctorId(doctor.getId());
        resp.setName(doctor.getName());
        resp.setDepartment(doctor.getDepartment());
        resp.setTitle(doctor.getTitle());
        return resp;
    }
}
