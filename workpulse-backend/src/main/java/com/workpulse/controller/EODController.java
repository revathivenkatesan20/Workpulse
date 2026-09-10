package com.workpulse.controller;

import com.workpulse.entity.EODReport;
import com.workpulse.entity.Employee;
import com.workpulse.repository.EODRepository;
import com.workpulse.repository.EmployeeRepository;
import com.workpulse.service.NotificationService;
import com.workpulse.entity.EODTask;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eod")
public class EODController {

    private final EODRepository eodRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public EODController(
            EODRepository eodRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService
    ) {
        this.eodRepository = eodRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // GET ALL EOD REPORTS
    // ADMIN ONLY
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<EODReport> getAllEODReports() {
        return eodRepository.findAllByOrderByDateDesc();
    }

    // =========================================================
    // GET EOD REPORTS BY EMPLOYEE
    // ADMIN OR OWN EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeCode}")
    public ResponseEntity<?> getEmployeeEODReports(
            @PathVariable String employeeCode,
            Authentication authentication
    ) {

        String code = employeeCode.trim();

        if (!isAdmin(authentication)
                && !code.equalsIgnoreCase(authentication.getName())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "You are not allowed to access another employee's EOD reports."
                    ));
        }

        Employee employee =
                employeeRepository
                        .findByEmployeeCode(code)
                        .orElse(null);

        if (employee == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        return ResponseEntity.ok(
                eodRepository
                        .findByEmployeeCodeOrderByDateDesc(code)
        );
    }

    // =========================================================
    // GET SINGLE EOD REPORT
    // ADMIN OR REPORT OWNER
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getEODById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return eodRepository.findById(id)
                .map(report -> {

                    if (!isAdmin(authentication)
                            && !report.getEmployeeCode()
                            .equalsIgnoreCase(authentication.getName())) {

                        return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(
                                        createMessage(
                                                "You are not allowed to access this EOD report."
                                        )
                                );
                    }

                    return ResponseEntity.ok(report);
                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =========================================================
    // CREATE EOD REPORT
    //
    // EMPLOYEE = OWN EOD
    // ADMIN = CAN CREATE FOR ANY EMPLOYEE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createEOD(
            @RequestBody EODReport eodReport,
            Authentication authentication
    ) {

        if (eodReport.getEmployeeCode() == null
                || eodReport.getEmployeeCode()
                .trim()
                .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Employee ID is required."
                    ));
        }

        String requestedEmployeeCode =
                eodReport
                        .getEmployeeCode()
                        .trim();

        String employeeCode;

        if (isAdmin(authentication)) {

            employeeCode = requestedEmployeeCode;

        } else {

            employeeCode = authentication.getName();

            if (!employeeCode.equalsIgnoreCase(
                    requestedEmployeeCode
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(createMessage(
                                "You can submit EOD only for your own account."
                        ));
            }
        }

        Employee employee =
                employeeRepository
                        .findByEmployeeCode(employeeCode)
                        .orElse(null);

        if (employee == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee not found."
                    ));
        }

        if (!employee.isActive()) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "This employee account is inactive."
                    ));
        }

        // =====================================================
        // DATE
        // =====================================================

        if (eodReport.getDate() == null) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Report date is required."
                    ));
        }

        // =====================================================
        // TIME IN
        // =====================================================

        if (eodReport.getTimeIn() == null
                || eodReport.getTimeIn()
                .trim()
                .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Time In is required."
                    ));
        }

        // =====================================================
        // TIME OUT
        // =====================================================

        if (eodReport.getTimeOut() == null
                || eodReport.getTimeOut()
                .trim()
                .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Time Out is required."
                    ));
        }

        // =====================================================
        // TIME FORMAT
        // =====================================================

        try {

            parseTime(eodReport.getTimeIn());
            parseTime(eodReport.getTimeOut());

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Time must be in HH:mm format."
                    ));
        }

        LocalTime timeIn =
                parseTime(eodReport.getTimeIn());

        LocalTime timeOut =
                parseTime(eodReport.getTimeOut());

        if (!timeOut.isAfter(timeIn)) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Time Out must be later than Time In."
                    ));
        }

        // =====================================================
        // DUPLICATE CHECK
        // =====================================================

        boolean alreadyExists =
                eodRepository
                        .findByEmployeeCodeAndDate(
                                employeeCode,
                                eodReport.getDate()
                        )
                        .isPresent();

        if (alreadyExists) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(createMessage(
                            "EOD report already exists for this employee and date."
                    ));
        }

        // =====================================================
        // TRUST DATABASE EMPLOYEE INFORMATION
        // =====================================================

        eodReport.setEmployeeCode(
                employee.getEmployeeCode()
        );

        eodReport.setEmployeeName(
                employee.getName()
        );

        eodReport.setDepartment(
                employee.getDepartment()
        );

        // =====================================================
        // WORKING HOURS
        // LUNCH = 1 PM - 2 PM
        // =====================================================

        eodReport.setTotalWorkingHours(
                calculateWorkingHours(
                        timeIn,
                        timeOut
                )
        );

        // =====================================================
        // SUBMITTED TIME
        // =====================================================

        eodReport.setSubmittedAt(
                LocalDateTime.now()
        );

        // =====================================================
// LINK TASKS TO EOD REPORT
// =====================================================

if (eodReport.getTasks() != null) {
    for (EODTask task : eodReport.getTasks()) {
        task.setEodReport(eodReport);
    }
}

        // =====================================================
        // SAVE
        // =====================================================

        EODReport savedReport =
                eodRepository.save(eodReport);

        // =====================================================
        // NOTIFICATION
        // =====================================================

        try {

            notificationService
                    .createEODSubmittedNotification(
                            employee.getEmployeeCode(),
                            employee.getName(),
                            eodReport.getDate().toString()
                    );

        } catch (Exception notificationError) {
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedReport);
    }

    // =========================================================
    // UPDATE EOD REPORT
    //
    // EMPLOYEE = OWN EOD ONLY
    // ADMIN = OWN ADMIN EOD ONLY
    //
    // ADMIN CANNOT EDIT EMPLOYEE EOD
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEOD(
            @PathVariable Long id,
            @RequestBody EODReport eodDetails,
            Authentication authentication
    ) {

        return eodRepository.findById(id)
                .map(existingReport -> {

                    // =================================================
                    // OWNERSHIP CHECK
                    //
                    // BOTH ADMIN AND EMPLOYEE CAN EDIT
                    // ONLY THEIR OWN EOD
                    // =================================================

                    String loggedInEmployeeCode =
                            authentication.getName();

                    if (!existingReport
                            .getEmployeeCode()
                            .equalsIgnoreCase(
                                    loggedInEmployeeCode
                            )) {

                        return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(
                                        createMessage(
                                                "You are not allowed to update another employee's EOD."
                                        )
                                );
                    }

                    // =================================================
                    // FIND LOGGED-IN EMPLOYEE
                    // =================================================

                    Employee employee =
                            employeeRepository
                                    .findByEmployeeCode(
                                            loggedInEmployeeCode
                                    )
                                    .orElse(null);

                    if (employee == null) {

                        return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(
                                        createMessage(
                                                "Employee not found."
                                        )
                                );
                    }

                    // =================================================
                    // ACTIVE CHECK
                    // =================================================

                    if (!employee.isActive()) {

                        return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(
                                        createMessage(
                                                "This employee account is inactive."
                                        )
                                );
                    }

                    // =================================================
                    // DATE
                    // =================================================

                    if (eodDetails.getDate() == null) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        createMessage(
                                                "Report date is required."
                                        )
                                );
                    }

                    // =================================================
                    // TIME IN
                    // =================================================

                    if (eodDetails.getTimeIn() == null
                            || eodDetails
                            .getTimeIn()
                            .trim()
                            .isEmpty()) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        createMessage(
                                                "Time In is required."
                                        )
                                );
                    }

                    // =================================================
                    // TIME OUT
                    // =================================================

                    if (eodDetails.getTimeOut() == null
                            || eodDetails
                            .getTimeOut()
                            .trim()
                            .isEmpty()) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        createMessage(
                                                "Time Out is required."
                                        )
                                );
                    }

                    // =================================================
                    // PARSE TIME
                    // =================================================

                    LocalTime timeIn;
                    LocalTime timeOut;

                    try {

                        timeIn =
                                parseTime(
                                        eodDetails.getTimeIn()
                                );

                        timeOut =
                                parseTime(
                                        eodDetails.getTimeOut()
                                );

                    } catch (IllegalArgumentException exception) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        createMessage(
                                                "Time must be in HH:mm format."
                                        )
                                );
                    }

                    // =================================================
                    // TIME VALIDATION
                    // =================================================

                    if (!timeOut.isAfter(timeIn)) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        createMessage(
                                                "Time Out must be later than Time In."
                                        )
                                );
                    }

                    // =================================================
                    // DUPLICATE DATE CHECK
                    //
                    // Same report ID is allowed.
                    // =================================================

                    var duplicateReport =
                            eodRepository
                                    .findByEmployeeCodeAndDate(
                                            employee.getEmployeeCode(),
                                            eodDetails.getDate()
                                    );

                    if (duplicateReport.isPresent()
                            && !duplicateReport
                            .get()
                            .getId()
                            .equals(id)) {

                        return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(
                                        createMessage(
                                                "EOD report already exists for this employee and date."
                                        )
                                );
                    }

                    // =================================================
                    // DATABASE EMPLOYEE INFORMATION
                    // =================================================

                    existingReport.setEmployeeCode(
                            employee.getEmployeeCode()
                    );

                    existingReport.setEmployeeName(
                            employee.getName()
                    );

                    existingReport.setDepartment(
                            employee.getDepartment()
                    );

                    // =================================================
                    // DATE
                    // =================================================

                    existingReport.setDate(
                            eodDetails.getDate()
                    );

                    // =================================================
                    // TIME
                    // =================================================

                    existingReport.setTimeIn(
                            eodDetails.getTimeIn()
                    );

                    existingReport.setTimeOut(
                            eodDetails.getTimeOut()
                    );

                    // =================================================
                    // WORKING HOURS
                    // =================================================

                    existingReport.setTotalWorkingHours(
                            calculateWorkingHours(
                                    timeIn,
                                    timeOut
                            )
                    );

                    // =================================================
                    // TASKS
                    // =================================================

                    if (eodDetails.getTasks() != null) {

                        existingReport.setTasks(
                                eodDetails.getTasks()
                        );
                    }

                    // =================================================
                    // UPDATED TIME
                    // =================================================

                    existingReport.setUpdatedAt(
                            LocalDateTime.now()
                    );

                    // =================================================
                    // SAVE
                    // =================================================

                    EODReport updatedReport =
                            eodRepository.save(
                                    existingReport
                            );

                    // =================================================
                    // NOTIFICATION
                    // =================================================

                    try {

                        notificationService
                                .createEODUpdatedNotification(
                                        employee.getEmployeeCode(),
                                        employee.getName(),
                                        existingReport
                                                .getDate()
                                                .toString()
                                );

                    } catch (Exception notificationError) {
                    }

                    return ResponseEntity.ok(
                            updatedReport
                    );
                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =========================================================
    // WORKING HOURS
    // =========================================================

    private String calculateWorkingHours(
            LocalTime timeIn,
            LocalTime timeOut
    ) {

        LocalDateTime start =
                LocalDateTime.of(
                        LocalDate.now(),
                        timeIn
                );

        LocalDateTime end =
                LocalDateTime.of(
                        LocalDate.now(),
                        timeOut
                );

        long totalMinutes =
                Duration
                        .between(start, end)
                        .toMinutes();

        LocalTime lunchStart =
                LocalTime.of(13, 0);

        LocalTime lunchEnd =
                LocalTime.of(14, 0);

        LocalTime overlapStart =
                timeIn.isAfter(lunchStart)
                        ? timeIn
                        : lunchStart;

        LocalTime overlapEnd =
                timeOut.isBefore(lunchEnd)
                        ? timeOut
                        : lunchEnd;

        if (overlapStart.isBefore(overlapEnd)) {

            long lunchMinutes =
                    Duration
                            .between(
                                    overlapStart,
                                    overlapEnd
                            )
                            .toMinutes();

            totalMinutes -= lunchMinutes;
        }

        if (totalMinutes < 0) {
            totalMinutes = 0;
        }

        long hours =
                totalMinutes / 60;

        long minutes =
                totalMinutes % 60;

        return hours + "h " + minutes + "m";
    }

    // =========================================================
    // TIME PARSER
    // =========================================================

    private LocalTime parseTime(String time) {

        return LocalTime.parse(
                time.trim(),
                DateTimeFormatter.ofPattern("HH:mm")
        );
    }

    // =========================================================
    // ROLE HELPER
    // =========================================================

    private boolean isAdmin(
            Authentication authentication
    ) {

        if (authentication == null) {
            return false;
        }

        return authentication
                .getAuthorities()
                .stream()
                .anyMatch(
                        authority ->
                                authority
                                        .getAuthority()
                                        .equals("ROLE_ADMIN")
                );
    }

    // =========================================================
    // MESSAGE HELPER
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