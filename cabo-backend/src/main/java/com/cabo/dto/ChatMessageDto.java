package com.cabo.dto;

import com.cabo.entity.ChatMessage;

public class ChatMessageDto {
    private Long id;
    private Long rideId;
    private Long senderId;
    private String senderName;
    private String content;
    private String timestamp;

    public static ChatMessageDto fromEntity(ChatMessage msg) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.id = msg.getId();
        dto.rideId = msg.getRide().getId();
        dto.senderId = msg.getSender().getId();
        dto.senderName = msg.getSender().getName();
        dto.content = msg.getContent();
        dto.timestamp = msg.getTimestamp() != null ? msg.getTimestamp().toString() : null;
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
