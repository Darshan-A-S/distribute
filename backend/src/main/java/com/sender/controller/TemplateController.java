package com.sender.controller;

import com.sender.dto.TemplateRequest;
import com.sender.model.EmailTemplate;
import com.sender.model.UserAccount;
import com.sender.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService service;

    @GetMapping
    public List<EmailTemplate> list(Authentication auth) {
        return service.findAll(ownerId(auth));
    }

    @GetMapping("/library")
    public List<EmailTemplate> library() {
        return service.findLibrary();
    }

    @PostMapping("/{id}/save")
    public EmailTemplate saveFromLibrary(@PathVariable Long id, Authentication auth) {
        return service.saveFromLibrary(id, ownerId(auth));
    }

    @GetMapping("/{id}")
    public EmailTemplate get(@PathVariable Long id, Authentication auth) {
        return service.findById(id, ownerId(auth));
    }

    @PostMapping
    public EmailTemplate create(@RequestBody TemplateRequest req, Authentication auth) {
        UserAccount user = (UserAccount) auth.getPrincipal();
        return service.create(req, user.getId(), user.isAdmin());
    }

    @PutMapping("/{id}")
    public EmailTemplate update(@PathVariable Long id, @RequestBody TemplateRequest req, Authentication auth) {
        return service.update(id, req, ownerId(auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, ownerId(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    public EmailTemplate publish(@PathVariable Long id, Authentication auth) {
        return service.publish(id, ownerId(auth));
    }

    @PutMapping("/library/{id}")
    public EmailTemplate updateLibrary(@PathVariable Long id, @RequestBody TemplateRequest req) {
        return service.updateLibrary(id, req);
    }

    @DeleteMapping("/library/{id}")
    public ResponseEntity<Void> deleteLibrary(@PathVariable Long id) {
        service.deleteLibrary(id);
        return ResponseEntity.noContent().build();
    }

    private Long ownerId(Authentication auth) {
        return ((UserAccount) auth.getPrincipal()).getId();
    }
}