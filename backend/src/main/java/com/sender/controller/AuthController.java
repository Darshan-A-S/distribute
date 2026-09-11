package com.sender.controller;

import com.sender.dto.*;
import com.sender.model.UserAccount;
import com.sender.service.PasswordService;
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
    private final PasswordService passwordService;
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

    @PutMapping("/settings")
    public ResponseEntity<?> settings(@RequestBody ProfileRequest req, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserAccount user)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        try {
            return ResponseEntity.ok(userService.updateProfile(user, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserAccount user)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        userService.deleteAccount(user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserAccount user)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        try {
            passwordService.changePassword(user, req.currentPassword(), req.newPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        try {
            passwordService.forgotPassword(req.email());
            return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been sent"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        try {
            passwordService.resetPassword(req.token(), req.newPassword());
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerification(@RequestBody SendVerificationRequest req, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserAccount user)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        try {
            passwordService.sendVerificationOtp(user, req.email());
            return ResponseEntity.ok(Map.of("message", "Verification OTP sent"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyOtpRequest req, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserAccount user)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        try {
            passwordService.verifyEmail(user, req.otp(), req.email());
            return ResponseEntity.ok(userService.toDto(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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