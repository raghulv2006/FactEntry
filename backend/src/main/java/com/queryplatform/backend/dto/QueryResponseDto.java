package com.queryplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueryResponseDto {
    private Long id;
    private String queryNumber;
    private LocalDateTime dateRaised;
    private String subject;
    private String sourceLink;
    private String question;
    private String status;
    private Boolean criticalFlag;
    private UserDto assignedSme;
    private UserDto createdBy;
    private Set<String> flags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
