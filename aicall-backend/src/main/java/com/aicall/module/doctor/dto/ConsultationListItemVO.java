package com.aicall.module.doctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationListItemVO {
    private Long consultationId;
    private String patientName;
    private String chiefComplaint;
    private String department;
    private Integer status;
    private LocalDateTime createTime;
}
