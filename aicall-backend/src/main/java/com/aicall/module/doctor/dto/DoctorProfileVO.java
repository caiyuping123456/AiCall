package com.aicall.module.doctor.dto;

import lombok.Data;

@Data
public class DoctorProfileVO {
    private Long id;
    private String name;
    private String title;
    private String department;
    private String phone;
    private String avatar;
    private String introduction;
}
