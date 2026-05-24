package com.aicall.module.evaluation.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvaluationVO {
    private Long id;
    private Long consultationId;
    private Integer doctorScore;
    private Integer serviceScore;
    private String comment;
    private LocalDateTime createTime;
    private String consultationNo;
}
