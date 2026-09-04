package com.sender.controller;

import com.sender.dto.SendRequest;
import com.sender.model.EmailTemplate;
import com.sender.model.Recipient;
import com.sender.model.SendJob;
import com.sender.model.UserAccount;
import com.sender.repository.RecipientRepository;
import com.sender.repository.SendJobRepository;
import com.sender.service.EmailService;
import com.sender.service.ExcelService;
import com.sender.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    private final SendJobRepository sendJobRepo;

    @PostMapping
    public ResponseEntity<Map<String, String>> send(@RequestBody SendRequest req, Authentication auth) {
        Long ownerId = ownerId(auth);
        EmailTemplate template = templateService.findById(req.getTemplateId(), ownerId);
        List<Recipient> recipients;

        if (req.getBatchName() != null && !req.getBatchName().isBlank()) {
            recipients = recipientRepo.findByOwnerIdAndUploadBatchAndSentFalse(ownerId, req.getBatchName());
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "batchName is required"));
        }

        if (recipients.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No unsent recipients found in batch"));
        }

        SendJob job = sendJobRepo.save(SendJob.builder()
                .ownerId(ownerId)
                .batchName(req.getBatchName())
                .templateName(template.getName())
                .total(recipients.size())
                .status("RUNNING")
                .startedAt(LocalDateTime.now())
                .build());

        emailService.sendBatch(template, recipients, job);

        return ResponseEntity.accepted().body(Map.of(
                "message", "Sending " + recipients.size() + " emails in background",
                "batchName", req.getBatchName()
        ));
    }

    @GetMapping("/status/{batchName}")
    public ResponseEntity<Map<String, Long>> status(@PathVariable String batchName, Authentication auth) {
        long[] stats = excelService.getBatchStats(batchName, ownerId(auth));
        return ResponseEntity.ok(Map.of("sent", stats[0], "pending", stats[1]));
    }

    @GetMapping("/recent")
    public List<SendJob> recent(Authentication auth) {
        return sendJobRepo.findTop10ByOwnerIdOrderByStartedAtDesc(ownerId(auth));
    }

    private Long ownerId(Authentication auth) {
        return ((UserAccount) auth.getPrincipal()).getId();
    }
}