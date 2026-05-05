package com.cabo.repository;

import com.cabo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRideId(Long rideId);
    List<Booking> findByUserId(Long userId);
    Optional<Booking> findByRideIdAndUserId(Long rideId, Long userId);
    boolean existsByRideIdAndUserId(Long rideId, Long userId);
    long countByRideId(Long rideId);
}
