package com.queryplatform.backend.dto;

import com.queryplatform.backend.entity.*;

import java.util.stream.Collectors;

public class ModelMapper {

    public static UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public static QueryResponseDto toQueryResponseDto(Query query) {
        if (query == null) return null;
        return QueryResponseDto.builder()
                .id(query.getId())
                .queryNumber(query.getQueryNumber())
                .dateRaised(query.getDateRaised())
                .subject(query.getSubject())
                .sourceLink(query.getSourceLink())
                .question(query.getQuestion())
                .status(query.getStatus().name())
                .criticalFlag(query.getCriticalFlag())
                .assignedSme(toUserDto(query.getAssignedSme()))
                .createdBy(toUserDto(query.getCreatedBy()))
                .flags(query.getFlags())
                .createdAt(query.getCreatedAt())
                .updatedAt(query.getUpdatedAt())
                .build();
    }

    public static CommentResponseDto toCommentResponseDto(Comment comment) {
        if (comment == null) return null;
        return CommentResponseDto.builder()
                .id(comment.getId())
                .queryId(comment.getQuery().getId())
                .author(toUserDto(comment.getAuthor()))
                .commentType(comment.getCommentType().name())
                .commentText(comment.getCommentText())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public static AttachmentResponseDto toAttachmentResponseDto(Attachment attachment) {
        if (attachment == null) return null;
        return AttachmentResponseDto.builder()
                .id(attachment.getId())
                .queryId(attachment.getQuery().getId())
                .fileName(attachment.getFileName())
                .uploadedBy(toUserDto(attachment.getUploadedBy()))
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }

    public static NotificationResponseDto toNotificationResponseDto(Notification notification) {
        if (notification == null) return null;
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .queryId(notification.getQuery() != null ? notification.getQuery().getId() : null)
                .queryNumber(notification.getQuery() != null ? notification.getQuery().getQueryNumber() : null)
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public static AuditLogResponseDto toAuditLogResponseDto(AuditLog auditLog) {
        if (auditLog == null) return null;
        return AuditLogResponseDto.builder()
                .id(auditLog.getId())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .fieldName(auditLog.getFieldName())
                .oldValue(auditLog.getOldValue())
                .newValue(auditLog.getNewValue())
                .changedBy(toUserDto(auditLog.getChangedBy()))
                .changedAt(auditLog.getChangedAt())
                .build();
    }
}
