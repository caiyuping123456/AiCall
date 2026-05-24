package com.aicall.module.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectRequest {
    @NotBlank(message = "拒绝原因不能为空")
    private String reason;
}
