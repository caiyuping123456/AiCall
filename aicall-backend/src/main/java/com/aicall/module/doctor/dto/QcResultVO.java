package com.aicall.module.doctor.dto;

import lombok.Data;

@Data
public class QcResultVO {
    private Long id;
    private Integer completenessScore;
    private Integer standardScore;
    private Integer consistencyScore;
    private Integer totalScore;
    private String issues;
    private Integer status;
}
