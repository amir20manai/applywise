package com.applywise.backend.service;

import com.applywise.backend.dto.NotificationResponse;
import com.applywise.backend.entity.Notification;
import com.applywise.backend.entity.NotificationType;
import com.applywise.backend.entity.User;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.NotificationRepository;
import com.applywise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // CREATE (usage interne: appelée par d'autres services, pas d'endpoint)
    @Transactional
    public void create(User user, String title, String message, NotificationType type) {

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .build();

        notificationRepository.save(notification);
    }

    // LIST
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email) {

        User user = findUser(email);

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // UNREAD COUNT
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {

        User user = findUser(email);

        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    // MARK AS READ
    @Transactional
    public NotificationResponse markAsRead(String email, Long id) {

        User user = findUser(email);
        Notification notification = findOwnedNotification(user, id);

        notification.setRead(true);

        // Pas de save() : dirty checking
        return toResponse(notification);
    }

    // MARK ALL AS READ
    @Transactional
    public void markAllAsRead(String email) {

        User user = findUser(email);

        notificationRepository.findByUserIdAndIsReadFalse(user.getId())
                .forEach(n -> n.setRead(true));
    }

    // DELETE
    @Transactional
    public void delete(String email, Long id) {

        User user = findUser(email);
        Notification notification = findOwnedNotification(user, id);

        notificationRepository.delete(notification);
    }

    // ---------- méthodes privées ----------

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Notification findOwnedNotification(User user, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }
        return notification;
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}