package com.sender.service;

import com.sender.dto.ProfileRequest;
import com.sender.dto.UserDto;
import com.sender.model.UserAccount;
import com.sender.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAccountService implements UserDetailsService {

    private final UserAccountRepository repo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public UserDto register(String username, String password) {
        String name = username == null ? "" : username.trim();
        if (name.length() < 3) throw new RuntimeException("Username must be at least 3 characters");
        if (password == null || password.length() < 6) throw new RuntimeException("Password must be at least 6 characters");
        if (repo.existsByUsername(name)) throw new RuntimeException("Username already taken");
        UserAccount user = repo.save(UserAccount.builder()
                .username(name)
                .password(passwordEncoder.encode(password))
                .role("USER")
                .build());
        return toDto(user);
    }

    public List<UserDto> findAll() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    public void deleteUser(Long id, Long selfId) {
        if (id.equals(selfId)) throw new RuntimeException("Cannot delete your own account");
        repo.deleteById(id);
    }

    public void setRole(Long id, String role, Long selfId) {
        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            throw new RuntimeException("Role must be USER or ADMIN");
        }
        UserAccount user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (id.equals(selfId) && "USER".equals(role)) {
            throw new RuntimeException("You cannot remove your own admin role");
        }
        user.setRole(role);
        repo.save(user);
    }

    public UserDto toDto(UserAccount user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(),
                user.getEmailVerified(), user.getSmtpHost(), user.getSmtpPort(), user.getSmtpUsername(),
                user.getRole(), user.getCreatedAt());
    }

    public UserDto updateProfile(UserAccount user, ProfileRequest req) {
        boolean hasSmtpFields = (req.smtpHost() != null && !req.smtpHost().isBlank())
                || (req.smtpUsername() != null && !req.smtpUsername().isBlank());
        if (hasSmtpFields && !Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Verify your email before configuring SMTP settings");
        }
        if (req.email() != null) user.setEmail(req.email().isBlank() ? null : req.email().trim());
        if (req.smtpHost() != null) user.setSmtpHost(req.smtpHost().isBlank() ? null : req.smtpHost().trim());
        if (req.smtpPort() != null) user.setSmtpPort(req.smtpPort());
        if (req.smtpUsername() != null) user.setSmtpUsername(req.smtpUsername().isBlank() ? null : req.smtpUsername().trim());
        if (req.smtpPassword() != null && !req.smtpPassword().isBlank()) user.setSmtpPassword(req.smtpPassword());
        if (req.startTls() != null) user.setSmtpStartTls(req.startTls());
        return toDto(repo.save(user));
    }
}