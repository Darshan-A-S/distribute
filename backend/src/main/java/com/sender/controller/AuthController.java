package com.sender.controller;

import com.sender.dto.AuthRequest;
import com.sender.dto.UserDto;
import com.sender.model.UserAccount;
import com.sender.service.UserAccountService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserAccountService userService;
    private final HttpSessionSecurityContextRepository securityContextRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req, HttpServletRequest request, HttpServletResponse response) {
        UserDto user;
        try {
            user = userService.register(req.username(), req.password());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
        establishSession(req.username(), req.password(), request, response);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req, HttpServletRequest request, HttpServletResponse response) {
        try {
            UserDto user = establishSession(req.username(), req.password(), request, response);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserAccount user)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(userService.toDto(user));
    }

    private UserDto establishSession(String username, String password, HttpServletRequest request, HttpServletResponse response) {
        String name = username == null ? "" : username.trim();
        try {
            Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(name, password));
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            HttpSession session = request.getSession(false);
            if (session != null) request.changeSessionId(); // rotate session id on login, avoiding fixation
            securityContextRepository.saveContext(context, request, response);
            return userService.toDto((UserAccount) auth.getPrincipal());
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }
}