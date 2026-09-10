package com.workpulse.controller;

import com.workpulse.entity.Employee;
import com.workpulse.entity.Notification;
import com.workpulse.repository.EmployeeRepository;
import com.workpulse.repository.NotificationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            EmployeeRepository employeeRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // GET EMPLOYEE NOTIFICATIONS
    // =========================================================

    @GetMapping("/employee/{employeeCode}")
    public ResponseEntity<?> getNotifications(
            @PathVariable String employeeCode,
            Authentication authentication
    ) {

        String code = employeeCode.trim();

        if (!isAdmin(authentication)
                && !isOwnEmployee(code, authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "You are not allowed to access these notifications."
                    ));
        }

        if (!employeeRepository
                .findByEmployeeCode(code)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        return ResponseEntity.ok(
                notificationRepository
                        .findByEmployeeCodeOrderByCreatedAtDesc(code)
        );
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @GetMapping("/employee/{employeeCode}/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @PathVariable String employeeCode,
            Authentication authentication
    ) {

        String code = employeeCode.trim();

        if (!isAdmin(authentication)
                && !isOwnEmployee(code, authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "You are not allowed to access this notification count."
                    ));
        }

        if (!employeeRepository
                .findByEmployeeCode(code)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        Map<String, Object> response = new HashMap<>();

        response.put(
                "count",
                notificationRepository
                        .countByEmployeeCodeAndReadFalse(code)
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // CREATE NOTIFICATION
    // ADMIN ONLY
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createNotification(
            @RequestBody Notification notification,
            Authentication authentication
    ) {

        if (!isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "Only administrators can create notifications."
                    ));
        }

        if (notification.getEmployeeCode() == null ||
                notification.getEmployeeCode()
                        .trim()
                        .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Employee ID is required."
                    ));
        }

        String employeeCode =
                notification.getEmployeeCode().trim();

        if (!employeeRepository
                .findByEmployeeCode(employeeCode)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        if (notification.getTitle() == null ||
                notification.getTitle()
                        .trim()
                        .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Notification title is required."
                    ));
        }

        notification.setEmployeeCode(employeeCode);

        notification.setTitle(
                notification.getTitle().trim()
        );

        notification.setMessage(
                notification.getMessage() == null
                        ? ""
                        : notification.getMessage()
        );

        notification.setType(
                notification.getType() == null ||
                        notification.getType()
                                .trim()
                                .isEmpty()
                        ? "INFO"
                        : notification.getType()
                                .trim()
        );

        notification.setRead(false);

        notification.setCreatedAt(
                LocalDateTime.now()
        );

        Notification savedNotification =
                notificationRepository.save(notification);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedNotification);
    }

    // =========================================================
    // MARK AS READ
    // ADMIN OR NOTIFICATION OWNER
    // =========================================================

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return notificationRepository.findById(id)
                .map(notification -> {

                    if (!isAdmin(authentication)
                            && !isOwnEmployee(
                                    notification.getEmployeeCode(),
                                    authentication
                            )) {

                        return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(createMessage(
                                        "You are not allowed to modify this notification."
                                ));
                    }

                    notification.setRead(true);

                    return ResponseEntity.ok(
                            notificationRepository.save(
                                    notification
                            )
                    );
                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =========================================================
    // MARK AS UNREAD
    // ADMIN OR NOTIFICATION OWNER
    // =========================================================

    @PatchMapping("/{id}/unread")
    public ResponseEntity<?> markAsUnread(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return notificationRepository.findById(id)
                .map(notification -> {

                    if (!isAdmin(authentication)
                            && !isOwnEmployee(
                                    notification.getEmployeeCode(),
                                    authentication
                            )) {

                        return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(createMessage(
                                        "You are not allowed to modify this notification."
                                ));
                    }

                    notification.setRead(false);

                    return ResponseEntity.ok(
                            notificationRepository.save(
                                    notification
                            )
                    );
                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =========================================================
    // MARK ALL AS READ
    // ADMIN OR EMPLOYEE'S OWN NOTIFICATIONS
    // =========================================================

    @PatchMapping("/employee/{employeeCode}/read-all")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable String employeeCode,
            Authentication authentication
    ) {

        String code = employeeCode.trim();

        if (!isAdmin(authentication)
                && !isOwnEmployee(code, authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "You are not allowed to modify these notifications."
                    ));
        }

        if (!employeeRepository
                .findByEmployeeCode(code)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        List<Notification> notifications =
                notificationRepository
                        .findByEmployeeCodeOrderByCreatedAtDesc(
                                code
                        );

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);

        return ResponseEntity.ok(
                createMessage(
                        "All notifications marked as read."
                )
        );
    }

    // =========================================================
    // DELETE NOTIFICATION
    // ADMIN OR NOTIFICATION OWNER
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return notificationRepository.findById(id)
                .map(notification -> {

                    if (!isAdmin(authentication)
                            && !isOwnEmployee(
                                    notification.getEmployeeCode(),
                                    authentication
                            )) {

                        return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(createMessage(
                                        "You are not allowed to delete this notification."
                                ));
                    }

                    notificationRepository.deleteById(id);

                    return ResponseEntity.ok(
                            createMessage(
                                    "Notification deleted successfully."
                            )
                    );
                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =========================================================
    // DELETE ALL EMPLOYEE NOTIFICATIONS
    // ADMIN OR EMPLOYEE'S OWN NOTIFICATIONS
    // =========================================================

    @DeleteMapping("/employee/{employeeCode}")
    public ResponseEntity<?> deleteAllNotifications(
            @PathVariable String employeeCode,
            Authentication authentication
    ) {

        String code = employeeCode.trim();

        if (!isAdmin(authentication)
                && !isOwnEmployee(code, authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "You are not allowed to delete these notifications."
                    ));
        }

        if (!employeeRepository
                .findByEmployeeCode(code)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        notificationRepository.deleteByEmployeeCode(code);

        return ResponseEntity.ok(
                createMessage(
                        "All notifications deleted successfully."
                )
        );
    }

    // =========================================================
    // SECURITY HELPERS
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
                                .equals(authority.getAuthority())
                );
    }

    private boolean isOwnEmployee(
            String employeeCode,
            Authentication authentication
    ) {

        if (authentication == null ||
                employeeCode == null) {

            return false;
        }

        String authenticatedEmployeeCode =
                authentication.getName();

        return employeeCode.trim()
                .equalsIgnoreCase(
                        authenticatedEmployeeCode
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

        response.put(
                "message",
                message
        );

        return response;
    }
}
