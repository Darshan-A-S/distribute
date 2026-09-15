package com.sender.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BrevoClient {

    private final String apiKey;
    private final String fromEmail;
    private final String fromName;
    private final String toolName;
    private final RestClient rest;

    public BrevoClient(
            @Value("${brevo.api-key}") String apiKey,
            @Value("${brevo.from-email}") String fromEmail,
            @Value("${brevo.from-name}") String fromName,
            @Value("${brevo.tool-name}") String toolName) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.toolName = toolName;
        this.rest = RestClient.builder().baseUrl("https://api.brevo.com/v3").build();
    }

    public void send(String toName, String toEmail, String subject, String html, Map<String, String> attachments) {
        String toDisplay = (toName == null || toName.isBlank()) ? toEmail : toName;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("sender", Map.of("email", fromEmail, "name", fromName));
        body.put("to", List.of(Map.of("email", toEmail, "name", toDisplay)));
        body.put("subject", subject);
        body.put("htmlContent", html);
        if (attachments != null && !attachments.isEmpty()) {
            List<Map<String, String>> list = new ArrayList<>();
            for (Map.Entry<String, String> e : attachments.entrySet()) {
                list.add(Map.of("name", e.getKey(), "content", stripDataUri(e.getValue())));
            }
            body.put("attachment", list);
        }
        log.info("Sending email to {} subject={} via Brevo", toEmail, subject);
        try {
            rest.post()
                    .uri("/smtp/email")
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException e) {
            throw new RuntimeException("Brevo error " + e.getStatusCode().value() + ": " + e.getResponseBodyAsString());
        }
    }

    public String appendFooter(String html, String sentBy) {
        String text = (sentBy == null || sentBy.isBlank())
                ? "This email was sent via " + escape(toolName) + "."
                : "This email was sent by <b>" + escape(sentBy) + "</b> via " + escape(toolName) + ".";
        String block = "\n<div style=\"margin-top:32px;padding-top:12px;border-top:1px solid #e0e0e0;font-size:11px;color:#888;line-height:1.5;\">" + text + "</div>";
        // ponytail: content after </body> is stripped of styling by mail clients; insert inside instead of appending.
        if (html.contains("</body>")) return html.replace("</body>", block + "</body>");
        if (html.contains("</html>")) return html.replace("</html>", block + "</html>");
        return html + block;
    }

    private static String stripDataUri(String v) {
        int i = v.indexOf(',');
        return i >= 0 ? v.substring(i + 1) : v;
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}