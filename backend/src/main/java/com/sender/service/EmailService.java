package com.sender.service;

import com.sender.model.EmailTemplate;
import com.sender.model.Recipient;
import com.sender.model.SendJob;
import com.sender.model.UserAccount;
import com.sender.repository.RecipientRepository;
import com.sender.repository.SendJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
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
    private final SendJobRepository sendJobRepo;
    private final CertificateService certificateService;

    private static final Pattern VAR_PATTERN = Pattern.compile("\\{(\\w+)}");

    @Async
    public void sendBatch(EmailTemplate template, List<Recipient> recipients, SendJob job, UserAccount user) {
        JavaMailSender sender = senderFor(user);
        String from = (user.getEmail() != null && !user.getEmail().isBlank())
                ? user.getEmail() : user.getSmtpUsername();
        int success = 0, failed = 0;

        for (Recipient recipient : recipients) {
            try {
                Map<String, String> vars = parseVariables(recipient.getVariablesJson());
                String subject = interpolate(template.getSubject(), vars);
                String body = interpolate(template.getBody(), vars);

                MimeMessage message = sender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(from);
                helper.setTo(recipient.getEmail());
                helper.setSubject(subject);

                if (certificateService.hasCertificate(template)) {
                    byte[] cert = certificateService.render(template, vars);
                    if (cert != null) {
                        helper.addAttachment(certificateFileName(recipient), new ByteArrayDataSource(cert, "application/pdf"));
                    }
                }
                helper.setText(body, true); // true = HTML

                sender.send(message);

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

        job.setSuccess(success);
        job.setFailed(failed);
        job.setStatus("DONE");
        job.setFinishedAt(LocalDateTime.now());
        sendJobRepo.save(job);

        log.info("Batch complete: {} sent, {} failed out of {}", success, failed, recipients.size());
    }

    private JavaMailSender senderFor(UserAccount user) {
        if (user.getSmtpHost() == null || user.getSmtpHost().isBlank()
                || user.getSmtpUsername() == null || user.getSmtpUsername().isBlank()) {
            throw new IllegalStateException("No SMTP settings configured");
        }
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(user.getSmtpHost());
        impl.setPort(user.getSmtpPort() != null && user.getSmtpPort() > 0 ? user.getSmtpPort() : 587);
        impl.setUsername(user.getSmtpUsername());
        impl.setPassword(user.getSmtpPassword() != null ? user.getSmtpPassword() : "");
        Properties props = impl.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        String startTls = String.valueOf(user.getSmtpStartTls() == null || user.getSmtpStartTls());
        props.put("mail.smtp.starttls.enable", startTls);
        props.put("mail.smtp.starttls.required", startTls);
        return impl;
    }

    private String interpolate(String template, Map<String, String> vars) {
        if (template == null) return "";
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

    private String certificateFileName(Recipient recipient) {
        String name = recipient.getName() == null ? "" : recipient.getName().replaceAll("[^\\w\\-]", "-").trim();
        return (name.isBlank() ? "certificate" : name) + ".pdf";
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
