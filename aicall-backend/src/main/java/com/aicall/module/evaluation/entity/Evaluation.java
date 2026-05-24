package com.aicall.module.evaluation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Evaluation {
    private Long id;
    private Long consultationId;
    private Long patientId;
    private Integer doctorScore;
    private Integer serviceScore;
    private String comment;
    private LocalDateTime createTime;
    private String consultationNo;
}
