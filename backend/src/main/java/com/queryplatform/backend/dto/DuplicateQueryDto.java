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
public class DuplicateQueryDto {
    private Long id;
    private String queryNumber;
    private String subject;
    private String status;
    private LocalDateTime createdAt;
    private Double similarityScore;
}
