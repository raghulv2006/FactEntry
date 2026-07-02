package com.queryplatform.backend.repository;

import com.queryplatform.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByQueryIdOrderByCreatedAtAsc(Long queryId);
}
