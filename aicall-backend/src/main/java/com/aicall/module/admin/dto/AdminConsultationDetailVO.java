package com.aicall.module.admin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminConsultationDetailVO {
    private Long id;
    private String consultationNo;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
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
    private LocalDateTime createTime;
    private String minutes;
    private ReportVO report;
    private List<AssignedDoctorVO> assignedDoctors;
    private List<UploadItemVO> uploads;

    @Data
    public static class AssignedDoctorVO {
        private Long doctorId;
        private String name;
        private String title;
        private String department;
        private Integer role;
        private Integer confirmStatus;
    }

    @Data
    public static class ReportVO {
        private Long id;
        private String content;
        private Integer status;
        private String signedByName;
        private String signedTime;
    }

    @Data
    public static class UploadItemVO {
        private Long id;
        private String fileName;
        private String fileUrl;
        private Integer fileType;
        private String ocrResult;
    }
}