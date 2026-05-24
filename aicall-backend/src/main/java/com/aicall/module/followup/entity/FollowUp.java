package com.aicall.module.followup.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FollowUp {
    private Long id;
    private Long consultationId;
    private Long patientId;
    private Integer planDay;
    private String questionnaire;
    private String answer;
    private String aiAnalysis;
    private Integer status;
    private LocalDateTime sendTime;
    private LocalDateTime answerTime;
    private LocalDateTime createTime;
    private String consultationNo;
    private String patientName;
}
