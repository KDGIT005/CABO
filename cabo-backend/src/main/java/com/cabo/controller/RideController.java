package com.cabo.controller;

import com.cabo.dto.RideDto;
import com.cabo.dto.RideRequest;
import com.cabo.entity.User;
import com.cabo.service.RideService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @GetMapping
    public ResponseEntity<?> listRides(@RequestParam(required = false) String fromLocation,
                                        @RequestParam(required = false) String toLocation,
                                        @RequestParam(required = false) String date) {
        List<RideDto> rides = rideService.searchRides(fromLocation, toLocation, date);
        return ResponseEntity.ok(Map.of("rides", rides));
    }

    @PostMapping
    public ResponseEntity<?> createRide(@AuthenticationPrincipal User user,
                                         @RequestBody RideRequest request) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (user.isBlocked()) return ResponseEntity.status(403).body(Map.of("error", "Your account is blocked"));

        try {
            var ride = rideService.createRide(user, request);
            return ResponseEntity.status(201).body(Map.of("ride", RideDto.fromEntity(ride)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRide(@PathVariable Long id) {
        RideDto ride = rideService.getRideDetail(id);
        if (ride == null) return ResponseEntity.status(404).body(Map.of("error", "Ride not found"));
        return ResponseEntity.ok(ride);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelRide(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        String error = rideService.cancelRide(user, id);
        if (error != null) return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "Ride cancelled"));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinRide(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        String error = rideService.joinRide(user, id);
        if (error != null) return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "Joined ride successfully"));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveRide(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        String error = rideService.leaveRide(user, id);
        if (error != null) return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "Left ride successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<?> myRides(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return ResponseEntity.ok(Map.of(
            "createdRides", rideService.getCreatedRides(user.getId()),
            "joinedRides", rideService.getJoinedRides(user.getId())
        ));
    }
}
