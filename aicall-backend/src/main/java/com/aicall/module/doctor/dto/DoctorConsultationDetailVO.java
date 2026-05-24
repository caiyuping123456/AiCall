package com.aicall.module.doctor.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class DoctorConsultationDetailVO {
    private Long consultationId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String chiefComplaint;
    private String medicalSummary;
    private Integer status;
    private LocalDateTime createTime;
    private List<UploadItem> uploads;
    private List<Map<String, String>> chatHistory;
    private ReportVO report;

    @Data
    public static class UploadItem {
        private Long id;
        private String fileName;
        private String fileUrl;
        private Integer fileType;
        private String ocrResult;
    }
}
