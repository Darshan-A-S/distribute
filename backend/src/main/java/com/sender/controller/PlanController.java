package com.sender.controller;

import com.sender.dto.UsageDto;
import com.sender.model.UserAccount;
import com.sender.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public Map<String, Object> plans() {
        return Map.of("plans", planService.plans(), "contactEmail", planService.contactEmail());
    }

    @PostMapping("/contact")
    public ResponseEntity<?> contact(@RequestBody Map<String, String> body) {
        try {
            planService.contactOwner(body.get("name"), body.get("email"), body.get("message"));
            return ResponseEntity.ok(Map.of("message", "Request sent"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/usage")
    public UsageDto usage(Authentication auth) {
        return planService.usage((UserAccount) auth.getPrincipal());
    }
}