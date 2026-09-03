package com.sender.controller;

import com.sender.dto.ExcelPreview;
import com.sender.model.Recipient;
import com.sender.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipients")
@RequiredArgsConstructor
public class RecipientController {

    private final ExcelService excelService;

    @PostMapping("/upload/preview")
    public ExcelPreview preview(@RequestParam("file") MultipartFile file) {
        return excelService.parseExcel(file);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("batchName") String batchName,
            @RequestParam("columnMapping") String columnMappingJson) {
        // Parse column mapping from JSON string
        Map<String, String> columnMapping = parseColumnMapping(columnMappingJson);
        List<Recipient> saved = excelService.saveRecipients(file, batchName, columnMapping);
        return ResponseEntity.ok(Map.of(
                "batchName", batchName,
                "count", saved.size()
        ));
    }

    @GetMapping("/batch/{batchName}")
    public List<Recipient> getBatch(@PathVariable String batchName) {
        return excelService.getRecipients(batchName);
    }

    @GetMapping("/batch/{batchName}/stats")
    public Map<String, Long> getBatchStats(@PathVariable String batchName) {
        long[] stats = excelService.getBatchStats(batchName);
        return Map.of("sent", stats[0], "pending", stats[1]);
    }

    @DeleteMapping("/batch/{batchName}")
    public ResponseEntity<Void> deleteBatch(@PathVariable String batchName) {
        excelService.deleteBatch(batchName);
        return ResponseEntity.noContent().build();
    }

    private Map<String, String> parseColumnMapping(String json) {
        Map<String, String> map = new java.util.LinkedHashMap<>();
        String cleaned = json.trim();
        if (cleaned.startsWith("{")) cleaned = cleaned.substring(1);
        if (cleaned.endsWith("}")) cleaned = cleaned.substring(0, cleaned.length() - 1);

        String[] pairs = cleaned.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        for (String pair : pairs) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                map.put(kv[0].replace("\"", "").trim(), kv[1].replace("\"", "").trim());
            }
        }
        return map;
    }
}
