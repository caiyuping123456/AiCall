package com.aicall.infrastructure.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // consultationId -> sessionId -> session
    private static final Map<String, Map<String, WebSocketSession>> ROOMS = new ConcurrentHashMap<>();

    // sessionId -> consultationId
    private static final Map<String, String> SESSION_ROOM = new ConcurrentHashMap<>();

    // sessionId -> userId + userName
    private static final Map<String, String[]> SESSION_USER = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode node = MAPPER.readTree(message.getPayload());
        String type = node.path("type").asText("");
        String consultationId = node.path("consultationId").asText("");

        switch (type) {
            case "join" -> handleJoin(session, consultationId,
                    node.path("userId").asText("0"),
                    node.path("userName").asText(""));
            case "leave" -> handleLeave(session, consultationId);
            case "subtitle" -> handleSubtitle(session, consultationId, node);
            default -> {}
        }
    }

    private void handleJoin(WebSocketSession session, String consultationId, String userId, String userName) throws Exception {
        log.info("[WS] join: consultationId={}, userId={}, userName={}, sessionId={}", consultationId, userId, userName, session.getId());
        ROOMS.computeIfAbsent(consultationId, k -> new ConcurrentHashMap<>()).put(session.getId(), session);
        SESSION_ROOM.put(session.getId(), consultationId);
        SESSION_USER.put(session.getId(), new String[]{userId, userName});

        ObjectNode notice = MAPPER.createObjectNode();
        notice.put("type", "notice");
        notice.put("message", userName + " 加入了会诊");
        broadcast(consultationId, notice, null);
    }

    private void handleLeave(WebSocketSession session, String consultationId) throws Exception {
        String[] userInfo = SESSION_USER.get(session.getId());
        String userName = userInfo != null ? userInfo[1] : "未知用户";

        Map<String, WebSocketSession> room = ROOMS.get(consultationId);
        if (room != null) {
            room.remove(session.getId());
            if (room.isEmpty()) ROOMS.remove(consultationId);
        }
        SESSION_ROOM.remove(session.getId());
        SESSION_USER.remove(session.getId());

        ObjectNode notice = MAPPER.createObjectNode();
        notice.put("type", "notice");
        notice.put("message", userName + " 离开了会诊");
        broadcast(consultationId, notice, session.getId());
    }

    private void handleSubtitle(WebSocketSession session, String consultationId, JsonNode node) throws Exception {
        String[] userInfo = SESSION_USER.get(session.getId());
        long userId = 0;
        if (userInfo != null) { try { userId = Long.parseLong(userInfo[0]); } catch (NumberFormatException e) {} }
        String userName = userInfo != null ? userInfo[1] : node.path("userName").asText("");

        ObjectNode subtitle = MAPPER.createObjectNode();
        subtitle.put("type", "subtitle");
        subtitle.put("userId", userId);
        subtitle.put("userName", userName);
        subtitle.put("text", node.path("text").asText(""));

        Map<String, WebSocketSession> room = ROOMS.get(consultationId);
        int roomSize = room != null ? room.size() : 0;
        log.info("[WS] subtitle: consultationId={}, userName={}, text={}, roomSize={}, excludeSession={}", consultationId, userName, node.path("text").asText(""), roomSize, session.getId());

        broadcast(consultationId, subtitle, session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String consultationId = SESSION_ROOM.remove(session.getId());
        SESSION_USER.remove(session.getId());
        if (consultationId != null) {
            Map<String, WebSocketSession> room = ROOMS.get(consultationId);
            if (room != null) {
                room.remove(session.getId());
                if (room.isEmpty()) ROOMS.remove(consultationId);
            }
        }
    }

    private void broadcast(String consultationId, ObjectNode message, String excludeSessionId) throws IOException {
        Map<String, WebSocketSession> room = ROOMS.get(consultationId);
        if (room == null) return;
        String payload = MAPPER.writeValueAsString(message);
        for (Map.Entry<String, WebSocketSession> entry : room.entrySet()) {
            if (entry.getKey().equals(excludeSessionId)) continue;
            WebSocketSession s = entry.getValue();
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(payload));
            }
        }
    }

    public void sendToUser(Long userId, String message) {
        for (Map<String, WebSocketSession> room : ROOMS.values()) {
            for (Map.Entry<String, WebSocketSession> entry : room.entrySet()) {
                String[] userInfo = SESSION_USER.get(entry.getKey());
                if (userInfo != null && userInfo[0].equals(String.valueOf(userId))) {
                    WebSocketSession s = entry.getValue();
                    if (s.isOpen()) {
                        try { s.sendMessage(new TextMessage(message)); } catch (IOException ignored) {}
                    }
                }
            }
        }
    }
}
