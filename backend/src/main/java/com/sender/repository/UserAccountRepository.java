package com.sender.repository;

import com.sender.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByResetToken(String resetToken);
    boolean existsByUsername(String username);
    boolean existsByEmailAndEmailVerifiedTrueAndIdNot(String email, Long id);
}