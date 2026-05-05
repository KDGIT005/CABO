package com.cabo.repository;

import com.cabo.entity.Report;
import com.cabo.entity.Report.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByCreatedAtDesc();
    List<Report> findByRideId(Long rideId);
    long countByStatus(ReportStatus status);
    boolean existsByRideIdAndReportedById(Long rideId, Long userId);
}
