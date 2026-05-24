package com.aicall.module.user.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Patient {
    private Long id;
    private String name;
    private String phone;
    private Integer gender;
    private Integer age;
    private String idCard;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
