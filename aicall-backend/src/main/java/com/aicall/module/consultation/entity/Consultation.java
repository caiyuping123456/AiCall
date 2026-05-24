package com.aicall.module.consultation.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Consultation {
    private Long id;
    private String consultationNo;
    private Long patientId;
    private Integer type;
    private Integer status;
    private String department;
    private String chiefComplaint;
    private String medicalSummary;
    private BigDecimal fee;
    private Integer paymentStatus;
    private LocalDateTime scheduledTime;
    private LocalDateTime endTime;
    private String cancelReason;
    private String rejectReason;
    private String minutes;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    // Fields from patient table (via JOIN)
    private String patientName;
    private Integer patientAge;
    private String patientGender;

    // JOIN fields from evaluation table
    private Integer doctorScore;
    private Integer serviceScore;
    private String evaluationComment;
}
