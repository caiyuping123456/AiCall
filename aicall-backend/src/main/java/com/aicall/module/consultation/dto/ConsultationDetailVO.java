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
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String doctorName;
    private String doctorTitle;
    private String doctorDepartment;
    private BigDecimal fee;
    private Integer paymentStatus;
    private LocalDateTime createTime;
    private String minutes;
    private ReportInfo report;
    private List<UploadItem> uploads;

    @Data
    public static class ReportInfo {
        private Long id;
        private String content;
        private Integer status;
        private String signedByName;
        private String signedTime;
    }

    @Data
    public static class UploadItem {
        private Long id;
        private String fileName;
        private Integer fileType;
        private String fileUrl;
        private String ocrResult;
    }
}
