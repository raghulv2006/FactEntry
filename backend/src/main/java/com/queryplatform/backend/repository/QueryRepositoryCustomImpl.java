package com.queryplatform.backend.repository;

import com.queryplatform.backend.dto.DuplicateQueryDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Session;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class QueryRepositoryCustomImpl implements QueryRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<DuplicateQueryDto> findDuplicateQueries(String subject, String question, String sourceLink) {
        String dbType = getDatabaseType();
        List<Object[]> results;

        if ("PostgreSQL".equalsIgnoreCase(dbType)) {
            // Check keywords from question for FTS plainto_tsquery
            String keywords = question != null ? question.trim() : "";
            if (keywords.isEmpty()) {
                keywords = "dummy";
            }
            
            String pgSql = "SELECT q.id, q.query_number, q.subject, q.status, q.created_at, " +
                    "CAST((CASE WHEN q.source_link = :sourceLink THEN 1.0 ELSE 0.0 END) * 0.4 + " +
                    "similarity(COALESCE(q.subject, ''), :subject) * 0.3 + " +
                    "ts_rank(to_tsvector('english', COALESCE(q.question, '')), plainto_tsquery('english', :keywords)) * 0.3 AS double precision) AS similarity_score " +
                    "FROM queries q " +
                    "WHERE (q.source_link IS NOT NULL AND q.source_link <> '' AND q.source_link = :sourceLink) " +
                    "   OR similarity(COALESCE(q.subject, ''), :subject) > 0.1 " +
                    "   OR to_tsvector('english', COALESCE(q.question, '')) @@ plainto_tsquery('english', :keywords) " +
                    "ORDER BY similarity_score DESC " +
                    "LIMIT 3";

            results = entityManager.createNativeQuery(pgSql)
                    .setParameter("sourceLink", sourceLink != null ? sourceLink : "")
                    .setParameter("subject", subject != null ? subject : "")
                    .setParameter("keywords", keywords)
                    .getResultList();
        } else {
            // H2 or other database fallback
            String subjectLike = "%" + (subject != null ? subject.trim() : "") + "%";
            String questionLike = "%" + (question != null ? question.trim() : "") + "%";

            String fallbackSql = "SELECT q.id, q.query_number, q.subject, q.status, q.created_at, " +
                    "CAST((CASE WHEN q.source_link = :sourceLink THEN 1.0 ELSE 0.0 END) * 0.4 + " +
                    "(CASE WHEN LOWER(q.subject) LIKE LOWER(:subjectLike) THEN 0.3 ELSE 0.0 END) + " +
                    "(CASE WHEN LOWER(q.question) LIKE LOWER(:questionLike) THEN 0.3 ELSE 0.0 END) AS double precision) AS similarity_score " +
                    "FROM queries q " +
                    "WHERE (q.source_link IS NOT NULL AND q.source_link = :sourceLink) " +
                    "   OR LOWER(q.subject) LIKE LOWER(:subjectLike) " +
                    "   OR LOWER(q.question) LIKE LOWER(:questionLike) " +
                    "ORDER BY similarity_score DESC " +
                    "LIMIT 3";

            results = entityManager.createNativeQuery(fallbackSql)
                    .setParameter("sourceLink", sourceLink != null ? sourceLink : "")
                    .setParameter("subjectLike", subjectLike)
                    .setParameter("questionLike", questionLike)
                    .getResultList();
        }

        List<DuplicateQueryDto> dtoList = new ArrayList<>();
        for (Object[] row : results) {
            Long id = ((Number) row[0]).longValue();
            String queryNumber = (String) row[1];
            String sub = (String) row[2];
            String status = (String) row[3];
            
            LocalDateTime createdAt = null;
            if (row[4] != null) {
                if (row[4] instanceof Timestamp) {
                    createdAt = ((Timestamp) row[4]).toLocalDateTime();
                } else if (row[4] instanceof java.time.LocalDateTime) {
                    createdAt = (LocalDateTime) row[4];
                }
            }

            Double score = 0.0;
            if (row[5] != null) {
                if (row[5] instanceof BigDecimal) {
                    score = ((BigDecimal) row[5]).doubleValue();
                } else if (row[5] instanceof Double) {
                    score = (Double) row[5];
                } else if (row[5] instanceof Float) {
                    score = ((Float) row[5]).doubleValue();
                }
            }

            dtoList.add(DuplicateQueryDto.builder()
                    .id(id)
                    .queryNumber(queryNumber)
                    .subject(sub)
                    .status(status)
                    .createdAt(createdAt)
                    .similarityScore(score)
                    .build());
        }

        return dtoList;
    }

    private String getDatabaseType() {
        try {
            return entityManager.unwrap(Session.class).doReturningWork(connection -> 
                connection.getMetaData().getDatabaseProductName()
            );
        } catch (Exception e) {
            return "H2";
        }
    }
}
