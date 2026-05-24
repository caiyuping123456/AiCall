package com.aicall.module.consultation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationUpload {
    private Long id;
    private Long consultationId;
    private String fileName;
    private Integer fileType;
    private String fileUrl;
    private Long fileSize;
    private String ocrResult;
    private String aiReview;
    private LocalDateTime createTime;
}
