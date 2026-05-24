package com.aicall.module.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminDoctorStatusRequest {
    @NotNull(message = "状态不能为空")
    private Integer status;
}
