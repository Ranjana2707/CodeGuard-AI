package com.codeguard.controller;

import com.codeguard.dto.ActivityLogDto;
import com.codeguard.dto.AnalyticsDto;
import com.codeguard.dto.ApiResponse;
import com.codeguard.dto.DashboardStatsDto;
import com.codeguard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        DashboardStatsDto stats = dashboardService.getStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched", stats));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsDto>> getAnalytics(
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal UserDetails userDetails) {
        AnalyticsDto analytics = dashboardService.getAnalytics(userDetails.getUsername(), days);
        return ResponseEntity.ok(ApiResponse.success("Analytics data fetched", analytics));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getActivityLog(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ActivityLogDto> logs = dashboardService.getActivityLog(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Activity log fetched", logs));
    }
}
