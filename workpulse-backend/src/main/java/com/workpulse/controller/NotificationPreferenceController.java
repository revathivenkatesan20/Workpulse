package com.workpulse.controller;

import com.workpulse.entity.NotificationPreference;
import com.workpulse.repository.EmployeeRepository;
import com.workpulse.repository.NotificationPreferenceRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notification-preferences")
public class NotificationPreferenceController {

    private final NotificationPreferenceRepository preferenceRepository;
    private final EmployeeRepository employeeRepository;

    public NotificationPreferenceController(
            NotificationPreferenceRepository preferenceRepository,
            EmployeeRepository employeeRepository
    ) {
        this.preferenceRepository = preferenceRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // GET PREFERENCES
    // =========================================================

    @GetMapping("/{employeeCode}")
    public ResponseEntity<?> getPreferences(
            @PathVariable String employeeCode,
            Authentication authentication
    ) {

        String code = employeeCode.trim();

        // -----------------------------------------------------
        // Employee can access ONLY their own preferences
        // Admin can access any employee's preferences
        // -----------------------------------------------------

        if (!isAdmin(authentication)
                && !isOwnEmployee(code, authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "You are not authorized to access these preferences."
                    ));
        }

        // -----------------------------------------------------
        // Check employee exists
        // -----------------------------------------------------

        if (!employeeRepository
                .findByEmployeeCode(code)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        // -----------------------------------------------------
        // Get existing preferences
        // OR create default preferences
        // -----------------------------------------------------

        NotificationPreference preference =
                preferenceRepository
                        .findByEmployeeCode(code)
                        .orElseGet(() -> {

                            NotificationPreference defaults =
                                    new NotificationPreference();

                            defaults.setEmployeeCode(code);

                            return preferenceRepository.save(
                                    defaults
                            );
                        });

        return ResponseEntity.ok(preference);
    }

    // =========================================================
    // UPDATE PREFERENCES
    // =========================================================

    @PutMapping("/{employeeCode}")
    public ResponseEntity<?> updatePreferences(
            @PathVariable String employeeCode,
            @RequestBody NotificationPreference details,
            Authentication authentication
    ) {

        String code = employeeCode.trim();

        // -----------------------------------------------------
        // Employee can update ONLY their own preferences
        // Admin can update any employee's preferences
        // -----------------------------------------------------

        if (!isAdmin(authentication)
                && !isOwnEmployee(code, authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "You are not authorized to update these preferences."
                    ));
        }

        // -----------------------------------------------------
        // Check employee exists
        // -----------------------------------------------------

        if (!employeeRepository
                .findByEmployeeCode(code)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        // -----------------------------------------------------
        // Find existing preferences
        // OR create new preferences
        // -----------------------------------------------------

        NotificationPreference preference =
                preferenceRepository
                        .findByEmployeeCode(code)
                        .orElseGet(() -> {

                            NotificationPreference newPreference =
                                    new NotificationPreference();

                            newPreference.setEmployeeCode(code);

                            return newPreference;
                        });

        // -----------------------------------------------------
        // Update allowed fields only
        // -----------------------------------------------------

        preference.setEodReminders(
                details.isEodReminders()
        );

        preference.setEodUpdates(
                details.isEodUpdates()
        );

        preference.setSystemNotifications(
                details.isSystemNotifications()
        );

        return ResponseEntity.ok(
                preferenceRepository.save(preference)
        );
    }

    // =========================================================
    // ADMIN CHECK
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
                        "ROLE_ADMIN".equals(
                                authority.getAuthority()
                        )
                );
    }

    // =========================================================
    // OWN EMPLOYEE CHECK
    // =========================================================

    private boolean isOwnEmployee(
            String employeeCode,
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {

            return false;
        }

        return employeeCode.equalsIgnoreCase(
                authentication.getName()
        );
    }

    // =========================================================
    // MESSAGE
    // =========================================================

    private Map<String, String> createMessage(
            String message
    ) {

        Map<String, String> response =
                new HashMap<>();

        response.put("message", message);

        return response;
    }
}