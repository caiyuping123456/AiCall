package com.aicall.module.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PatientListItemVO {
    private Long id;
    private String name;
    private String phone;
    private Integer gender;
    private Integer age;
    private Integer status;
    private Integer profileComplete;
    private LocalDateTime createTime;
}
