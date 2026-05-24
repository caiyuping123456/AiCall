package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDraftRequest {
    @NotBlank(message = "主诉不能为空")
    private String chiefComplaint;

    private String department;
}
