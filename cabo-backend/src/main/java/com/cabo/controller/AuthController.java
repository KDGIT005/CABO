package com.cabo.controller;

import com.cabo.config.FirebaseTokenVerifier;
import com.cabo.dto.UserDto;
import com.cabo.entity.User;
import com.cabo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final FirebaseTokenVerifier firebaseTokenVerifier;

    @Value("${cabo.admin.email}")
    private String adminEmail;

    public AuthController(UserRepository userRepository, FirebaseTokenVerifier firebaseTokenVerifier) {
        this.userRepository = userRepository;
        this.firebaseTokenVerifier = firebaseTokenVerifier;
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncUser(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        try {
            Map<String, Object> claims = firebaseTokenVerifier.verifyIdToken(token);
            String uid = firebaseTokenVerifier.getUid(claims);
            String email = firebaseTokenVerifier.getEmail(claims);

            User user = userRepository.findByFirebaseUid(uid).orElseGet(() -> {
                if (email != null) {
                    return userRepository.findByEmail(email).orElse(null);
                }
                return null;
            });

            if (user == null) {
                // Create new user
                user = new User();
                user.setFirebaseUid(uid);
                user.setEmail(email != null ? email.toLowerCase() : uid + "@firebase.local");
                user.setName(body.getOrDefault("name", "Firebase User"));
                user.setPhone(body.getOrDefault("phone", ""));
            } else {
                // Update existing user with firebase uid if missing
                if (user.getFirebaseUid() == null) {
                    user.setFirebaseUid(uid);
                }
            }

            // Always ensure admin email gets the admin role
            if (user.getEmail().equalsIgnoreCase(adminEmail)) {
                user.setRole(User.Role.ADMIN);
            }

            user = userRepository.save(user);
            return ResponseEntity.ok(Map.of("user", UserDto.fromEntity(user)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        // Dynamically upgrade role if email matches admin email
        if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(adminEmail) && user.getRole() != User.Role.ADMIN) {
            user.setRole(User.Role.ADMIN);
            user = userRepository.save(user);
        }
        
        return ResponseEntity.ok(Map.of("user", UserDto.fromEntity(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User user,
                                            @RequestBody Map<String, String> body) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        if (body.containsKey("name")) user.setName(body.get("name"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        user = userRepository.save(user);
        return ResponseEntity.ok(Map.of("user", UserDto.fromEntity(user)));
    }
}
