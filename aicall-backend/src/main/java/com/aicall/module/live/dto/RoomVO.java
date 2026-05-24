package com.aicall.module.live.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RoomVO {
    private Long id;
    private Long consultationId;
    private String roomId;
    private Integer status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
}
