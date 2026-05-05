package com.cabo.dto;

import com.cabo.entity.Report;

public class ReportDto {
    private Long id;
    private Long rideId;
    private String rideRoute;
    private UserDto reportedBy;
    private UserDto rideDriver;
    private String reason;
    private String status;
    private String createdAt;

    public static ReportDto fromEntity(Report report) {
        ReportDto dto = new ReportDto();
        dto.id = report.getId();
        dto.rideId = report.getRide().getId();
        dto.rideRoute = report.getRide().getFromLocation() + " → " + report.getRide().getToLocation();
        dto.reportedBy = UserDto.fromEntity(report.getReportedBy());
        dto.rideDriver = UserDto.fromEntity(report.getRide().getDriver());
        dto.reason = report.getReason().name();
        dto.status = report.getStatus().name();
        dto.createdAt = report.getCreatedAt() != null ? report.getCreatedAt().toString() : null;
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }
    public String getRideRoute() { return rideRoute; }
    public void setRideRoute(String rideRoute) { this.rideRoute = rideRoute; }
    public UserDto getReportedBy() { return reportedBy; }
    public void setReportedBy(UserDto reportedBy) { this.reportedBy = reportedBy; }
    public UserDto getRideDriver() { return rideDriver; }
    public void setRideDriver(UserDto rideDriver) { this.rideDriver = rideDriver; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
