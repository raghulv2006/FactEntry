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
public class CommentResponseDto {
    private Long id;
    private Long queryId;
    private UserDto author;
    private String commentType;
    private String commentText;
    private LocalDateTime createdAt;
}
