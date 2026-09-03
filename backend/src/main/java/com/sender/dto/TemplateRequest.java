package com.sender.dto;

import lombok.Data;

@Data
public class TemplateRequest {
    private String name;
    private String subject;
    private String body;
    private String variablesJson;
}
