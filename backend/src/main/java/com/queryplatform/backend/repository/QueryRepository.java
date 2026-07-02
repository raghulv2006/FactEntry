package com.queryplatform.backend.repository;

import com.queryplatform.backend.entity.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface QueryRepository extends JpaRepository<Query, Long>, JpaSpecificationExecutor<Query>, QueryRepositoryCustom {
    long countByCreatedAtAfter(LocalDateTime dateTime);
}
