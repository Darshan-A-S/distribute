package com.sender.dto;

public record ResetPasswordRequest(String token, String newPassword) {}
