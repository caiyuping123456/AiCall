package com.aicall.module.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentCreateRequest {
    @NotBlank(message = "科室名称不能为空")
    private String name;

    private String description;
}
