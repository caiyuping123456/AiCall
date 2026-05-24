package com.aicall.module.admin.service;

import com.aicall.module.admin.dto.AdminDoctorCreateRequest;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDoctorServiceTest {

    @Mock
    private DoctorMapper doctorMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private AdminDoctorService adminDoctorService;

    @Test
    void createDoctorEncodesPasswordAndGeneratesUsername() {
        AdminDoctorCreateRequest request = new AdminDoctorCreateRequest();
        request.setName("张医生");
        request.setTitle("主任医师");
        request.setDepartment("内科");
        request.setPhone("13800000000");
        request.setPassword("123456");

        when(passwordEncoder.encode("123456")).thenReturn("encoded-password");

        adminDoctorService.createDoctor(request);

        ArgumentCaptor<Doctor> captor = ArgumentCaptor.forClass(Doctor.class);
        verify(doctorMapper).insert(captor.capture());
        Doctor doctor = captor.getValue();
        assertTrue(doctor.getUsername().startsWith("doctor_"));
        assertEquals("encoded-password", doctor.getPassword());
        assertEquals("张医生", doctor.getName());
    }
}
