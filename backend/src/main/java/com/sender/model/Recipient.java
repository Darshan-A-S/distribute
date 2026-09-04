package com.sender.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recipients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String variablesJson;

    @Column(nullable = false)
    private String uploadBatch;

    private boolean sent;
    private LocalDateTime sentAt;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        sent = false;
    }
}
