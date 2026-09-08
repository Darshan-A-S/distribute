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

    public EmailTemplate create(TemplateRequest req, Long ownerId, boolean isAdmin) {
        boolean builtIn = isAdmin && Boolean.TRUE.equals(req.getBuiltIn());
        EmailTemplate template = EmailTemplate.builder()
                .ownerId(builtIn ? null : ownerId)
                .builtIn(builtIn)
                .name(req.getName())
                .subject(req.getSubject())
                .body(req.getBody())
                .variablesJson(req.getVariablesJson())
                .certificateImage(req.getCertificateImage())
                .certificateTexts(req.getCertificateTexts())
                .certificateImageWidth(req.getCertificateImageWidth())
                .certificateImageHeight(req.getCertificateImageHeight())
                .build();
        return repo.save(template);
    }

    public EmailTemplate update(Long id, TemplateRequest req, Long ownerId) {
        EmailTemplate template = findById(id, ownerId);
        applyFields(template, req);
        return repo.save(template);
    }

    public void delete(Long id, Long ownerId) {
        repo.delete(findById(id, ownerId));
    }

    public EmailTemplate publish(Long id, Long ownerId) {
        EmailTemplate template = findById(id, ownerId);
        template.setOwnerId(null);
        template.setBuiltIn(true);
        return repo.save(template);
    }

    public List<EmailTemplate> findLibrary() {
        return repo.findByBuiltInTrue();
    }

    public EmailTemplate saveFromLibrary(Long id, Long ownerId) {
        EmailTemplate src = repo.findByIdAndBuiltInTrue(id)
                .orElseThrow(() -> new NotFoundException("Library template not found"));
        return repo.save(EmailTemplate.builder()
                .ownerId(ownerId)
                .builtIn(false)
                .name(src.getName())
                .subject(src.getSubject())
                .body(src.getBody())
                .variablesJson(src.getVariablesJson())
                .certificateImage(src.getCertificateImage())
                .certificateTexts(src.getCertificateTexts())
                .certificateImageWidth(src.getCertificateImageWidth())
                .certificateImageHeight(src.getCertificateImageHeight())
                .build());
    }

    public EmailTemplate updateLibrary(Long id, TemplateRequest req) {
        EmailTemplate template = repo.findByIdAndBuiltInTrue(id)
                .orElseThrow(() -> new NotFoundException("Library template not found"));
        applyFields(template, req);
        return repo.save(template);
    }

    public void deleteLibrary(Long id) {
        EmailTemplate template = repo.findByIdAndBuiltInTrue(id)
                .orElseThrow(() -> new NotFoundException("Library template not found"));
        repo.delete(template);
    }

    private void applyFields(EmailTemplate t, TemplateRequest req) {
        t.setName(req.getName());
        t.setSubject(req.getSubject());
        t.setBody(req.getBody());
        t.setVariablesJson(req.getVariablesJson());
        t.setCertificateImage(req.getCertificateImage());
        t.setCertificateTexts(req.getCertificateTexts());
        t.setCertificateImageWidth(req.getCertificateImageWidth());
        t.setCertificateImageHeight(req.getCertificateImageHeight());
    }
}