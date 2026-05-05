package com.cabo.service;

import com.cabo.entity.Notification;
import com.cabo.entity.User;
import com.cabo.repository.NotificationRepository;
import com.cabo.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public AdminService(UserRepository userRepository,
                        NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    public String warnUser(Long userId, String message) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return "User not found";

        String warnMessage = message != null && !message.isBlank()
            ? message
            : "You have received a warning from the admin. Please follow platform guidelines.";

        notificationRepository.save(new Notification(user, warnMessage, "warning", null));
        return null;
    }

    public String blockUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return "User not found";
        if (user.getRole() == User.Role.ADMIN) return "Cannot block an admin";

        user.setBlocked(true);
        userRepository.save(user);

        notificationRepository.save(new Notification(
            user,
            "Your account has been blocked by the admin due to policy violations.",
            "block",
            null
        ));

        return null;
    }

    public String unblockUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return "User not found";

        user.setBlocked(false);
        userRepository.save(user);

        notificationRepository.save(new Notification(
            user,
            "Your account has been unblocked. You can now use the platform again.",
            "unblock",
            null
        ));

        return null;
    }
}
