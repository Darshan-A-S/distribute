package com.sender.controller;

import com.sender.dto.ExcelPreview;
import com.sender.model.Recipient;
import com.sender.model.UserAccount;
import com.sender.repository.RecipientRepository;
import com.sender.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipients")
@RequiredArgsConstructor
public class RecipientController {

    private final ExcelService excelService;
    private final RecipientRepository recipientRepo;

    @GetMapping("/stats/daily")
    public List<Map<String, Object>> dailyStats(
            @RequestParam(defaultValue = "14") int days, Authentication auth) {
        LocalDate since = LocalDate.now().minusDays(days - 1L);
        List<Map<String, Object>> out = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            out.add(new LinkedHashMap<>(Map.of("date", since.plusDays(i), "count", 0L)));
        }
        Map<LocalDate, Long> byDay = new LinkedHashMap<>();
        recipientRepo.countSentByDay(ownerId(auth), since.atStartOfDay())
                .forEach(row -> byDay.put(toLocalDate(row[0]), ((Number) row[1]).longValue()));
        out.forEach(m -> {
            Long c = byDay.get(m.get("date"));
            if (c != null) m.put("count", c);
        });
        return out;
    }

    private static LocalDate toLocalDate(Object o) {
        if (o instanceof LocalDate ld) return ld;
        if (o instanceof java.sql.Date d) return d.toLocalDate();
        if (o instanceof java.sql.Timestamp t) return t.toLocalDateTime().toLocalDate();
        return LocalDate.parse(String.valueOf(o));
    }

    @PostMapping("/upload/preview")
    public ExcelPreview preview(@RequestParam("file") MultipartFile file) {
        return excelService.parseExcel(file);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("batchName") String batchName,
            @RequestParam("columnMapping") String columnMappingJson,
            Authentication auth) {
        Map<String, String> columnMapping = parseColumnMapping(columnMappingJson);
        List<Recipient> saved = excelService.saveRecipients(file, batchName, columnMapping, ownerId(auth));
        return ResponseEntity.ok(Map.of(
                "batchName", batchName,
                "count", saved.size()
        ));
    }

    @GetMapping("/batch/{batchName}")
    public List<Recipient> getBatch(@PathVariable String batchName, Authentication auth) {
        return excelService.getRecipients(batchName, ownerId(auth));
    }

    @GetMapping("/batches")
    public List<Map<String, Object>> batches(Authentication auth) {
        return excelService.getBatches(ownerId(auth));
    }

    @GetMapping("/batch/{batchName}/stats")
    public Map<String, Long> getBatchStats(@PathVariable String batchName, Authentication auth) {
        long[] stats = excelService.getBatchStats(batchName, ownerId(auth));
        return Map.of("sent", stats[0], "pending", stats[1]);
    }

    @DeleteMapping("/batch/{batchName}")
    public ResponseEntity<Void> deleteBatch(@PathVariable String batchName, Authentication auth) {
        excelService.deleteBatch(batchName, ownerId(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch/{batchName}/reset")
    public ResponseEntity<Map<String, Object>> resetBatch(@PathVariable String batchName, Authentication auth) {
        int count = excelService.resetBatch(batchName, ownerId(auth));
        return ResponseEntity.ok(Map.of("reset", count));
    }

    private Map<String, String> parseColumnMapping(String json) {
        Map<String, String> map = new LinkedHashMap<>();
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

    private Long ownerId(Authentication auth) {
        return ((UserAccount) auth.getPrincipal()).getId();
    }
}