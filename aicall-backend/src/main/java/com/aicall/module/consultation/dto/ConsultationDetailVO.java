package com.aicall.module.consultation.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConsultationDetailVO {
    private Long id;
    private String consultationNo;
    private Integer type;
    private Integer status;
    private String department;
    private String chiefComplaint;
    private String medicalSummary;
    private BigDecimal fee;
    private Integer paymentStatus;
    private LocalDateTime createTime;
    private List<UploadItem> uploads;

    @Data
    public static class UploadItem {
        private Long id;
        private String fileName;
        private Integer fileType;
        private String fileUrl;
        private String ocrResult;
    }
}
