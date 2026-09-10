package com.workpulse.service;

import com.workpulse.entity.Notification;
import com.workpulse.repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    // =========================================================
    // EOD SUBMITTED
    // =========================================================

    public Notification createEODSubmittedNotification(
            String employeeCode,
            String employeeName,
            String date
    ) {

        String name = employeeName != null && !employeeName.trim().isEmpty()
                ? employeeName
                : "Employee";

        Notification notification = new Notification(
                employeeCode,
                "EOD_SUBMITTED",
                "EOD Submitted",
                name + ", your EOD report for " + date
                        + " has been submitted successfully."
        );

        return notificationRepository.save(notification);
    }

    // =========================================================
    // EOD UPDATED
    // =========================================================

    public Notification createEODUpdatedNotification(
            String employeeCode,
            String employeeName,
            String date
    ) {

        String name = employeeName != null && !employeeName.trim().isEmpty()
                ? employeeName
                : "Employee";

        Notification notification = new Notification(
                employeeCode,
                "EOD_UPDATED",
                "EOD Updated",
                name + ", your EOD report for " + date
                        + " has been updated successfully."
        );

        return notificationRepository.save(notification);
    }
}
