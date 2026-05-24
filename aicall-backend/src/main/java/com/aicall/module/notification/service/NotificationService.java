package com.aicall.module.notification.service;

import com.aicall.infrastructure.websocket.WebSocketHandler;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.followup.entity.FollowUp;
import com.aicall.module.notification.dto.NotificationVO;
import com.aicall.module.notification.entity.Notification;
import com.aicall.module.notification.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationMapper notificationMapper;
    private final ConsultationMapper consultationMapper;
    private final WebSocketHandler webSocketHandler;

    @Transactional
    public void send(Integer userType, Long userId, String title, String content, List<Integer> types) {
        for (Integer type : types) {
            Notification n = new Notification();
            n.setUserType(userType);
            n.setUserId(userId);
            n.setType(type);
            n.setTitle(title);
            n.setContent(content);
            n.setStatus(1);
            n.setSendTime(LocalDateTime.now());
            if (type == 2 || type == 3) {
                notificationMapper.insert(n);
            }
        }
        if (types.contains(3)) {
            webSocketHandler.sendToUser(userId, buildWsMessage(title, content));
        }
    }

    private String buildWsMessage(String title, String content) {
        return "{\"type\":\"notification\",\"title\":\"" + title.replace("\"", "\\\"") +
                "\",\"content\":\"" + content.replace("\"", "\\\"") + "\"}";
    }

    public void sendFollowUpNotification(FollowUp fu) {
        Consultation c = consultationMapper.findById(fu.getConsultationId());
        String patientName = c != null && c.getPatientName() != null ? c.getPatientName() : "患者";
        send(1, fu.getPatientId(), "随访提醒",
                "您有一份第" + fu.getPlanDay() + "天随访问卷待填写", List.of(2, 3));
    }

    public void sendAbnormalAlert(Long consultationId, Long followUpId, String patientName, String level) {
        send(2, 0L, "随访异常告警",
                patientName + "的第" + followUpId + "号随访出现" + level, List.of(2));
    }

    public List<NotificationVO> getUserNotifications(Integer userType, Long userId, int page, int size) {
        int offset = (page - 1) * size;
        return notificationMapper.findByUserId(userType, userId, offset, size).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    public long getUnreadCount(Integer userType, Long userId) {
        return notificationMapper.countUnread(userType, userId);
    }

    @Transactional
    public void markRead(Long id) {
        notificationMapper.updateStatus(id, 2);
    }

    private NotificationVO toVO(Notification n) {
        NotificationVO vo = new NotificationVO();
        vo.setId(n.getId());
        vo.setUserType(n.getUserType());
        vo.setUserId(n.getUserId());
        vo.setType(n.getType());
        vo.setTitle(n.getTitle());
        vo.setContent(n.getContent());
        vo.setStatus(n.getStatus());
        vo.setSendTime(n.getSendTime());
        vo.setCreateTime(n.getCreateTime());
        return vo;
    }
}
