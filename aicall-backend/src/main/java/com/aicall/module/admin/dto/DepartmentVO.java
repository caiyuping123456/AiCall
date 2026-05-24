package com.aicall.module.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DepartmentVO {
    private Long id;
    private String name;
    private String description;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
