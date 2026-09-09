package com.sender.dto;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String username,
        String email,
        Boolean emailVerified,
        String smtpHost,
        Integer smtpPort,
        String smtpUsername,
        String role,
        LocalDateTime createdAt
) {}
