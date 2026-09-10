package com.sender.repository;

import com.sender.model.SendJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface SendJobRepository extends JpaRepository<SendJob, Long> {
    List<SendJob> findTop10ByOwnerIdOrderByStartedAtDesc(Long ownerId);
    List<SendJob> findByOwnerIdAndStatusInOrderByStartedAtDesc(Long ownerId, Collection<String> statuses);
}