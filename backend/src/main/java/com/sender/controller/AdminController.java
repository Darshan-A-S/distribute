package com.sender.controller;

import com.sender.dto.UserDto;
import com.sender.model.UserAccount;
import com.sender.service.UserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class
    AdminController {

    private final UserAccountService userService;

    @GetMapping("/users")
    public List<UserDto> users() {
        return userService.findAll();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        Long selfId = ((UserAccount) auth.getPrincipal()).getId();
        try {
            userService.deleteUser(id, selfId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> setRole(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        Long selfId = ((UserAccount) auth.getPrincipal()).getId();
        try {
            userService.setRole(id, body.get("role"), selfId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}