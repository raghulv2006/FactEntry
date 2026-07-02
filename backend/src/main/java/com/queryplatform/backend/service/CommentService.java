package com.queryplatform.backend.service;

import com.queryplatform.backend.entity.*;
import com.queryplatform.backend.repository.CommentRepository;
import com.queryplatform.backend.repository.QueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final QueryRepository queryRepository;
    private final QueryService queryService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<Comment> getCommentsForQuery(Long queryId) {
        return commentRepository.findByQueryIdOrderByCreatedAtAsc(queryId);
    }

    @Transactional
    public Comment addComment(Long queryId, String commentText, CommentType commentType, User author) {
        Query query = queryRepository.findById(queryId)
                .orElseThrow(() -> new IllegalArgumentException("Query not found: " + queryId));

        if (commentType == CommentType.RESOLUTION) {
            if (author.getRole() != Role.SME && author.getRole() != Role.ADMIN) {
                throw new SecurityException("Only SMEs or Admins can submit resolution comments");
            }
        }

        Comment comment = Comment.builder()
                .query(query)
                .author(author)
                .commentType(commentType)
                .commentText(commentText)
                .build();

        Comment savedComment = commentRepository.save(comment);

        // Audit comment addition
        auditLogService.logChange("COMMENT", savedComment.getId(), "commentText", null, commentText, author);

        // If comment type is RESOLUTION, transition query status to RESOLVED
        if (commentType == CommentType.RESOLUTION && query.getStatus() != QueryStatus.RESOLVED) {
            queryService.updateStatus(queryId, QueryStatus.RESOLVED, author);
        }

        return savedComment;
    }
}
