package com.sender.service;

import com.sender.model.EmailTemplate;
import com.sender.model.Recipient;
import com.sender.repository.RecipientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final RecipientRepository recipientRepo;

    @Value("${app.email.from}")
    private String fromAddress;

    private static final Pattern VAR_PATTERN = Pattern.compile("\\{(\\w+)}");

    @Async
    public void sendBatch(EmailTemplate template, List<Recipient> recipients) {
        int success = 0, failed = 0;

        for (Recipient recipient : recipients) {
            try {
                String subject = interpolate(template.getSubject(), recipient);
                String body = interpolate(template.getBody(), recipient);

                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromAddress);
                helper.setTo(recipient.getEmail());
                helper.setSubject(subject);
                helper.setText(body, true); // true = HTML

                mailSender.send(message);

                recipient.setSent(true);
                recipient.setSentAt(LocalDateTime.now());
                recipientRepo.save(recipient);
                success++;

                log.info("Sent to {} ({})", recipient.getName(), recipient.getEmail());
            } catch (Exception e) {
                failed++;
                log.error("Failed to send to {} ({}): {}", recipient.getName(), recipient.getEmail(), e.getMessage());
            }
        }

        log.info("Batch complete: {} sent, {} failed out of {}", success, failed, recipients.size());
    }

    private String interpolate(String template, Recipient recipient) {
        Map<String, String> vars = parseVariables(recipient.getVariablesJson());
        Matcher matcher = VAR_PATTERN.matcher(template);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            String varName = matcher.group(1);
            String value = vars.getOrDefault(varName, matcher.group(0));
            matcher.appendReplacement(sb, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private Map<String, String> parseVariables(String json) {
        Map<String, String> vars = new LinkedHashMap<>();
        if (json == null || json.isBlank()) return vars;

        // Simple JSON parser for {"key":"value",...} — no external dep needed
        String cleaned = json.trim();
        if (cleaned.startsWith("{")) cleaned = cleaned.substring(1);
        if (cleaned.endsWith("}")) cleaned = cleaned.substring(0, cleaned.length() - 1);

        String[] pairs = cleaned.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        for (String pair : pairs) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                String key = kv[0].replace("\"", "").trim();
                String val = kv[1].replace("\"", "").trim();
                vars.put(key, val);
            }
        }
        return vars;
    }
}
