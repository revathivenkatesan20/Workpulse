package com.workpulse.controller;

import com.workpulse.service.DashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    // =========================================================
    // DASHBOARD SUMMARY
    // =========================================================

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
            Authentication authentication
    ) {

        if (isAdmin(authentication)) {

            return ResponseEntity.ok(
                    dashboardService.getSummary()
            );
        }

        String employeeCode =
                authentication.getName();

        return ResponseEntity.ok(
                dashboardService.getSummary(
                        employeeCode
                )
        );
    }

    // =========================================================
    // WEEKLY WORKING HOURS
    // =========================================================

    @GetMapping("/weekly-hours")
    public ResponseEntity<?> getWeeklyWorkingHours(
            Authentication authentication
    ) {

        if (isAdmin(authentication)) {

            return ResponseEntity.ok(
                    dashboardService.getWeeklyWorkingHours()
            );
        }

        String employeeCode =
                authentication.getName();

        return ResponseEntity.ok(
                dashboardService.getWeeklyWorkingHours(
                        employeeCode
                )
        );
    }

    // =========================================================
    // EMPLOYEE ACTIVITY
    // =========================================================

    @GetMapping("/employee-activity")
    public ResponseEntity<?> getEmployeeActivity(
            Authentication authentication
    ) {

        if (isAdmin(authentication)) {

            return ResponseEntity.ok(
                    dashboardService.getEmployeeActivity()
            );
        }

        String employeeCode =
                authentication.getName();

        return ResponseEntity.ok(
                dashboardService.getEmployeeActivity(
                        employeeCode
                )
        );
    }

    // =========================================================
    // SECURITY HELPER
    // =========================================================

    private boolean isAdmin(
            Authentication authentication
    ) {

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN"
                                .equals(
                                        authority.getAuthority()
                                )
                );
    }
}