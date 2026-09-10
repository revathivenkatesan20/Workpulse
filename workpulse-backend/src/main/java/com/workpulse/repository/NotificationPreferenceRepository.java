package com.workpulse.repository;

import com.workpulse.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationPreferenceRepository
        extends JpaRepository<
        NotificationPreference,
        Long
        > {

    Optional<NotificationPreference>
    findByEmployeeCode(String employeeCode);
}