package com.aicall.infrastructure.websocket;

import com.aicall.module.live.entity.LiveSubtitle;
import com.aicall.module.live.entity.LiveRoom;
import com.aicall.module.live.mapper.LiveRoomMapper;
import com.aicall.module.live.mapper.LiveSubtitleMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);

    private final Map<String, CopyOnWriteArrayList<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionRoom = new ConcurrentHashMap<>();
    private final Map<String, Long> sessionUserId = new ConcurrentHashMap<>();
    private final Map<String, String> sessionUserName = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper;
    private final LiveSubtitleMapper liveSubtitleMapper;
    private final LiveRoomMapper liveRoomMapper;

    public WebSocketHandler(ObjectMapper objectMapper,
                            LiveSubtitleMapper liveSubtitleMapper,
                            LiveRoomMapper liveRoomMapper) {
        this.objectMapper = objectMapper;
        this.liveSubtitleMapper = liveSubtitleMapper;
        this.liveRoomMapper = liveRoomMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        JsonNode node = objectMapper.readTree(payload);
        String type = node.get("type").asText();
        String consultationId = node.has("consultationId") ? node.get("consultationId").asText() : null;

        switch (type) {
            case "join" -> {
                Long userId = node.get("userId").asLong();
                String userName = node.has("userName") ? node.get("userName").asText() : "";
                sessionRoom.put(session.getId(), consultationId);
                sessionUserId.put(session.getId(), userId);
                sessionUserName.put(session.getId(), userName);
                roomSessions.computeIfAbsent(consultationId, k -> new CopyOnWriteArrayList<>()).add(session);
                broadcast(consultationId, buildNotice(consultationId, userName + " 加入了会诊"));
                log.info("User {} joined room {}", userId, consultationId);
            }
            case "leave" -> removeSession(session);
            case "subtitle" -> {
                Long userId = node.get("userId").asLong();
                String userName = node.has("userName") ? node.get("userName").asText() : "";
                String text = node.get("text").asText();

                // Resolve roomId: prefer explicit field, otherwise look up from consultation
                Long roomId = node.has("roomId") ? node.get("roomId").asLong() : null;
                if (roomId == null && consultationId != null) {
                    LiveRoom room = liveRoomMapper.findByConsultationId(Long.parseLong(consultationId));
                    if (room != null) roomId = room.getId();
                }

                LiveSubtitle subtitle = new LiveSubtitle();
                subtitle.setRoomId(roomId);
                subtitle.setUserId(userId);
                subtitle.setUserName(userName);
                subtitle.setContent(text);
                try {
                    liveSubtitleMapper.insert(subtitle);
                } catch (Exception e) {
                    log.warn("Failed to persist subtitle: {}", e.getMessage());
                }

                broadcast(consultationId, buildSubtitle(consultationId, userId, userName, text));
            }
            case "notice" -> {
                String msg = node.get("message").asText();
                broadcast(consultationId, buildNotice(consultationId, msg));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        removeSession(session);
        log.info("WebSocket disconnected: {}, status: {}", session.getId(), status);
    }

    private void removeSession(WebSocketSession session) {
        String consultationId = sessionRoom.remove(session.getId());
        sessionUserId.remove(session.getId());
        String userName = sessionUserName.remove(session.getId());
        if (consultationId != null) {
            CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(consultationId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) roomSessions.remove(consultationId);
            }
            broadcast(consultationId, buildNotice(consultationId, (userName != null ? userName : "某人") + " 离开了会诊"));
        }
    }

    public void sendToUser(Long userId, String message) {
        for (Map.Entry<String, Long> entry : sessionUserId.entrySet()) {
            if (entry.getValue().equals(userId)) {
                String roomKey = sessionRoom.get(entry.getKey());
                if (roomKey != null) {
                    CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(roomKey);
                    if (sessions != null) {
                        TextMessage textMessage = new TextMessage(message);
                        for (WebSocketSession s : sessions) {
                            if (s.getId().equals(entry.getKey()) && s.isOpen()) {
                                try { s.sendMessage(textMessage); } catch (IOException ignored) {}
                            }
                        }
                    }
                }
            }
        }
    }

    private void broadcast(String consultationId, String message) {
        CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(consultationId);
        if (sessions == null) return;
        TextMessage textMessage = new TextMessage(message);
        for (WebSocketSession s : sessions) {
            try {
                if (s.isOpen()) s.sendMessage(textMessage);
            } catch (IOException e) {
                log.error("Failed to send to session {}", s.getId(), e);
            }
        }
    }

    private String buildNotice(String consultationId, String msg) {
        return "{\"type\":\"notice\",\"consultationId\":\"" + consultationId + "\",\"message\":\"" +
                msg.replace("\"", "\\\"") + "\"}";
    }

    private String buildSubtitle(String consultationId, Long userId, String userName, String text) {
        return "{\"type\":\"subtitle\",\"consultationId\":\"" + consultationId + "\",\"userId\":" +
                userId + ",\"userName\":\"" + userName.replace("\"", "\\\"") +
                "\",\"text\":\"" + text.replace("\"", "\\\"") + "\"}";
    }
}
