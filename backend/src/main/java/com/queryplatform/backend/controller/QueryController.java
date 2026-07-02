package com.queryplatform.backend.controller;

import com.queryplatform.backend.dto.*;
import com.queryplatform.backend.entity.*;
import com.queryplatform.backend.security.CustomUserDetails;
import com.queryplatform.backend.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLConnection;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/queries")
@RequiredArgsConstructor
public class QueryController {

    private final QueryService queryService;
    private final UserService userService;
    private final CommentService commentService;
    private final AttachmentService attachmentService;
    private final ExportService exportService;
    private final AuditLogService auditLogService;

    private User getAuthenticatedUser(CustomUserDetails userDetails) {
        return userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new SecurityException("Unauthorized"));
    }

    private Specification<Query> buildSpecification(
            QueryStatus status,
            Long smeId,
            Long createdById,
            LocalDateTime start,
            LocalDateTime end,
            String flag,
            String search,
            Boolean critical) {
        
        Specification<Query> spec = Specification.where(null);
        if (status != null) spec = spec.and(QuerySpecifications.hasStatus(status));
        if (smeId != null) spec = spec.and(QuerySpecifications.hasSmeId(smeId));
        if (createdById != null) spec = spec.and(QuerySpecifications.hasCreatedById(createdById));
        if (start != null) spec = spec.and(QuerySpecifications.hasDateRaisedAfter(start));
        if (end != null) spec = spec.and(QuerySpecifications.hasDateRaisedBefore(end));
        if (flag != null) spec = spec.and(QuerySpecifications.hasFlag(flag));
        if (search != null) spec = spec.and(QuerySpecifications.searchKeyword(search));
        if (critical != null) spec = spec.and(QuerySpecifications.isCritical(critical));
        
        return spec;
    }

    @PostMapping
    public ResponseEntity<QueryResponseDto> createQuery(
            @Valid @RequestBody QueryCreateDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User creator = getAuthenticatedUser(userDetails);
        Query query = queryService.createQuery(dto, creator);
        return ResponseEntity.ok(ModelMapper.toQueryResponseDto(query));
    }

    @GetMapping
    public ResponseEntity<Page<QueryResponseDto>> getQueries(
            @RequestParam(required = false) QueryStatus status,
            @RequestParam(required = false) Long smeId,
            @RequestParam(required = false) Long createdById,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String flag,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean critical,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateRaised,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") 
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        Specification<Query> spec = buildSpecification(status, smeId, createdById, start, end, flag, search, critical);
        Page<QueryResponseDto> response = queryService.searchQueries(spec, pageable)
                .map(ModelMapper::toQueryResponseDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueryResponseDto> getQueryById(@PathVariable Long id) {
        Query query = queryService.getQueryById(id);
        return ResponseEntity.ok(ModelMapper.toQueryResponseDto(query));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<QueryResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestParam QueryStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User actor = getAuthenticatedUser(userDetails);
        Query query = queryService.updateStatus(id, status, actor);
        return ResponseEntity.ok(ModelMapper.toQueryResponseDto(query));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<QueryResponseDto> assignQuery(
            @PathVariable Long id,
            @RequestParam(required = false) Long smeId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User actor = getAuthenticatedUser(userDetails);
        Query query = queryService.assignQuery(id, smeId, actor);
        return ResponseEntity.ok(ModelMapper.toQueryResponseDto(query));
    }

    @PutMapping("/{id}/critical")
    public ResponseEntity<QueryResponseDto> toggleCritical(
            @PathVariable Long id,
            @RequestParam boolean critical,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User actor = getAuthenticatedUser(userDetails);
        Query query = queryService.toggleCritical(id, critical, actor);
        return ResponseEntity.ok(ModelMapper.toQueryResponseDto(query));
    }

    @PutMapping("/{id}/flags")
    public ResponseEntity<QueryResponseDto> updateFlags(
            @PathVariable Long id,
            @RequestBody Set<String> flags,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User actor = getAuthenticatedUser(userDetails);
        Query query = queryService.updateFlags(id, flags, actor);
        return ResponseEntity.ok(ModelMapper.toQueryResponseDto(query));
    }

    // Threaded Comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDto>> getComments(@PathVariable Long id) {
        List<CommentResponseDto> list = commentService.getCommentsForQuery(id).stream()
                .map(ModelMapper::toCommentResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDto> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentCreateDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User author = getAuthenticatedUser(userDetails);
        CommentType type = CommentType.NORMAL;
        if (dto.getCommentType() != null) {
            type = CommentType.valueOf(dto.getCommentType().toUpperCase());
        }
        Comment comment = commentService.addComment(id, dto.getCommentText(), type, author);
        return ResponseEntity.ok(ModelMapper.toCommentResponseDto(comment));
    }

    // Attachments
    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<AttachmentResponseDto>> getAttachments(@PathVariable Long id) {
        List<AttachmentResponseDto> list = attachmentService.getAttachmentsForQuery(id).stream()
                .map(ModelMapper::toAttachmentResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentResponseDto> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        User uploader = getAuthenticatedUser(userDetails);
        Attachment attachment = attachmentService.saveAttachment(id, file, uploader);
        return ResponseEntity.ok(ModelMapper.toAttachmentResponseDto(attachment));
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long attachmentId) throws IOException {
        Attachment attachment = attachmentService.getAttachmentById(attachmentId);
        java.io.File file = new java.io.File(attachment.getFilePath());
        
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        ByteArrayResource resource = new ByteArrayResource(java.nio.file.Files.readAllBytes(Paths.get(attachment.getFilePath())));
        String mimeType = URLConnection.guessContentTypeFromName(attachment.getFileName());
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(mimeType))
                .contentLength(file.length())
                .body(resource);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User actor = getAuthenticatedUser(userDetails);
        attachmentService.deleteAttachment(attachmentId, actor);
        return ResponseEntity.noContent().build();
    }

    // Audit Logs
    @GetMapping("/{id}/audit-logs")
    public ResponseEntity<List<AuditLogResponseDto>> getQueryAuditLogs(@PathVariable Long id) {
        List<AuditLogResponseDto> list = auditLogService.getAuditLogsForEntity("QUERY", id).stream()
                .map(ModelMapper::toAuditLogResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // Duplicate Check
    @PostMapping("/duplicate-check")
    public ResponseEntity<List<DuplicateQueryDto>> checkDuplicates(@RequestBody QueryCreateDto dto) {
        List<DuplicateQueryDto> list = queryService.checkDuplicates(dto.getSubject(), dto.getQuestion(), dto.getSourceLink());
        return ResponseEntity.ok(list);
    }

    // Exports
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) QueryStatus status,
            @RequestParam(required = false) Long smeId,
            @RequestParam(required = false) Long createdById,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String flag,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean critical) throws IOException {

        Specification<Query> spec = buildSpecification(status, smeId, createdById, start, end, flag, search, critical);
        List<Query> queries = queryService.searchQueriesList(spec);
        byte[] data = exportService.exportToExcel(queries);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"queries_report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) QueryStatus status,
            @RequestParam(required = false) Long smeId,
            @RequestParam(required = false) Long createdById,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String flag,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean critical) throws Exception {

        Specification<Query> spec = buildSpecification(status, smeId, createdById, start, end, flag, search, critical);
        List<Query> queries = queryService.searchQueriesList(spec);
        byte[] data = exportService.exportToPdf(queries);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"queries_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
