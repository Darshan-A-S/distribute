package com.sender.service;

import com.sender.dto.TemplateRequest;
import com.sender.model.EmailTemplate;
import com.sender.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final EmailTemplateRepository repo;

    public List<EmailTemplate> findAll() {
        return repo.findAll();
    }

    public EmailTemplate findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));
    }

    public EmailTemplate create(TemplateRequest req) {
        EmailTemplate template = EmailTemplate.builder()
                .name(req.getName())
                .subject(req.getSubject())
                .body(req.getBody())
                .variablesJson(req.getVariablesJson())
                .build();
        return repo.save(template);
    }

    public EmailTemplate update(Long id, TemplateRequest req) {
        EmailTemplate template = findById(id);
        template.setName(req.getName());
        template.setSubject(req.getSubject());
        template.setBody(req.getBody());
        template.setVariablesJson(req.getVariablesJson());
        return repo.save(template);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
