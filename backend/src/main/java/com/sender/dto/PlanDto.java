package com.sender.dto;

import java.util.List;

public record PlanDto(
        String id,
        String name,
        int dailyLimit,
        String price,
        String priceNote,
        List<String> features
) {}