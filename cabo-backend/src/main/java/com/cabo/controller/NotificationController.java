package com.cabo.controller;

import com.cabo.entity.Notification;
import com.cabo.entity.User;
import com.cabo.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        long unreadCount = notificationRepository.countByUserIdAndReadFalse(user.getId());

        List<Map<String, Object>> notifDtos = notifications.stream().map(n -> Map.<String, Object>of(
            "id", n.getId(),
            "message", n.getMessage(),
            "type", n.getType(),
            "rideId", n.getRideId() != null ? n.getRideId() : 0,
            "read", n.isRead(),
            "createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : ""
        )).toList();

        return ResponseEntity.ok(Map.of("notifications", notifDtos, "unreadCount", unreadCount));
    }

    @PutMapping("/read")
    @Transactional
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        notificationRepository.markAllReadByUserId(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
