package com.sender.dto;

public record ProfileRequest(
        String email,
        String smtpHost,
        Integer smtpPort,
        String smtpUsername,
        String smtpPassword,
        Boolean startTls
) {}