package com.sender.repository;

import com.sender.model.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RecipientRepository extends JpaRepository<Recipient, Long> {
    List<Recipient> findByOwnerIdAndUploadBatch(Long ownerId, String uploadBatch);
    List<Recipient> findByOwnerIdAndUploadBatchAndSentFalse(Long ownerId, String uploadBatch);
    long countByOwnerIdAndUploadBatchAndSentTrue(Long ownerId, String uploadBatch);
    long countByOwnerIdAndUploadBatchAndSentFalse(Long ownerId, String uploadBatch);
    void deleteByOwnerIdAndUploadBatch(Long ownerId, String uploadBatch);
    Optional<Recipient> findByIdAndOwnerId(Long id, Long ownerId);
}