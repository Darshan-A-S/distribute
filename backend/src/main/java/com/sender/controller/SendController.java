package com.sender.controller;

import com.sender.dto.SendRequest;
import com.sender.model.EmailTemplate;
import com.sender.model.Recipient;
import com.sender.repository.RecipientRepository;
import com.sender.service.EmailService;
import com.sender.service.ExcelService;
import com.sender.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/send")
@RequiredArgsConstructor
public class SendController {

    private final EmailService emailService;
    private final TemplateService templateService;
    private final ExcelService excelService;
    private final RecipientRepository recipientRepo;

    @PostMapping
    public ResponseEntity<Map<String, String>> send(@RequestBody SendRequest req) {
        EmailTemplate template = templateService.findById(req.getTemplateId());
        List<Recipient> recipients;

        if (req.getBatchName() != null && !req.getBatchName().isBlank()) {
            recipients = recipientRepo.findByUploadBatchAndSentFalse(req.getBatchName());
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "batchName is required"));
        }

        if (recipients.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No unsent recipients found in batch"));
        }

        emailService.sendBatch(template, recipients);

        return ResponseEntity.accepted().body(Map.of(
                "message", "Sending " + recipients.size() + " emails in background",
                "batchName", req.getBatchName()
        ));
    }

    @GetMapping("/status/{batchName}")
    public ResponseEntity<Map<String, Long>> status(@PathVariable String batchName) {
        long[] stats = excelService.getBatchStats(batchName);
        return ResponseEntity.ok(Map.of("sent", stats[0], "pending", stats[1]));
    }
}
