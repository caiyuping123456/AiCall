package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SummaryUpdateRequest {
    @NotBlank(message = "摘要不能为空")
    private String medicalSummary;
}
