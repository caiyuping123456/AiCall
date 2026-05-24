package com.aicall.module.notification.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Notification {
    private Long id;
    private Integer userType;
    private Long userId;
    private String phone;
    private Integer type;
    private String title;
    private String content;
    private Integer status;
    private LocalDateTime sendTime;
    private LocalDateTime createTime;
}
