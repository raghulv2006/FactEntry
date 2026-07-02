package com.queryplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponseDto {
    private Long id;
    private String entityType;
    private Long entityId;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private UserDto changedBy;
    private LocalDateTime changedAt;
}
