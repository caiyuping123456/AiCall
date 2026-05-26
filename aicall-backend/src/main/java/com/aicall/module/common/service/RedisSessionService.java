package com.aicall.module.common.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisSessionService {
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    private static final long SESSION_TTL_MINUTES = 30;
    private static final String SESSION_PREFIX = "session:";

    public void createSession(Long userId, String role, Map<String, Object> data) {
        String key = SESSION_PREFIX + role + ":" + userId;
        try {
            String json = objectMapper.writeValueAsString(data);
            stringRedisTemplate.opsForValue().set(key, json, Duration.ofMinutes(SESSION_TTL_MINUTES));
        } catch (Exception e) {
            log.error("Failed to create session for {}:{}", role, userId, e);
        }
    }

    public boolean refreshSession(Long userId, String role) {
        String key = SESSION_PREFIX + role + ":" + userId;
        try {
            String json = stringRedisTemplate.opsForValue().get(key);
            if (json == null) return false;
            stringRedisTemplate.expire(key, Duration.ofMinutes(SESSION_TTL_MINUTES));
            return true;
        } catch (Exception e) {
            log.error("Failed to refresh session for {}:{}", role, userId, e);
            return false;
        }
    }

    public Map<String, Object> getSession(Long userId, String role) {
        String key = SESSION_PREFIX + role + ":" + userId;
        try {
            String json = stringRedisTemplate.opsForValue().get(key);
            if (json == null) return null;
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to get session for {}:{}", role, userId, e);
            return null;
        }
    }

    public void destroySession(Long userId, String role) {
        String key = SESSION_PREFIX + role + ":" + userId;
        stringRedisTemplate.delete(key);
    }
}