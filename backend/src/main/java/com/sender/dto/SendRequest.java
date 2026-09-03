package com.sender.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SendRequest {
    private Long templateId;
    private String batchName;
    private Map<String, String> columnMapping;
}
