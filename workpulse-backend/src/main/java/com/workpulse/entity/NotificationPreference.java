package com.workpulse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "notification_preferences",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_notification_preference_employee",
            columnNames = "employee_code"
        )
    }
)
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_code", nullable = false, unique = true)
    private String employeeCode;

    @Column(name = "eod_reminders", nullable = false)
    private boolean eodReminders = true;

    @Column(name = "eod_updates", nullable = false)
    private boolean eodUpdates = true;

    @Column(name = "system_notifications", nullable = false)
    private boolean systemNotifications = true;

    public NotificationPreference() {
    }

    public NotificationPreference(String employeeCode) {
        this.employeeCode = employeeCode;
        this.eodReminders = true;
        this.eodUpdates = true;
        this.systemNotifications = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public boolean isEodReminders() {
        return eodReminders;
    }

    public void setEodReminders(boolean eodReminders) {
        this.eodReminders = eodReminders;
    }

    public boolean isEodUpdates() {
        return eodUpdates;
    }

    public void setEodUpdates(boolean eodUpdates) {
        this.eodUpdates = eodUpdates;
    }

    public boolean isSystemNotifications() {
        return systemNotifications;
    }

    public void setSystemNotifications(boolean systemNotifications) {
        this.systemNotifications = systemNotifications;
    }
}