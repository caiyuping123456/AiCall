package com.aicall.module.user.service;

import com.aicall.module.user.dto.ProfileCompleteRequest;
import com.aicall.module.user.entity.Patient;
import com.aicall.module.user.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final PatientMapper patientMapper;

    public void completeProfile(Long patientId, ProfileCompleteRequest request) {
        patientMapper.updateProfile(patientId, request.getName(), request.getAge(), request.getGender());
    }

    public Patient getProfile(Long patientId) {
        return patientMapper.findById(patientId);
    }
}
