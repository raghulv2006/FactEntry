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
public class AttachmentResponseDto {
    private Long id;
    private Long queryId;
    private String fileName;
    private UserDto uploadedBy;
    private LocalDateTime uploadedAt;
}
