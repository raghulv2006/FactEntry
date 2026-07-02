package com.queryplatform.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "queries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Query {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "query_number", nullable = false, unique = true, length = 50)
    private String queryNumber;

    @Column(name = "date_raised", nullable = false)
    private LocalDateTime dateRaised;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(name = "source_link", length = 1024)
    private String sourceLink;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QueryStatus status;

    @Column(name = "critical_flag", nullable = false)
    private Boolean criticalFlag = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_sme_id")
    private User assignedSme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "query_flags", joinColumns = @JoinColumn(name = "query_id"))
    @Column(name = "flag", nullable = false)
    @Builder.Default
    private Set<String> flags = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
