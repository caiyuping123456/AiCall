package com.aicall.module.notification.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationVO {
    private Long id;
    private Integer userType;
    private Long userId;
    private Integer type;
    private String title;
    private String content;
    private Integer status;
    private LocalDateTime sendTime;
    private LocalDateTime createTime;
}
