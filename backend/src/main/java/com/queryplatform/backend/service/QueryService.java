package com.queryplatform.backend.service;

import com.queryplatform.backend.dto.DuplicateQueryDto;
import com.queryplatform.backend.dto.QueryCreateDto;
import com.queryplatform.backend.dto.UserDto;
import com.queryplatform.backend.entity.*;
import com.queryplatform.backend.exception.ResourceNotFoundException;
import com.queryplatform.backend.repository.QueryRepository;
import com.queryplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class QueryService {

    private final QueryRepository queryRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public synchronized String generateQueryNumber() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayCount = queryRepository.countByCreatedAtAfter(startOfDay);
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return String.format("Q-%s-%04d", dateStr, todayCount + 1);
    }

    @Transactional
    public Query createQuery(QueryCreateDto dto, User creator) {
        String queryNumber = generateQueryNumber();
        Query query = Query.builder()
                .queryNumber(queryNumber)
                .dateRaised(LocalDateTime.now())
                .subject(dto.getSubject())
                .sourceLink(dto.getSourceLink())
                .question(dto.getQuestion())
                .status(QueryStatus.OPEN)
                .criticalFlag(dto.getCriticalFlag() != null ? dto.getCriticalFlag() : false)
                .createdBy(creator)
                .flags(dto.getFlags() != null ? new HashSet<>(dto.getFlags()) : new HashSet<>())
                .build();

        Query savedQuery = queryRepository.save(query);

        // Audit the creation
        auditLogService.logChange("QUERY", savedQuery.getId(), "status", null, "OPEN", creator);

        // Notify all SMEs of a new query raised
        List<User> smes = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.SME)
                .toList();
        for (User sme : smes) {
            notificationService.sendNotification(sme, "New query " + queryNumber + " raised: " + dto.getSubject(), savedQuery);
        }

        return savedQuery;
    }

    @Transactional(readOnly = true)
    public Page<Query> searchQueries(Specification<Query> spec, Pageable pageable) {
        return queryRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public List<Query> searchQueriesList(Specification<Query> spec) {
        return queryRepository.findAll(spec);
    }

    @Transactional(readOnly = true)
    public Query getQueryById(Long id) {
        return queryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Query not found with id: " + id));
    }

    @Transactional
    public Query assignQuery(Long queryId, Long smeId, User actor) {
        Query query = getQueryById(queryId);
        
        // Enforce SME / Admin role required
        if (actor.getRole() != Role.SME && actor.getRole() != Role.ADMIN) {
            throw new SecurityException("Only SMEs or Admins can assign queries");
        }

        User sme = null;
        if (smeId != null) {
            sme = userRepository.findById(smeId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + smeId));
            if (sme.getRole() != Role.SME) {
                throw new IllegalArgumentException("Assigned user must be an SME");
            }
        }

        String oldSme = query.getAssignedSme() != null ? query.getAssignedSme().getEmail() : "Unassigned";
        String newSme = sme != null ? sme.getEmail() : "Unassigned";
        QueryStatus oldStatus = query.getStatus();
        QueryStatus newStatus = oldStatus;

        query.setAssignedSme(sme);
        
        // Auto transition status if assigned and currently OPEN
        if (sme != null && query.getStatus() == QueryStatus.OPEN) {
            query.setStatus(QueryStatus.IN_PROGRESS);
            newStatus = QueryStatus.IN_PROGRESS;
        }

        Query savedQuery = queryRepository.save(query);

        // Logging changes
        if (!oldSme.equals(newSme)) {
            auditLogService.logChange("QUERY", queryId, "assignedSme", oldSme, newSme, actor);
        }
        if (oldStatus != newStatus) {
            auditLogService.logChange("QUERY", queryId, "status", oldStatus.name(), newStatus.name(), actor);
        }

        // Send notifications
        notificationService.sendNotification(query.getCreatedBy(), 
                "Your query " + query.getQueryNumber() + " has been assigned to " + (sme != null ? sme.getName() : "Unassigned"), query);
        if (sme != null && !sme.getId().equals(actor.getId())) {
            notificationService.sendNotification(sme, 
                    "You have been assigned query " + query.getQueryNumber(), query);
        }

        return savedQuery;
    }

    @Transactional
    public Query updateStatus(Long queryId, QueryStatus targetStatus, User actor) {
        Query query = getQueryById(queryId);
        QueryStatus oldStatus = query.getStatus();

        if (oldStatus == targetStatus) {
            return query;
        }

        // Status transition permissions check
        if (targetStatus == QueryStatus.CLOSED) {
            // Analysts can only close their own RESOLVED queries
            if (actor.getRole() == Role.ANALYST) {
                if (!query.getCreatedBy().getId().equals(actor.getId())) {
                    throw new SecurityException("Analysts can only close their own queries");
                }
                if (oldStatus != QueryStatus.RESOLVED) {
                    throw new IllegalArgumentException("Query must be RESOLVED before it can be closed");
                }
            } else if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.SME) {
                throw new SecurityException("Unauthorized role for status transition");
            }
        } else if (targetStatus == QueryStatus.RESOLVED) {
            // Only SMEs and Admins can mark resolved
            if (actor.getRole() != Role.SME && actor.getRole() != Role.ADMIN) {
                throw new SecurityException("Only SMEs or Admins can mark queries as resolved");
            }
        } else if (targetStatus == QueryStatus.IN_PROGRESS || targetStatus == QueryStatus.OPEN) {
            if (actor.getRole() != Role.SME && actor.getRole() != Role.ADMIN) {
                throw new SecurityException("Only SMEs or Admins can revert/modify query progress status");
            }
        }

        query.setStatus(targetStatus);
        Query savedQuery = queryRepository.save(query);

        auditLogService.logChange("QUERY", queryId, "status", oldStatus.name(), targetStatus.name(), actor);

        // Notify user about status change
        notificationService.sendNotification(query.getCreatedBy(), 
                "Query " + query.getQueryNumber() + " status updated to " + targetStatus.name(), query);

        return savedQuery;
    }

    @Transactional
    public Query toggleCritical(Long queryId, boolean critical, User actor) {
        if (actor.getRole() != Role.SME && actor.getRole() != Role.ADMIN) {
            throw new SecurityException("Only SMEs or Admins can modify query criticality");
        }

        Query query = getQueryById(queryId);
        boolean oldCritical = query.getCriticalFlag();
        if (oldCritical != critical) {
            query.setCriticalFlag(critical);
            query = queryRepository.save(query);
            auditLogService.logChange("QUERY", queryId, "criticalFlag", String.valueOf(oldCritical), String.valueOf(critical), actor);
        }
        return query;
    }

    @Transactional
    public Query updateFlags(Long queryId, Set<String> flags, User actor) {
        if (actor.getRole() != Role.SME && actor.getRole() != Role.ADMIN) {
            throw new SecurityException("Only SMEs or Admins can modify query flags");
        }

        Query query = getQueryById(queryId);
        Set<String> oldFlags = new HashSet<>(query.getFlags());
        query.setFlags(flags != null ? new HashSet<>(flags) : new HashSet<>());
        query = queryRepository.save(query);

        auditLogService.logChange("QUERY", queryId, "flags", oldFlags.toString(), query.getFlags().toString(), actor);
        return query;
    }

    @Transactional(readOnly = true)
    public List<DuplicateQueryDto> checkDuplicates(String subject, String question, String sourceLink) {
        return queryRepository.findDuplicateQueries(subject, question, sourceLink);
    }
}
