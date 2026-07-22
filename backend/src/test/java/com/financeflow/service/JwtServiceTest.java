package com.financeflow.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "financeflow-secret-key-must-be-at-least-256-bits-long-for-hs256");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604800000L);
    }

    @Test
    void generateToken_And_ExtractUsername_Success() {
        UserDetails userDetails = new User("test@financeflow.com", "password", Collections.emptyList());

        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertEquals("test@financeflow.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }
}
