package com.cabo.dto;

import com.cabo.entity.Booking;
import com.cabo.entity.Ride;
import java.util.List;
import java.util.stream.Collectors;

public class RideDto {
    private Long id;
    private String fromLocation;
    private String toLocation;
    private String date;
    private String time;
    private String carModel;
    private String carType;
    private String carNumber;
    private int totalSeats;
    private int seatsAvailable;
    private double totalPrice;
    private double pricePerSeat;
    private String phoneNumber;
    private String notes;
    private String status;
    private String createdAt;
    private UserDto driver;
    private List<UserDto> participants;
    private int participantCount;

    public static RideDto fromEntity(Ride ride) {
        RideDto dto = new RideDto();
        dto.id = ride.getId();
        dto.fromLocation = ride.getFromLocation();
        dto.toLocation = ride.getToLocation();
        dto.date = ride.getDate() != null ? ride.getDate().toString() : null;
        dto.time = ride.getTime() != null ? ride.getTime().toString() : null;
        dto.carModel = ride.getCarModel();
        dto.carType = ride.getCarType() != null ? ride.getCarType().name() : null;
        dto.carNumber = ride.getCarNumber();
        dto.totalSeats = ride.getTotalSeats();
        dto.seatsAvailable = ride.getSeatsAvailable();
        dto.totalPrice = ride.getTotalPrice();
        dto.pricePerSeat = ride.getTotalSeats() > 0 ? Math.round(ride.getTotalPrice() / ride.getTotalSeats()) : 0;
        dto.phoneNumber = ride.getPhoneNumber();
        dto.notes = ride.getNotes();
        dto.status = ride.getStatus().name();
        dto.createdAt = ride.getCreatedAt() != null ? ride.getCreatedAt().toString() : null;
        if (ride.getDriver() != null) {
            dto.driver = UserDto.fromEntity(ride.getDriver());
        }
        return dto;
    }

    public static RideDto fromEntityWithParticipants(Ride ride, List<Booking> bookings) {
        RideDto dto = fromEntity(ride);
        dto.participants = bookings.stream()
            .map(b -> UserDto.fromEntity(b.getUser()))
            .collect(Collectors.toList());
        dto.participantCount = bookings.size();
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFromLocation() { return fromLocation; }
    public void setFromLocation(String fromLocation) { this.fromLocation = fromLocation; }
    public String getToLocation() { return toLocation; }
    public void setToLocation(String toLocation) { this.toLocation = toLocation; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getCarModel() { return carModel; }
    public void setCarModel(String carModel) { this.carModel = carModel; }
    public String getCarType() { return carType; }
    public void setCarType(String carType) { this.carType = carType; }
    public String getCarNumber() { return carNumber; }
    public void setCarNumber(String carNumber) { this.carNumber = carNumber; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }
    public int getSeatsAvailable() { return seatsAvailable; }
    public void setSeatsAvailable(int seatsAvailable) { this.seatsAvailable = seatsAvailable; }
    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
    public double getPricePerSeat() { return pricePerSeat; }
    public void setPricePerSeat(double pricePerSeat) { this.pricePerSeat = pricePerSeat; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public UserDto getDriver() { return driver; }
    public void setDriver(UserDto driver) { this.driver = driver; }
    public List<UserDto> getParticipants() { return participants; }
    public void setParticipants(List<UserDto> participants) { this.participants = participants; }
    public int getParticipantCount() { return participantCount; }
    public void setParticipantCount(int participantCount) { this.participantCount = participantCount; }
}
