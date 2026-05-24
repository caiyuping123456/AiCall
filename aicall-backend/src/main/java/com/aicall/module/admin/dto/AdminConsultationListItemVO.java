package com.aicall.module.admin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AdminConsultationListItemVO {
    private Long id;
    private String consultationNo;
    private String patientName;
    private String department;
    private Integer status;
    private BigDecimal fee;
    private Integer paymentStatus;
    private LocalDateTime createTime;
}