package com.aicall.module.admin.dto;

import lombok.Data;

@Data
public class AdminLoginResponse {
    private String token;
    private Long adminId;
    private String name;
    private String role;
}
