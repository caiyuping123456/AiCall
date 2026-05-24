package com.aicall.module.live.dto;

import lombok.Data;

@Data
public class SaveRecordingRequest {
    private String fileUrl;
    private Long fileSize;
    private Integer duration;
}
