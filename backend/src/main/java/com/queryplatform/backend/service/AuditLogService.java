package com.queryplatform.backend.service;

import com.queryplatform.backend.entity.AuditLog;
import com.queryplatform.backend.entity.User;
import com.queryplatform.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logChange(String entityType, Long entityId, String fieldName, String oldValue, String newValue, User changedBy) {
        AuditLog auditLog = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .changedBy(changedBy)
                .build();
        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByChangedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public java.util.List<AuditLog> getAuditLogsForEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByChangedAtDesc(entityType, entityId);
    }
}
