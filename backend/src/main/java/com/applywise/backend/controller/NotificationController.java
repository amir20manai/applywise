package com.applywise.backend.controller;

import com.applywise.backend.dto.NotificationResponse;
import com.applywise.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // LIST
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getMyNotifications(authentication.getName()));
    }

    // UNREAD COUNT
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication) {

        long count = notificationService.getUnreadCount(authentication.getName());

        return ResponseEntity.ok(Map.of("count", count));
    }

    // MARK AS READ
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.markAsRead(authentication.getName(), id));
    }

    // MARK ALL AS READ
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {

        notificationService.markAllAsRead(authentication.getName());

        return ResponseEntity.noContent().build();
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        notificationService.delete(authentication.getName(), id);

        return ResponseEntity.noContent().build();
    }
}