package com.aicall.module.live.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LiveRecording {
    private Long id;
    private Long roomId;
    private String fileUrl;
    private Long fileSize;
    private Integer duration;
    private LocalDateTime createTime;
}
