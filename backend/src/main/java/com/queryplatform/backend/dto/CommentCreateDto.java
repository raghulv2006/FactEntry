package com.queryplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentCreateDto {

    @NotBlank(message = "Comment text cannot be empty")
    private String commentText;

    private String commentType; // NORMAL, RESOLUTION
}
