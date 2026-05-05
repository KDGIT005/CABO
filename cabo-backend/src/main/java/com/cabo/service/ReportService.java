package com.cabo.service;

import com.cabo.dto.ReportDto;
import com.cabo.entity.*;
import com.cabo.entity.Report.ReportReason;
import com.cabo.repository.ReportRepository;
import com.cabo.repository.RideRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final RideRepository rideRepository;

    public ReportService(ReportRepository reportRepository, RideRepository rideRepository) {
        this.reportRepository = reportRepository;
        this.rideRepository = rideRepository;
    }

    public String createReport(User user, Long rideId, String reasonStr) {
        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return "Ride not found";

        if (reportRepository.existsByRideIdAndReportedById(rideId, user.getId())) {
            return "You have already reported this ride";
        }

        ReportReason reason;
        try {
            reason = ReportReason.valueOf(reasonStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return "Invalid report reason. Valid: FAKE_RIDE, DRIVER_NOT_RESPONDING, WRONG_INFORMATION, OTHER";
        }

        reportRepository.save(new Report(ride, user, reason));
        return null; // success
    }

    public List<ReportDto> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(ReportDto::fromEntity)
            .collect(Collectors.toList());
    }

    public String updateReportStatus(Long reportId, String statusStr) {
        Report report = reportRepository.findById(reportId).orElse(null);
        if (report == null) return "Report not found";

        Report.ReportStatus status;
        try {
            status = Report.ReportStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return "Invalid status. Valid: PENDING, REVIEWED, DISMISSED";
        }

        report.setStatus(status);
        reportRepository.save(report);
        return null;
    }

    public long getPendingCount() {
        return reportRepository.countByStatus(Report.ReportStatus.PENDING);
    }
}
