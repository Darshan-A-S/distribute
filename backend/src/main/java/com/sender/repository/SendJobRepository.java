package com.sender.repository;

import com.sender.model.SendJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface SendJobRepository extends JpaRepository<SendJob, Long> {
    List<SendJob> findTop10ByOwnerIdOrderByStartedAtDesc(Long ownerId);
    List<SendJob> findByOwnerIdAndStatusInOrderByStartedAtDesc(Long ownerId, Collection<String> statuses);

    @Modifying
    @Transactional
    @Query("UPDATE SendJob j SET " +
           "j.success = CASE WHEN :success > j.success THEN :success ELSE j.success END, " +
           "j.failed = CASE WHEN :failed > j.failed THEN :failed ELSE j.failed END " +
           "WHERE j.id = :id")
    int updateProgress(@Param("id") Long id, @Param("success") int success, @Param("failed") int failed);

    @Query("SELECT COALESCE(SUM(j.success), 0) FROM SendJob j WHERE j.ownerId = :ownerId AND j.startedAt >= :since")
    int sumSuccessByOwnerIdAndStartedAtAfter(@Param("ownerId") Long ownerId, @Param("since") LocalDateTime since);

    @Query("SELECT FUNCTION('DATE', j.startedAt), COALESCE(SUM(j.success), 0) " +
            "FROM SendJob j " +
            "WHERE j.ownerId = :ownerId AND j.startedAt >= :since " +
            "GROUP BY FUNCTION('DATE', j.startedAt) " +
            "ORDER BY FUNCTION('DATE', j.startedAt)")
    List<Object[]> countSentByDay(@Param("ownerId") Long ownerId, @Param("since") LocalDateTime since);
}