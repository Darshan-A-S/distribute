package com.sender.dto;

public record UserDto(
        Long id,
        String username,
        String email,
        String smtpHost,
        Integer smtpPort,
        String smtpUsername
) {}
