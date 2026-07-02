package com.queryplatform.backend.service;

import com.queryplatform.backend.entity.Notification;
import com.queryplatform.backend.entity.Query;
import com.queryplatform.backend.entity.User;
import com.queryplatform.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void sendNotification(User user, String message, Query query) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .query(query)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(Long userId, boolean unreadOnly) {
        if (unreadOnly) {
            return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new SecurityException("Cannot read notifications of another user");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notif : unread) {
            notif.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
