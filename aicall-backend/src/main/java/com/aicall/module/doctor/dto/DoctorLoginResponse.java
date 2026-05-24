package com.aicall.module.doctor.dto;

import lombok.Data;

@Data
public class DoctorLoginResponse {
    private String token;
    private Long doctorId;
    private String name;
    private String department;
    private String title;
}
