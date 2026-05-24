package com.aicall.module.consultation.entity;

import lombok.Data;

@Data
public class ReportTemplate {
    private Long id;
    private String name;
    private String department;
    private String contentTemplate; // JSON LONGTEXT
    private Integer status;
}
