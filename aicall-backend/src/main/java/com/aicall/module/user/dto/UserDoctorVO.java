package com.aicall.module.user.dto;

import lombok.Data;

@Data
public class UserDoctorVO {
    private Long id;
    private String name;
    private String title;
    private String department;
    private String avatar;
    private String introduction;
}
