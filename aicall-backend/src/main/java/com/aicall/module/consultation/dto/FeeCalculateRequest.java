package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeeCalculateRequest {
    @NotNull(message = "会诊类型不能为空")
    private Integer type; // 1=单学科 2=MDT
}
