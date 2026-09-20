package com.sender.dto;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String username,
        String email,
        Boolean emailVerified,
        String role,
        String plan,
        LocalDateTime createdAt
) {}
