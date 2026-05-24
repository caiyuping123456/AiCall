package com.aicall.module.consultation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QcResult {
    private Long id;
    private Long reportId;
    private Integer completenessScore;
    private Integer standardScore;
    private Integer consistencyScore;
    private Integer totalScore;
    private String issues;      // JSON TEXT
    private Integer status;     // 0=pending, 1=passed, 2=returned
    private LocalDateTime createTime;
}
