package com.cabo.repository;

import com.cabo.entity.Ride;
import com.cabo.entity.Ride.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByDriverIdOrderByDateDescTimeDesc(Long driverId);

    List<Ride> findByStatusAndSeatsAvailableGreaterThanOrderByDateAscTimeAsc(RideStatus status, int seatsAvailable);

    long countByStatus(RideStatus status);
}
