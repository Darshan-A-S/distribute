package com.sender.controller;

import com.sender.dto.TemplateRequest;
import com.sender.model.EmailTemplate;
import com.sender.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService service;

    @GetMapping
    public List<EmailTemplate> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public EmailTemplate get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public EmailTemplate create(@RequestBody TemplateRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public EmailTemplate update(@PathVariable Long id, @RequestBody TemplateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
