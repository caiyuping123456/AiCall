package com.aicall.module.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportUpdateRequest {
    @NotBlank(message = "报告内容不能为空")
    private String content;
}
