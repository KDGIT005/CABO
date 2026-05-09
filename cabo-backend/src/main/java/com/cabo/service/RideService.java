package com.cabo.service;

import com.cabo.dto.RideDto;
import com.cabo.dto.RideRequest;
import com.cabo.entity.*;
import com.cabo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;

    public RideService(RideRepository rideRepository,
                       BookingRepository bookingRepository,
                       NotificationRepository notificationRepository) {
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<RideDto> searchRides(String fromLocation, String toLocation, String date) {
        LocalDate searchDate = null;
        if (date != null && !date.isBlank()) {
            searchDate = LocalDate.parse(date);
        }
        List<Ride> rides = rideRepository.findByStatusAndSeatsAvailableGreaterThanOrderByDateAscTimeAsc(Ride.RideStatus.ACTIVE, 0);
        
        final LocalDate finalSearchDate = searchDate;
        
        return rides.stream()
            .filter(r -> fromLocation == null || fromLocation.isBlank() || r.getFromLocation().toLowerCase().contains(fromLocation.toLowerCase()))
            .filter(r -> toLocation == null || toLocation.isBlank() || r.getToLocation().toLowerCase().contains(toLocation.toLowerCase()))
            .filter(r -> finalSearchDate == null || r.getDate().equals(finalSearchDate))
            .map(r -> {
                RideDto dto = RideDto.fromEntity(r);
                dto.setParticipantCount((int) bookingRepository.countByRideId(r.getId()));
                return dto;
            }).collect(Collectors.toList());
    }

    @Transactional
    public Ride createRide(User driver, RideRequest request) {
        Ride ride = new Ride();
        ride.setDriver(driver);
        ride.setFromLocation(request.getFromLocation());
        ride.setToLocation(request.getToLocation());
        ride.setDate(LocalDate.parse(request.getDate()));
        ride.setTime(LocalTime.parse(request.getTime()));
        ride.setCarModel(request.getCarModel());
        ride.setCarType(Ride.CarType.valueOf(request.getCarType().toUpperCase()));
        ride.setCarNumber(request.getCarNumber());
        ride.setTotalSeats(request.getSeatsAvailable() + 1); // +1 for the driver
        ride.setSeatsAvailable(request.getSeatsAvailable());
        ride.setTotalPrice(request.getTotalPrice());
        ride.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : driver.getPhone());
        ride.setNotes(request.getNotes() != null ? request.getNotes() : "");

        ride = rideRepository.save(ride);

        // Add driver as participant
        bookingRepository.save(new Booking(ride, driver));

        return ride;
    }

    public RideDto getRideDetail(Long rideId) {
        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return null;

        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        return RideDto.fromEntityWithParticipants(ride, bookings);
    }

    @Transactional
    public String joinRide(User user, Long rideId) {
        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return "Ride not found";
        if (ride.getStatus() != Ride.RideStatus.ACTIVE) return "Ride is no longer active";
        if (ride.getSeatsAvailable() <= 0) return "No seats available";
        if (bookingRepository.existsByRideIdAndUserId(rideId, user.getId())) return "Already joined this ride";
        if (user.isBlocked()) return "Your account is blocked";

        bookingRepository.save(new Booking(ride, user));
        ride.setSeatsAvailable(ride.getSeatsAvailable() - 1);
        rideRepository.save(ride);

        // Notify driver
        notificationRepository.save(new Notification(
            ride.getDriver(),
            user.getName() + " joined your ride from " + ride.getFromLocation() + " to " + ride.getToLocation(),
            "join",
            ride.getId()
        ));

        return null; // null = success
    }

    @Transactional
    public String leaveRide(User user, Long rideId) {
        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return "Ride not found";
        if (ride.getDriver().getId().equals(user.getId())) return "Driver cannot leave their own ride";

        Booking booking = bookingRepository.findByRideIdAndUserId(rideId, user.getId()).orElse(null);
        if (booking == null) return "Not in this ride";

        bookingRepository.delete(booking);
        ride.setSeatsAvailable(ride.getSeatsAvailable() + 1);
        rideRepository.save(ride);

        notificationRepository.save(new Notification(
            ride.getDriver(),
            user.getName() + " left your ride from " + ride.getFromLocation() + " to " + ride.getToLocation(),
            "leave",
            ride.getId()
        ));

        return null;
    }

    @Transactional
    public String cancelRide(User user, Long rideId) {
        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return "Ride not found";
        if (!ride.getDriver().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            return "Not authorized";
        }

        ride.setStatus(Ride.RideStatus.CANCELLED);
        rideRepository.save(ride);

        // Notify participants
        bookingRepository.findByRideId(rideId).forEach(b ->
            notificationRepository.save(new Notification(
                b.getUser(),
                "Ride from " + ride.getFromLocation() + " to " + ride.getToLocation() + " has been cancelled",
                "cancellation",
                ride.getId()
            ))
        );

        return null;
    }

    public List<RideDto> getCreatedRides(Long userId) {
        return rideRepository.findByDriverIdOrderByDateDescTimeDesc(userId)
            .stream().map(r -> {
                RideDto dto = RideDto.fromEntity(r);
                dto.setParticipantCount((int) bookingRepository.countByRideId(r.getId()));
                return dto;
            }).collect(Collectors.toList());
    }

    public List<RideDto> getJoinedRides(Long userId) {
        return bookingRepository.findByUserId(userId)
            .stream()
            .filter(b -> !b.getRide().getDriver().getId().equals(userId))
            .map(b -> {
                RideDto dto = RideDto.fromEntity(b.getRide());
                dto.setParticipantCount((int) bookingRepository.countByRideId(b.getRide().getId()));
                return dto;
            }).collect(Collectors.toList());
    }
}
