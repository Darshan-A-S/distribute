package com.sender.config;

import com.sender.repository.SendJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class AsyncConfig {

    private final SendJobRepository sendJobRepo;

    @Bean(name = "emailExecutor")
    public ThreadPoolTaskExecutor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("email-");
        executor.initialize();
        return executor;
    }

    // Reap jobs orphaned by a restart: they were queued/running but their worker thread is gone.
    // Unsent recipients keep their sent=false flag, so the user can simply re-trigger the batch.
    @EventListener(ApplicationReadyEvent.class)
    public void reapOrphanedJobs() {
        sendJobRepo.findAll().stream()
                .filter(j -> !"DONE".equals(j.getStatus()) && !"FAILED".equals(j.getStatus()))
                .forEach(j -> {
                    j.setStatus("FAILED");
                    j.setFinishedAt(LocalDateTime.now());
                    sendJobRepo.save(j);
                });
    }
}