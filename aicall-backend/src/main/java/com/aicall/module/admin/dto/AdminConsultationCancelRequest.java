package com.aicall.module.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminConsultationCancelRequest {
    @NotBlank(message = "取消原因不能为空")
    private String reason;
}