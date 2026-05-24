package com.aicall.module.live.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LiveSubtitle {
    private Long id;
    private Long roomId;
    private Long userId;
    private String userName;
    private String content;
    private LocalDateTime createTime;
}
