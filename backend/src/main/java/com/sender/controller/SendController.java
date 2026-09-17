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
@RequiredArgsConstructor
public class SendController {

    private final EmailService emailService;
    private final TemplateService templateService;
    private final RecipientRepository recipientRepo;
    private final SendJobRepository sendJobRepo;

    @PostMapping("/api/v1/send")
    public ResponseEntity<Map<String, String>> send(@RequestBody SendRequest req, Authentication auth) {
        return start(req, auth, false);
    }

    @PostMapping("/api/v2/send")
    public ResponseEntity<Map<String, String>> sendV2(@RequestBody SendRequest req, Authentication auth) {
        return start(req, auth, true);
    }

    private ResponseEntity<Map<String, String>> start(SendRequest req, Authentication auth, boolean parallel) {
        UserAccount user = (UserAccount) auth.getPrincipal();
        Long ownerId = user.getId();

        EmailTemplate template = templateService.findById(req.getTemplateId(), ownerId);
        if (req.getBatchName() == null || req.getBatchName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "batchName is required"));
        }

        List<Recipient> recipients = recipientRepo.findByOwnerIdAndUploadBatchAndSentFalse(ownerId, req.getBatchName());
        if (recipients.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No unsent recipients found in batch"));
        }

        SendJob job = sendJobRepo.save(SendJob.builder()
                .ownerId(ownerId)
                .batchName(req.getBatchName())
                .templateName(template.getName())
                .total(recipients.size())
                .status("QUEUED")
                .startedAt(LocalDateTime.now())
                .build());

        if (parallel) {
            emailService.sendBatchParallel(template, recipients, job, user);
        } else {
            emailService.sendBatch(template, recipients, job, user);
        }

        return ResponseEntity.accepted().body(Map.of(
                "message", "Sending " + recipients.size() + " emails in background",
                "batchName", req.getBatchName()
        ));
    }

    @GetMapping("/api/v1/send/jobs/active")
    public List<SendJob> active(Authentication auth) {
        return sendJobRepo.findByOwnerIdAndStatusInOrderByStartedAtDesc(
                ownerId(auth), List.of("QUEUED", "RUNNING"));
    }

    @GetMapping("/api/v1/send/recent")
    public List<SendJob> recent(Authentication auth) {
        return sendJobRepo.findTop10ByOwnerIdOrderByStartedAtDesc(ownerId(auth));
    }

    private Long ownerId(Authentication auth) {
        return ((UserAccount) auth.getPrincipal()).getId();
    }
}