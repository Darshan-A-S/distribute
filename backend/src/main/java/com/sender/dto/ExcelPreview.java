package com.sender.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ExcelPreview {
    private List<String> headers;
    private List<Map<String, String>> rows;
    private int totalRows;
}
