package com.sender.repository;

import com.sender.model.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RecipientRepository extends JpaRepository<Recipient, Long> {
    List<Recipient> findByOwnerIdAndUploadBatch(Long ownerId, String uploadBatch);
    List<Recipient> findByOwnerIdAndUploadBatchAndSentFalse(Long ownerId, String uploadBatch);
    long countByOwnerIdAndUploadBatch(Long ownerId, String uploadBatch);
    long countByOwnerIdAndUploadBatchAndSentTrue(Long ownerId, String uploadBatch);
    long countByOwnerIdAndUploadBatchAndSentFalse(Long ownerId, String uploadBatch);
    void deleteByOwnerIdAndUploadBatch(Long ownerId, String uploadBatch);
    Optional<Recipient> findByIdAndOwnerId(Long id, Long ownerId);

    @Modifying
    @Query("UPDATE Recipient r SET r.sent = false, r.sentAt = NULL WHERE r.ownerId = :ownerId AND r.uploadBatch = :uploadBatch")
    int resetBatch(@Param("ownerId") Long ownerId, @Param("uploadBatch") String uploadBatch);

    @Query("SELECT DISTINCT r.uploadBatch FROM Recipient r WHERE r.ownerId = :ownerId AND r.uploadBatch IS NOT NULL AND r.uploadBatch <> '' ORDER BY r.uploadBatch")
    List<String> findDistinctBatchesByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT FUNCTION('DATE', r.sentAt), COUNT(r) FROM Recipient r WHERE r.ownerId = :ownerId AND r.sentAt IS NOT NULL AND r.sentAt >= :since GROUP BY FUNCTION('DATE', r.sentAt) ORDER BY FUNCTION('DATE', r.sentAt)")
    List<Object[]> countSentByDay(@Param("ownerId") Long ownerId, @Param("since") LocalDateTime since);
}