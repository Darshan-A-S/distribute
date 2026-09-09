package com.sender.service;

import com.sender.model.UserAccount;
import com.sender.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordService {

    private final UserAccountRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

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
                "<p>Click the link to reset your password:</p>"
                + "<p><a href=\"http://localhost:5173/reset-password?token=" + token + "\">Reset Password</a></p>"
                + "<p>This link expires in 1 hour.</p>");
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

    public void sendVerificationOtp(UserAccount user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("No email set on profile");
        }
        if (repo.existsByEmailAndEmailVerifiedTrueAndIdNot(user.getEmail(), user.getId())) {
            throw new RuntimeException("This email is already used by another user");
        }
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        user.setVerificationOtp(otp);
        user.setVerificationOtpExpiry(LocalDateTime.now().plusMinutes(15));
        repo.save(user);
        sendEmail(user.getEmail(), "Verify Your Email",
                "<p>Your verification code is: <b>" + otp + "</b></p>"
                + "<p>This code expires in 15 minutes.</p>");
        log.info("Verification OTP sent to {}", user.getEmail());
    }

    public void verifyEmail(UserAccount user, String otp) {
        if (user.getVerificationOtp() == null || user.getVerificationOtpExpiry() == null) {
            throw new RuntimeException("No verification pending. Request a new code.");
        }
        if (user.getVerificationOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Request a new code.");
        }
        if (!user.getVerificationOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        if (repo.existsByEmailAndEmailVerifiedTrueAndIdNot(user.getEmail(), user.getId())) {
            throw new RuntimeException("This email is already used by another user");
        }
        user.setEmailVerified(true);
        user.setVerificationOtp(null);
        user.setVerificationOtpExpiry(null);
        repo.save(user);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("asdarshan10@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email");
        }
    }
}
