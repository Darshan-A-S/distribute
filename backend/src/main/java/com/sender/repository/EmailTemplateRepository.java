package com.sender.repository;

import com.sender.model.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    List<EmailTemplate> findByOwnerId(Long ownerId);
    Optional<EmailTemplate> findByIdAndOwnerId(Long id, Long ownerId);
}