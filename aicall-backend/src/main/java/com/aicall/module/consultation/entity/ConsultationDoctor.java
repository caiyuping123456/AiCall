package com.aicall.module.consultation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationDoctor {
    private Long consultationId;
    private Long doctorId;
    private Integer role;       // 0=expert, 1=host
    private Integer status;     // 0=pending, 1=confirmed, 2=refused
    private LocalDateTime confirmTime;
}
