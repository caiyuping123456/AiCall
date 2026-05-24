package com.aicall.module.evaluation.dto;

import lombok.Data;

@Data
public class SubmitEvaluationRequest {
    private Integer doctorScore;
    private Integer serviceScore;
    private String comment;
}
