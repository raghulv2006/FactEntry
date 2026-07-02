package com.queryplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueryCreateDto {

    @NotBlank(message = "Subject is required")
    private String subject;

    private String sourceLink;

    @NotBlank(message = "Question text is required")
    private String question;

    private Set<String> flags;

    private Boolean criticalFlag;
}
