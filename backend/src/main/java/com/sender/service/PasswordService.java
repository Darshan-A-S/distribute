package com.sender.service;

import com.sender.model.UserAccount;
import com.sender.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordService {

    private final UserAccountRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final BrevoClient sender;

    @Value("${app.url}")
    private String appUrl;

    public void changePassword(UserAccount user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        repo.save(user);
    }

    public void forgotPassword(String email) {
        UserAccount user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account with that email"));
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        repo.save(user);
        sendEmail(user.getEmail(), "Password Reset Request",
                mail("Password Reset", "templates/mail/reset.html", Map.of("URL", resetUrl(token))));
        log.info("Password reset email sent to {}", email);
    }

    public void resetPassword(String token, String newPassword) {
        UserAccount user = repo.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        repo.save(user);
    }

    public void sendVerificationOtp(UserAccount user, String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Please enter an email address");
        }
        if (repo.existsByEmailAndEmailVerifiedTrueAndIdNot(email, user.getId())) {
            throw new RuntimeException("This email is already used by another user");
        }
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        user.setVerificationOtp(otp);
        user.setVerificationOtpExpiry(LocalDateTime.now().plusMinutes(15));
        repo.save(user);
        sendEmail(email, "Verify Your Email", mail("Verify Your Email", "templates/mail/otp.html", Map.of("OTP", otp)));
        log.info("Verification OTP sent to {}", email);
    }

    public void verifyEmail(UserAccount user, String otp, String email) {
        if (user.getVerificationOtp() == null || user.getVerificationOtpExpiry() == null) {
            throw new RuntimeException("No verification pending. Request a new code.");
        }
        if (user.getVerificationOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Request a new code.");
        }
        if (!user.getVerificationOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Please enter an email address");
        }
        if (repo.existsByEmailAndEmailVerifiedTrueAndIdNot(email, user.getId())) {
            throw new RuntimeException("This email is already used by another user");
        }
        user.setEmail(email);
        user.setEmailVerified(true);
        user.setVerificationOtp(null);
        user.setVerificationOtpExpiry(null);
        repo.save(user);
    }

    private String resetUrl(String token) {
        return appUrl + "/reset-password?token=" + token;
    }

    private String mail(String title, String contentPath, Map<String, String> vars) {
        String html = readResource("templates/mail/layout.html")
                .replace("{{CONTENT}}", readResource(contentPath))
                .replace("{{TITLE}}", title);
        for (Map.Entry<String, String> e : vars.entrySet()) {
            html = html.replace("{{" + e.getKey() + "}}", e.getValue());
        }
        return html;
    }

    private String readResource(String path) {
        try {
            return new String(new ClassPathResource(path).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to read mail template {}", path, e);
            throw new RuntimeException("Failed to load mail template");
        }
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            sender.send(to, to, subject, sender.appendFooter(htmlBody, null), Map.of());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email");
        }
    }
}
