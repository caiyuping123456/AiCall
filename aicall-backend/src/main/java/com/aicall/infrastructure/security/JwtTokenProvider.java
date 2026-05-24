package com.aicall.infrastructure.security;

import com.aicall.common.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(Long userId, String username, String role) {
        return JwtUtil.generateToken(secret, expiration, String.valueOf(userId),
                Map.of("username", username, "role", role));
    }

    public Claims parseToken(String token) {
        return JwtUtil.parseToken(secret, token);
    }

    public boolean validateToken(String token) {
        return JwtUtil.isTokenValid(secret, token);
    }

    public Long getUserId(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getUsername(String token) {
        Claims claims = parseToken(token);
        return claims.get("username", String.class);
    }

    public String getRole(String token) {
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }
}
