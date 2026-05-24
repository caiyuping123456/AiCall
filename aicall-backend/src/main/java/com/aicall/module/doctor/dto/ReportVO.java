package com.aicall.module.doctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportVO {
    private Long id;
    private String content;
    private Integer status;
    private String signedByName;
    private LocalDateTime signedTime;
    private QcResultVO qcResult;
}
