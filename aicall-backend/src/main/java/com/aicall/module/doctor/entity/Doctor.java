package com.aicall.module.doctor.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Doctor {
    private Long id;
    private String username;
    private String password;
    private String name;
    private String title;
    private String department;
    private String phone;
    private String avatar;
    private String introduction;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
