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
public class NotificationResponseDto {
    private Long id;
    private String message;
    private Long queryId;
    private String queryNumber;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
