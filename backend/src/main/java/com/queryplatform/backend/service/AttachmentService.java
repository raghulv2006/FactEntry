package com.queryplatform.backend.service;

import com.queryplatform.backend.entity.Attachment;
import com.queryplatform.backend.entity.Query;
import com.queryplatform.backend.entity.User;
import com.queryplatform.backend.exception.ResourceNotFoundException;
import com.queryplatform.backend.repository.AttachmentRepository;
import com.queryplatform.backend.repository.QueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final QueryRepository queryRepository;
    private final AuditLogService auditLogService;

    @Value("${app.storage.upload-dir:./attachments}")
    private String uploadDir;

    @Transactional
    public Attachment saveAttachment(Long queryId, MultipartFile file, User uploader) throws IOException {
        Query query = queryRepository.findById(queryId)
                .orElseThrow(() -> new IllegalArgumentException("Query not found: " + queryId));

        // Ensure target directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // Sanitize file name and create a unique stored name to avoid duplicates
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unnamed";
        }
        String fileExtension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFileName.substring(dotIndex);
        }
        String storedFileName = UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = uploadPath.resolve(storedFileName);

        // Copy file stream to target location
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Attachment attachment = Attachment.builder()
                .query(query)
                .fileName(originalFileName)
                .filePath(targetLocation.toString())
                .uploadedBy(uploader)
                .build();

        Attachment savedAttachment = attachmentRepository.save(attachment);

        // Audit the upload
        auditLogService.logChange("ATTACHMENT", savedAttachment.getId(), "fileName", null, originalFileName, uploader);

        return savedAttachment;
    }

    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentsForQuery(Long queryId) {
        return attachmentRepository.findByQueryId(queryId);
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentById(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + id));
    }

    @Transactional
    public void deleteAttachment(Long id, User actor) {
        Attachment attachment = getAttachmentById(id);
        
        // Ensure uploader or Admin deletes it
        if (!attachment.getUploadedBy().getId().equals(actor.getId()) && actor.getRole() != com.queryplatform.backend.entity.Role.ADMIN) {
            throw new SecurityException("Not authorized to delete this attachment");
        }

        // Delete from storage
        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log issue but proceed to remove database record
        }

        attachmentRepository.delete(attachment);
        auditLogService.logChange("ATTACHMENT", id, "deleted", attachment.getFileName(), null, actor);
    }
}
