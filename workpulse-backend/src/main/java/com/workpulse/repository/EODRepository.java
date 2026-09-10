package com.workpulse.repository;

import com.workpulse.entity.EODReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EODRepository extends JpaRepository<EODReport, Long> {

    List<EODReport> findByEmployeeCodeOrderByDateDesc(
            String employeeCode
    );

    Optional<EODReport> findByEmployeeCodeAndDate(
            String employeeCode,
            LocalDate date
    );

    List<EODReport> findAllByOrderByDateDesc();
}