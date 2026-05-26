package com.aicall.module.admin.dto;

import lombok.Data;

@Data
public class TimelineItemVO {
    private Integer status;
    private String label;
    private String time;
    private String operator;
}
