package com.financeflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";
    
    private final RedisTemplate<String, Object> redisTemplate;

    public void blacklistToken(String token, long expirationTimeMillis) {
        try {
            String key = BLACKLIST_PREFIX + token;
            long ttlSeconds = (expirationTimeMillis - System.currentTimeMillis()) / 1000;
            
            if (ttlSeconds > 0) {
                redisTemplate.opsForValue().set(key, "blacklisted", ttlSeconds, TimeUnit.SECONDS);
                log.debug("Token blacklisted with TTL {} seconds", ttlSeconds);
            }
        } catch (Exception e) {
            log.error("Failed to blacklist token: {}", e.getMessage());
        }
    }

    public boolean isBlacklisted(String token) {
        try {
            String key = BLACKLIST_PREFIX + token;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("Failed to check token blacklist: {}", e.getMessage());
            return false;
        }
    }
}
