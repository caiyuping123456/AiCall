package com.aicall.module.live.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LiveRoom {
    private Long id;
    private Long consultationId;
    private String roomId;
    private Integer status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
