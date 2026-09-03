package com.sender.repository;

import com.sender.model.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecipientRepository extends JpaRepository<Recipient, Long> {
    List<Recipient> findByUploadBatch(String uploadBatch);
    List<Recipient> findByUploadBatchAndSentFalse(String uploadBatch);
    long countByUploadBatchAndSentTrue(String uploadBatch);
    long countByUploadBatchAndSentFalse(String uploadBatch);
    void deleteByUploadBatch(String uploadBatch);
}
