package com.sender.service;

import com.sender.dto.TemplateRequest;
import com.sender.exception.NotFoundException;
import com.sender.model.EmailTemplate;
import com.sender.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final EmailTemplateRepository repo;

    public List<EmailTemplate> findAll(Long ownerId) {
        return repo.findByOwnerId(ownerId);
    }

    public EmailTemplate findById(Long id, Long ownerId) {
        return repo.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new NotFoundException("Template not found or not owned by you"));
    }

    public EmailTemplate create(TemplateRequest req, Long ownerId) {
        EmailTemplate template = EmailTemplate.builder()
                .ownerId(ownerId)
                .name(req.getName())
                .subject(req.getSubject())
                .body(req.getBody())
                .variablesJson(req.getVariablesJson())
                .build();
        return repo.save(template);
    }

    public EmailTemplate update(Long id, TemplateRequest req, Long ownerId) {
        EmailTemplate template = findById(id, ownerId);
        template.setName(req.getName());
        template.setSubject(req.getSubject());
        template.setBody(req.getBody());
        template.setVariablesJson(req.getVariablesJson());
        return repo.save(template);
    }

    public void delete(Long id, Long ownerId) {
        repo.delete(findById(id, ownerId));
    }
}