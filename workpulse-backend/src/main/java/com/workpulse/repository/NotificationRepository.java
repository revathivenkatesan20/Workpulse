package com.workpulse.repository;

import com.workpulse.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByEmployeeCodeOrderByCreatedAtDesc(
            String employeeCode
    );

    List<Notification> findByEmployeeCodeAndReadFalseOrderByCreatedAtDesc(
            String employeeCode
    );

    long countByEmployeeCodeAndReadFalse(
            String employeeCode
    );

    @Modifying
    @Transactional
    void deleteByEmployeeCode(
            String employeeCode
    );
}