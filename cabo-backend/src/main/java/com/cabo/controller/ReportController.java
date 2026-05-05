package com.cabo.controller;

import com.cabo.dto.ReportRequest;
import com.cabo.entity.User;
import com.cabo.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/api/rides/{rideId}/report")
    public ResponseEntity<?> reportRide(@AuthenticationPrincipal User user,
                                         @PathVariable Long rideId,
                                         @RequestBody ReportRequest request) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (request.getReason() == null || request.getReason().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reason is required"));
        }

        String error = reportService.createReport(user, rideId, request.getReason());
        if (error != null) return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.status(201).body(Map.of("message", "Ride reported successfully"));
    }
}
