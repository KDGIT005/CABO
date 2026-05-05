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

    @Query("SELECT r FROM Ride r WHERE r.status = :status AND r.seatsAvailable > 0 " +
           "AND (:fromLocation IS NULL OR LOWER(r.fromLocation) LIKE LOWER(CONCAT('%', :fromLocation, '%'))) " +
           "AND (:toLocation IS NULL OR LOWER(r.toLocation) LIKE LOWER(CONCAT('%', :toLocation, '%'))) " +
           "AND (:date IS NULL OR r.date = :date) " +
           "ORDER BY r.date ASC, r.time ASC")
    List<Ride> searchRides(@Param("status") RideStatus status,
                           @Param("fromLocation") String fromLocation,
                           @Param("toLocation") String toLocation,
                           @Param("date") LocalDate date);

    long countByStatus(RideStatus status);
}
