package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FormSubmitRequest {
    @NotBlank(message = "主诉不能为空")
    private String chiefComplaint;

    private String onsetTime;
    private String symptomDescription;
    private String pastHistory;
    private String allergyHistory;
}
