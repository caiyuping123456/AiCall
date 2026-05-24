package com.aicall.module.consultation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Report {
    private Long id;
    private Long consultationId;
    private Integer type;       // 1=professional, 2=patient
    private String content;     // JSON LONGTEXT
    private String pdfUrl;
    private Integer status;     // 0=draft, 1=pending review, 2=issued
    private Long signedBy;
    private LocalDateTime signedTime;
    private Long templateId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
