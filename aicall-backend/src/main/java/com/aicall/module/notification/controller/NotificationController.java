package com.aicall.module.notification.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.notification.dto.NotificationVO;
import com.aicall.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/notification")
    @Log("患者通知列表")
    public Result<List<NotificationVO>> userNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size, Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        return Result.success(notificationService.getUserNotifications(1, patientId, page, size));
    }

    @GetMapping("/user/notification/unread-count")
    @Log("患者未读通知数")
    public Result<Map<String, Long>> userUnread(Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        Map<String, Long> result = new HashMap<>();
        result.put("count", notificationService.getUnreadCount(1, patientId));
        return Result.success(result);
    }

    @PutMapping("/user/notification/{id}/read")
    @Log("标记已读")
    public Result<Void> read(@PathVariable Long id) {
        notificationService.markRead(id);
        return Result.success();
    }

    @GetMapping("/doctor/notification")
    @Log("医生通知列表")
    public Result<List<NotificationVO>> doctorNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size, Authentication auth) {
        Long doctorId = (Long) auth.getPrincipal();
        return Result.success(notificationService.getUserNotifications(2, doctorId, page, size));
    }

    @GetMapping("/doctor/notification/unread-count")
    @Log("医生未读通知数")
    public Result<Map<String, Long>> doctorUnread(Authentication auth) {
        Long doctorId = (Long) auth.getPrincipal();
        Map<String, Long> result = new HashMap<>();
        result.put("count", notificationService.getUnreadCount(2, doctorId));
        return Result.success(result);
    }

    @PutMapping("/doctor/notification/{id}/read")
    @Log("医生标记已读")
    public Result<Void> doctorRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return Result.success();
    }
}
