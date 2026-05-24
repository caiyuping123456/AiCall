package com.aicall.module.admin.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Admin {
    private Long id;
    private String username;
    private String password;
    private String name;
    private String phone;
    private Integer status;
    private Long roleId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
