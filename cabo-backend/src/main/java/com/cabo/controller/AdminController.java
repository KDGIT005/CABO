package com.cabo.controller;

import com.cabo.dto.ReportDto;
import com.cabo.dto.RideDto;
import com.cabo.dto.UserDto;
import com.cabo.entity.Notification;
import com.cabo.entity.Ride;
import com.cabo.repository.*;
import com.cabo.service.AdminService;
import com.cabo.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final ReportService reportService;
    private final AdminService adminService;

    public AdminController(UserRepository userRepository,
                           RideRepository rideRepository,
                           BookingRepository bookingRepository,
                           NotificationRepository notificationRepository,
                           ReportService reportService,
                           AdminService adminService) {
        this.userRepository = userRepository;
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.reportService = reportService;
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
            .map(UserDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("users", users));
    }

    @GetMapping("/rides")
    public ResponseEntity<?> getAllRides() {
        List<RideDto> rides = rideRepository.findAll().stream()
            .map(r -> {
                RideDto dto = RideDto.fromEntity(r);
                dto.setParticipantCount((int) bookingRepository.countByRideId(r.getId()));
                return dto;
            })
            .collect(Collectors.toList());

        Map<String, Object> stats = Map.of(
            "totalUsers", userRepository.count(),
            "totalRides", rideRepository.count(),
            "activeRides", rideRepository.countByStatus(Ride.RideStatus.ACTIVE),
            "cancelledRides", rideRepository.countByStatus(Ride.RideStatus.CANCELLED),
            "pendingReports", reportService.getPendingCount()
        );

        return ResponseEntity.ok(Map.of("rides", rides, "stats", stats));
    }

    @DeleteMapping("/rides/{id}")
    public ResponseEntity<?> cancelRide(@PathVariable Long id) {
        Ride ride = rideRepository.findById(id).orElse(null);
        if (ride == null) return ResponseEntity.status(404).body(Map.of("error", "Ride not found"));

        ride.setStatus(Ride.RideStatus.CANCELLED);
        rideRepository.save(ride);

        bookingRepository.findByRideId(id).forEach(b ->
            notificationRepository.save(new Notification(
                b.getUser(),
                "Ride from " + ride.getFromLocation() + " to " + ride.getToLocation() + " has been cancelled by admin",
                "cancellation",
                ride.getId()
            ))
        );

        return ResponseEntity.ok(Map.of("message", "Ride cancelled by admin"));
    }

    // === Reports ===

    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        List<ReportDto> reports = reportService.getAllReports();
        return ResponseEntity.ok(Map.of("reports", reports));
    }

    @PutMapping("/reports/{id}")
    public ResponseEntity<?> updateReportStatus(@PathVariable Long id,
                                                 @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));

        String error = reportService.updateReportStatus(id, status);
        if (error != null) return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "Report status updated"));
    }

    // === User Management ===

    @PutMapping("/users/{id}/warn")
    public ResponseEntity<?> warnUser(@PathVariable Long id,
                                       @RequestBody(required = false) Map<String, String> body) {
        String message = body != null ? body.get("message") : null;
        String error = adminService.warnUser(id, message);
        if (error != null) return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "User warned successfully"));
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        String error = adminService.blockUser(id);
        if (error != null) return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "User blocked"));
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id) {
        String error = adminService.unblockUser(id);
        if (error != null) return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "User unblocked"));
    }
}
