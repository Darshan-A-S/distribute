package com.sender.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "send_jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String batchName;

    private String templateName;

    private int total;
    private int success;
    private int failed;

    @Column(nullable = false)
    private String status;

    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}