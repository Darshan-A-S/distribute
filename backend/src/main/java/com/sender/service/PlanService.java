package com.sender.service;

import com.sender.dto.PlanDto;
import com.sender.dto.UsageDto;
import com.sender.model.UserAccount;
import com.sender.repository.RecipientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanService {

    public static final int FREE_DAILY_LIMIT = 60;
    public static final int PRO_DAILY_LIMIT = 300;

    private final RecipientRepository recipientRepo;
    private final BrevoClient sender;

    @Value("${app.contact-email:}")
    private String contactEmail;

    public List<PlanDto> plans() {
        return List.of(
                new PlanDto("FREE", "Free", FREE_DAILY_LIMIT, "$0", "forever",
                        List.of("60 emails per day", "PDF certificates", "Batch sending", "Excel roster upload")),
                new PlanDto("PRO", "Pro", PRO_DAILY_LIMIT, "On request", "contact to upgrade",
                        List.of("300 emails per day", "Everything in Free", "AI template writing (coming soon)", "Priority support"))
        );
    }

    public String contactEmail() {
        return contactEmail;
    }

    public void contactOwner(String name, String email, String message) {
        if (contactEmail.isBlank()) {
            throw new IllegalArgumentException("Contact email is not configured");
        }
        if (name == null || name.isBlank() || email == null || email.isBlank() || message == null || message.isBlank()) {
            throw new IllegalArgumentException("Name, email and message are required");
        }
        String subject = "Pro upgrade request from " + escape(name);
        String html = "<p>A user wants to upgrade to Pro.</p>"
                + "<p><b>Name:</b> " + escape(name) + "</p>"
                + "<p><b>Email:</b> " + escape(email) + "</p>"
                + "<p><b>Message:</b></p><p>" + escape(message).replace("\n", "<br>") + "</p>";
        sender.send("", contactEmail, subject, html, null);
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    public static int dailyLimit(String plan) {
        return "PRO".equals(plan) ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
    }

    public UsageDto usage(UserAccount user) {
        int used = (int) recipientRepo.countByOwnerIdAndSentAtAfter(user.getId(), LocalDate.now().atStartOfDay());
        int limit = dailyLimit(user.getPlan());
        return new UsageDto(user.getPlan() == null ? "FREE" : user.getPlan(),
                limit, used, Math.max(0, limit - used),
                LocalDate.now().plusDays(1).atStartOfDay().toString());
    }
}