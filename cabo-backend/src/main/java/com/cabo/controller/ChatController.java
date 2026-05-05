package com.cabo.controller;

import com.cabo.config.FirebaseTokenVerifier;
import com.cabo.dto.ChatMessageDto;
import com.cabo.entity.ChatMessage;
import com.cabo.entity.Ride;
import com.cabo.entity.User;
import com.cabo.repository.BookingRepository;
import com.cabo.repository.ChatMessageRepository;
import com.cabo.repository.RideRepository;
import com.cabo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FirebaseTokenVerifier firebaseTokenVerifier;

    public ChatController(ChatMessageRepository chatMessageRepository,
                          RideRepository rideRepository,
                          BookingRepository bookingRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate,
                          FirebaseTokenVerifier firebaseTokenVerifier) {
        this.chatMessageRepository = chatMessageRepository;
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.firebaseTokenVerifier = firebaseTokenVerifier;
    }

    @GetMapping("/api/rides/{rideId}/messages")
    public ResponseEntity<?> getMessages(@AuthenticationPrincipal User user,
                                          @PathVariable Long rideId,
                                          @RequestParam(required = false, defaultValue = "0") Long after) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (!bookingRepository.existsByRideIdAndUserId(rideId, user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Must join this ride to view messages"));
        }

        List<ChatMessageDto> messages;
        if (after > 0) {
            messages = chatMessageRepository.findByRideIdAndIdGreaterThanOrderByTimestampAsc(rideId, after)
                .stream().map(ChatMessageDto::fromEntity).collect(Collectors.toList());
        } else {
            messages = chatMessageRepository.findByRideIdOrderByTimestampAsc(rideId)
                .stream().map(ChatMessageDto::fromEntity).collect(Collectors.toList());
        }

        return ResponseEntity.ok(Map.of("messages", messages));
    }

    @PostMapping("/api/rides/{rideId}/messages")
    public ResponseEntity<?> sendMessage(@AuthenticationPrincipal User user,
                                          @PathVariable Long rideId,
                                          @RequestBody Map<String, String> body) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        if (!bookingRepository.existsByRideIdAndUserId(rideId, user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Must join this ride to send messages"));
        }

        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return ResponseEntity.status(404).body(Map.of("error", "Ride not found"));

        ChatMessage msg = new ChatMessage(ride, user, content.trim());
        msg = chatMessageRepository.save(msg);

        ChatMessageDto dto = ChatMessageDto.fromEntity(msg);

        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/ride/" + rideId, dto);

        return ResponseEntity.status(201).body(Map.of("message", dto));
    }

    // WebSocket message handler
    @MessageMapping("/chat/{rideId}")
    public void handleWebSocketMessage(@DestinationVariable Long rideId,
                                        @Payload Map<String, String> payload,
                                        @Header(value = "Authorization", required = false) String authHeader) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        if (token == null) {
            token = payload.get("token");
        }
        if (token == null) return;

        User user = null;
        try {
            Map<String, Object> claims = firebaseTokenVerifier.verifyIdToken(token);
            String uid = firebaseTokenVerifier.getUid(claims);
            String email = firebaseTokenVerifier.getEmail(claims);
            user = userRepository.findByFirebaseUid(uid).orElseGet(() -> {
                if (email != null) return userRepository.findByEmail(email).orElse(null);
                return null;
            });
        } catch (Exception e) {
            return;
        }
        if (user == null || user.isBlocked()) return;
        Long userId = user.getId();

        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) return;

        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return;

        if (!bookingRepository.existsByRideIdAndUserId(rideId, userId)) return;

        ChatMessage msg = new ChatMessage(ride, user, content.trim());
        msg = chatMessageRepository.save(msg);

        messagingTemplate.convertAndSend("/topic/ride/" + rideId, ChatMessageDto.fromEntity(msg));
    }
}
