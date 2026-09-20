package com.sender.dto;

public record UsageDto(
        String plan,
        int dailyLimit,
        int usedToday,
        int remaining,
        String resetsAt
) {}