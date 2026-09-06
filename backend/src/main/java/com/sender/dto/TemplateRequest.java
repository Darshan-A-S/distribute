package com.sender.dto;

import lombok.Data;

@Data
public class TemplateRequest {
    private String name;
    private String subject;
    private String body;
    private String variablesJson;
    private String certificateImage;
    private String certificateTexts;
    private Integer certificateImageWidth;
    private Integer certificateImageHeight;
}
