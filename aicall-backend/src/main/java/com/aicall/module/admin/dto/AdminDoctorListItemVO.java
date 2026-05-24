package com.aicall.module.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminDoctorListItemVO {
    private Long id;
    private String name;
    private String title;
    private String department;
    private String phone;
    private Integer status;
    private LocalDateTime createTime;
}
