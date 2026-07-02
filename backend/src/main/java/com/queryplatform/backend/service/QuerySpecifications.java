package com.queryplatform.backend.service;

import com.queryplatform.backend.entity.Query;
import com.queryplatform.backend.entity.QueryStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class QuerySpecifications {

    public static Specification<Query> hasStatus(QueryStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Query> hasSmeId(Long smeId) {
        return (root, query, cb) -> smeId == null ? null : cb.equal(root.get("assignedSme").get("id"), smeId);
    }

    public static Specification<Query> hasCreatedById(Long createdById) {
        return (root, query, cb) -> createdById == null ? null : cb.equal(root.get("createdBy").get("id"), createdById);
    }

    public static Specification<Query> hasDateRaisedAfter(LocalDateTime start) {
        return (root, query, cb) -> start == null ? null : cb.greaterThanOrEqualTo(root.get("dateRaised"), start);
    }

    public static Specification<Query> hasDateRaisedBefore(LocalDateTime end) {
        return (root, query, cb) -> end == null ? null : cb.lessThanOrEqualTo(root.get("dateRaised"), end);
    }

    public static Specification<Query> hasFlag(String flag) {
        return (root, query, cb) -> {
            if (flag == null || flag.trim().isEmpty()) return null;
            return cb.isMember(flag.trim(), root.get("flags"));
        };
    }

    public static Specification<Query> searchKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) return null;
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("subject")), pattern),
                    cb.like(cb.lower(root.get("question")), pattern),
                    cb.like(cb.lower(root.get("queryNumber")), pattern)
            );
        };
    }

    public static Specification<Query> isCritical(Boolean critical) {
        return (root, query, cb) -> cb.equal(root.get("criticalFlag"), cb.literal(critical));
    }
}
