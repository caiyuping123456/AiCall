package com.aicall.module.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminDoctorDetailVO {
    private Long id;
    private String username;
    private String name;
    private String title;
    private String department;
    private String phone;
    private String introduction;
    private Integer status;
    private Long consultationCount;
    private List<AdminDoctorScheduleVO> recentSchedules;
}
