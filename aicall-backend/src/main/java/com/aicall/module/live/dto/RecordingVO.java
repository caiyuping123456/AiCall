package com.aicall.module.live.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RecordingVO {
    private Long id;
    private String fileUrl;
    private Long fileSize;
    private Integer duration;
    private LocalDateTime createTime;
}
