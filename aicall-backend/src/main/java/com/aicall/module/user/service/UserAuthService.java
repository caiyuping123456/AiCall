package com.aicall.module.user.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.user.dto.LoginByCodeRequest;
import com.aicall.module.user.dto.SendCodeRequest;
import com.aicall.module.user.dto.UserLoginResponse;
import com.aicall.module.user.entity.Patient;
import com.aicall.module.user.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserAuthService {
    private static final String SMS_KEY_PREFIX = "sms:";
    private static final long CODE_TTL_MINUTES = 5;

    private final PatientMapper patientMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    public void sendCode(SendCodeRequest request) {
        String code = "123456";
        String key = SMS_KEY_PREFIX + request.getPhone();
        redisTemplate.opsForValue().set(key, code, CODE_TTL_MINUTES, TimeUnit.MINUTES);
    }

    public UserLoginResponse login(LoginByCodeRequest request) {
        String key = SMS_KEY_PREFIX + request.getPhone();
        Object storedCode = redisTemplate.opsForValue().get(key);
        if (storedCode == null || !storedCode.equals(request.getCode())) {
            throw BusinessException.fail("验证码错误或已过期");
        }
        redisTemplate.delete(key);

        Patient patient = patientMapper.findByPhone(request.getPhone());
        if (patient == null) {
            patient = new Patient();
            patient.setPhone(request.getPhone());
            patient.setName("用户" + request.getPhone().substring(7));
            patientMapper.insert(patient);
        }

        String token = jwtTokenProvider.generateToken(patient.getId(), patient.getPhone(), "PATIENT");
        return new UserLoginResponse(token, patient.getId(), patient.getPhone());
    }
}
