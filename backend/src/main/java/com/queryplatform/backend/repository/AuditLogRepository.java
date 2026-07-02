package com.queryplatform.backend.repository;

import com.queryplatform.backend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByChangedAtDesc(Pageable pageable);
    List<AuditLog> findByEntityTypeAndEntityIdOrderByChangedAtDesc(String entityType, Long entityId);
}
