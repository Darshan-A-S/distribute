package com.sender.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ArchitectureController {

    // Public: matches SecurityConfig's anyRequest().permitAll() for non-/api paths.
    @GetMapping("/architecture")
    public ResponseEntity<Resource> architecture() {
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(new ClassPathResource("static/architecture.html"));
    }
}
