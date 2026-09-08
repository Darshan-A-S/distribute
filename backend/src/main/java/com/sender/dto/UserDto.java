package com.sender.dto;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String username,
        String email,
        String smtpHost,
        Integer smtpPort,
        String smtpUsername,
        String role,
        LocalDateTime createdAt
) {}
