package com.cabo.repository;

import com.cabo.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRideIdOrderByTimestampAsc(Long rideId);
    List<ChatMessage> findByRideIdAndIdGreaterThanOrderByTimestampAsc(Long rideId, Long afterId);
}
