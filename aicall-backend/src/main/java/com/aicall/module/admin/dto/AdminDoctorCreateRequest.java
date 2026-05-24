package com.aicall.module.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminDoctorCreateRequest {
    @NotBlank(message = "姓名不能为空")
    private String name;
    private String title;
    private String department;
    private String phone;
    private String username;
    @NotBlank(message = "密码不能为空")
    private String password;
}
