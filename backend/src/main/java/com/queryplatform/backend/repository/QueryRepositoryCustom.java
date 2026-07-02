package com.queryplatform.backend.repository;

import com.queryplatform.backend.dto.DuplicateQueryDto;
import java.util.List;

public interface QueryRepositoryCustom {
    List<DuplicateQueryDto> findDuplicateQueries(String subject, String question, String sourceLink);
}
