package com.sender.dto;

public record ChangePasswordRequest(String currentPassword, String newPassword) {}
