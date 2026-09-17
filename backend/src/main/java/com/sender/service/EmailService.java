package com.sender.service;

import com.sender.model.EmailTemplate;
import com.sender.model.Recipient;
import com.sender.model.SendJob;
import com.sender.model.UserAccount;
import com.sender.repository.RecipientRepository;
import com.sender.repository.SendJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final BrevoClient sender;
    private final RecipientRepository recipientRepo;
    private final SendJobRepository sendJobRepo;
    private final CertificateService certificateService;
    private final ThreadPoolTaskExecutor emailExecutor;

    private static final Pattern VAR_PATTERN = Pattern.compile("\\{(\\w+)}");
    // Parallel v2: below this many recipients run serially on the batch thread; at/above, fan out to workers.
    private static final int PARALLEL_THRESHOLD = 50;
    private static final int CHUNK_SIZE = 25;

    // One lock per user: only one batch per user runs at a time, the rest queue (fair = FIFO).
    private final Map<Long, Lock> userLocks = new ConcurrentHashMap<>();

    @Async("emailExecutor")
    public void sendBatch(EmailTemplate template, List<Recipient> recipients, SendJob job, UserAccount user) {
        Lock lock = userLocks.computeIfAbsent(user.getId(), id -> new ReentrantLock(true));
        lock.lock();
        try {
            job.setStatus("RUNNING");
            sendJobRepo.save(job);
            int success = 0, failed = 0;

            for (Recipient recipient : recipients) {
                if (sendOne(template, recipient, user)) {
                    success++;
                    job.setSuccess(success);
                } else {
                    failed++;
                    job.setFailed(failed);
                }
                sendJobRepo.save(job);
            }

            log.info("Batch complete: {} sent, {} failed out of {}", success, failed, recipients.size());
        } finally {
            job.setStatus("DONE");
            job.setFinishedAt(LocalDateTime.now());
            sendJobRepo.save(job);
            lock.unlock();
        }
    }

    @Async("emailExecutor")
    public void sendBatchParallel(EmailTemplate template, List<Recipient> recipients, SendJob job, UserAccount user) {
        Lock lock = userLocks.computeIfAbsent(user.getId(), id -> new ReentrantLock(true));
        lock.lock();
        try {
            job.setStatus("RUNNING");
            sendJobRepo.save(job);

            List<List<Recipient>> chunks = partition(recipients, CHUNK_SIZE);
            int success;
            int failed;
            if (recipients.size() < PARALLEL_THRESHOLD) {
                int[] r = {0, 0};
                chunks.forEach(c -> {
                    int[] s = sendChunk(template, c, user);
                    r[0] += s[0];
                    r[1] += s[1];
                });
                success = r[0];
                failed = r[1];
            } else {
                AtomicInteger ok = new AtomicInteger();
                AtomicInteger notOk = new AtomicInteger();
                CountDownLatch latch = new CountDownLatch(chunks.size());
                for (List<Recipient> chunk : chunks) {
                    emailExecutor.submit(() -> {
                        try {
                            int[] s = sendChunk(template, chunk, user);
                            ok.addAndGet(s[0]);
                            notOk.addAndGet(s[1]);
                        } finally {
                            latch.countDown();
                        }
                    });
                }
                try {
                    latch.await();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                success = ok.get();
                failed = notOk.get();
            }

            job.setSuccess(success);
            job.setFailed(failed);
            job.setStatus("DONE");
            job.setFinishedAt(LocalDateTime.now());
            sendJobRepo.save(job);
            log.info("Batch complete: {} sent, {} failed out of {}", success, failed, recipients.size());
        } finally {
            lock.unlock();
        }
    }

    private int[] sendChunk(EmailTemplate template, List<Recipient> chunk, UserAccount user) {
        int[] r = {0, 0};
        for (Recipient recipient : chunk) {
            if (sendOne(template, recipient, user)) {
                r[0]++;
            } else {
                r[1]++;
            }
        }
        return r;
    }

    private List<List<Recipient>> partition(List<Recipient> list, int size) {
        List<List<Recipient>> parts = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            parts.add(new ArrayList<>(list.subList(i, Math.min(list.size(), i + size))));
        }
        return parts;
    }

    private boolean sendOne(EmailTemplate template, Recipient recipient, UserAccount user) {
        try {
            Map<String, String> vars = parseVariables(recipient.getVariablesJson());
            String subject = interpolate(template.getSubject(), vars);
            String body = sender.appendFooter(interpolate(template.getBody(), vars), user.getUsername());

            Map<String, String> attachments = new LinkedHashMap<>();
            if (certificateService.hasCertificate(template)) {
                byte[] cert = certificateService.render(template, vars);
                if (cert != null) {
                    attachments.put(certificateFileName(recipient),
                            "data:application/pdf;base64," + Base64.getEncoder().encodeToString(cert));
                }
            }

            sender.send(recipient.getName(), recipient.getEmail(), subject, body, attachments);

            recipient.setSent(true);
            recipient.setSentAt(LocalDateTime.now());
            recipientRepo.save(recipient);
            log.info("Sent to {} ({})", recipient.getName(), recipient.getEmail());
            return true;
        } catch (Exception e) {
            log.error("Failed to send to {} ({}): {}", recipient.getName(), recipient.getEmail(), e.getMessage());
            return false;
        }
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
