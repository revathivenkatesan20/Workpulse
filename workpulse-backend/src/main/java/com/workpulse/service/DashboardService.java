package com.workpulse.service;

import com.workpulse.entity.EODReport;
import com.workpulse.entity.EODTask;
import com.workpulse.entity.Employee;
import com.workpulse.repository.EODRepository;
import com.workpulse.repository.EmployeeRepository;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final EODRepository eodRepository;

    public DashboardService(
            EmployeeRepository employeeRepository,
            EODRepository eodRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.eodRepository = eodRepository;
    }

    // =========================================================
    // ADMIN DASHBOARD SUMMARY
    // =========================================================

    public Map<String, Object> getSummary() {

        List<EODReport> reports =
                eodRepository.findAll();

        LocalDate today =
                LocalDate.now();

        long activeEmployees =
                employeeRepository.findAll()
                        .stream()
                        .filter(Employee::isActive)
                        .count();

        List<EODReport> todayReports =
                reports.stream()
                        .filter(report ->
                                report.getDate() != null &&
                                today.equals(report.getDate())
                        )
                        .toList();

        long eodSubmitted =
                todayReports.size();

        int tasksCompleted = 0;
        int tasksInProgress = 0;
        int tasksPending = 0;
        int tasksBlocked = 0;

        for (EODReport report : todayReports) {

            if (report.getTasks() == null) {
                continue;
            }

            for (EODTask task : report.getTasks()) {

                if (task == null ||
                        task.getStatus() == null) {
                    continue;
                }

                String status =
                        task.getStatus()
                                .trim()
                                .toLowerCase(Locale.ENGLISH);

                switch (status) {

                    case "completed":
                        tasksCompleted++;
                        break;

                    case "in progress":
                        tasksInProgress++;
                        break;

                    case "pending":
                        tasksPending++;
                        break;

                    case "blocked":
                        tasksBlocked++;
                        break;

                    default:
                        break;
                }
            }
        }

        double weeklyMinutes =
                calculateWeeklyMinutes(reports);

        String weeklyWorkingHours =
                formatHours(
                        weeklyMinutes / 60
                );

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "activeEmployees",
                activeEmployees
        );

        response.put(
                "eodSubmitted",
                eodSubmitted
        );

        response.put(
                "tasksCompleted",
                tasksCompleted
        );

        response.put(
                "tasksInProgress",
                tasksInProgress
        );

        response.put(
                "tasksPending",
                tasksPending
        );

        response.put(
                "tasksBlocked",
                tasksBlocked
        );

        response.put(
                "workingHours",
                weeklyWorkingHours
        );

        return response;
    }

    // =========================================================
    // EMPLOYEE DASHBOARD SUMMARY
    // =========================================================

    public Map<String, Object> getSummary(
            String employeeCode
    ) {

        String code =
                employeeCode == null
                        ? ""
                        : employeeCode.trim();

        LocalDate today =
                LocalDate.now();

        List<EODReport> reports =
                eodRepository
                        .findByEmployeeCodeOrderByDateDesc(
                                code
                        );

        long activeEmployees =
                employeeRepository
                        .findByEmployeeCode(code)
                        .filter(Employee::isActive)
                        .isPresent()
                        ? 1
                        : 0;

        List<EODReport> todayReports =
                reports.stream()
                        .filter(report ->
                                report.getDate() != null &&
                                today.equals(
                                        report.getDate()
                                )
                        )
                        .toList();

        long eodSubmitted =
                todayReports.size();

        int tasksCompleted = 0;
        int tasksInProgress = 0;
        int tasksPending = 0;
        int tasksBlocked = 0;

        for (EODReport report : todayReports) {

            if (report.getTasks() == null) {
                continue;
            }

            for (EODTask task : report.getTasks()) {

                if (task == null ||
                        task.getStatus() == null) {
                    continue;
                }

                String status =
                        task.getStatus()
                                .trim()
                                .toLowerCase(Locale.ENGLISH);

                switch (status) {

                    case "completed":
                        tasksCompleted++;
                        break;

                    case "in progress":
                        tasksInProgress++;
                        break;

                    case "pending":
                        tasksPending++;
                        break;

                    case "blocked":
                        tasksBlocked++;
                        break;

                    default:
                        break;
                }
            }
        }

        double weeklyMinutes =
                calculateWeeklyMinutes(reports);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "activeEmployees",
                activeEmployees
        );

        response.put(
                "eodSubmitted",
                eodSubmitted
        );

        response.put(
                "tasksCompleted",
                tasksCompleted
        );

        response.put(
                "tasksInProgress",
                tasksInProgress
        );

        response.put(
                "tasksPending",
                tasksPending
        );

        response.put(
                "tasksBlocked",
                tasksBlocked
        );

        response.put(
                "workingHours",
                formatHours(
                        weeklyMinutes / 60
                )
        );

        return response;
    }

    // =========================================================
    // ADMIN WEEKLY WORKING HOURS
    // =========================================================

    public List<Map<String, Object>>
    getWeeklyWorkingHours() {

        LocalDate today =
                LocalDate.now();

        LocalDate startOfWeek =
                today.with(DayOfWeek.MONDAY);

        LocalDate endOfWeek =
                today.with(DayOfWeek.SUNDAY);

        List<EODReport> reports =
                eodRepository.findAll();

        return buildWeeklyHours(
                reports,
                startOfWeek,
                endOfWeek
        );
    }

    // =========================================================
    // EMPLOYEE WEEKLY WORKING HOURS
    // =========================================================

    public List<Map<String, Object>>
    getWeeklyWorkingHours(
            String employeeCode
    ) {

        LocalDate today =
                LocalDate.now();

        LocalDate startOfWeek =
                today.with(DayOfWeek.MONDAY);

        LocalDate endOfWeek =
                today.with(DayOfWeek.SUNDAY);

        List<EODReport> reports =
                eodRepository
                        .findByEmployeeCodeOrderByDateDesc(
                                employeeCode.trim()
                        );

        return buildWeeklyHours(
                reports,
                startOfWeek,
                endOfWeek
        );
    }

    // =========================================================
    // BUILD WEEKLY HOURS
    // =========================================================

    private List<Map<String, Object>>
    buildWeeklyHours(
            List<EODReport> reports,
            LocalDate startOfWeek,
            LocalDate endOfWeek
    ) {

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (
                LocalDate currentDate = startOfWeek;
                !currentDate.isAfter(endOfWeek);
                currentDate = currentDate.plusDays(1)
        ) {

            final LocalDate selectedDate =
                    currentDate;

            double totalMinutes =
                    reports.stream()
                            .filter(report ->
                                    report.getDate() != null &&
                                    selectedDate.equals(
                                            report.getDate()
                                    )
                            )
                            .mapToDouble(
                                    this::getWorkingMinutes
                            )
                            .sum();

            Map<String, Object> day =
                    new LinkedHashMap<>();

            day.put(
                    "date",
                    selectedDate.toString()
            );

            day.put(
                    "day",
                    selectedDate
                            .getDayOfWeek()
                            .getDisplayName(
                                    TextStyle.SHORT,
                                    Locale.ENGLISH
                            )
            );

            day.put(
                    "workingMinutes",
                    Math.round(totalMinutes)
            );

            day.put(
                    "workingHours",
                    formatHours(
                            totalMinutes / 60
                    )
            );

            result.add(day);
        }

        return result;
    }

    // =========================================================
    // ADMIN EMPLOYEE ACTIVITY
    // =========================================================

    public List<Map<String, Object>>
    getEmployeeActivity() {

        LocalDate today =
                LocalDate.now();

        List<Employee> employees =
                employeeRepository.findAll();

        List<EODReport> reports =
                eodRepository.findAll();

        return buildEmployeeActivity(
                employees,
                reports,
                today
        );
    }

    // =========================================================
    // EMPLOYEE ACTIVITY
    // =========================================================

    public List<Map<String, Object>>
    getEmployeeActivity(
            String employeeCode
    ) {

        LocalDate today =
                LocalDate.now();

        String code =
                employeeCode.trim();

        List<Employee> employees =
                employeeRepository
                        .findByEmployeeCode(code)
                        .map(List::of)
                        .orElseGet(List::of);

        List<EODReport> reports =
                eodRepository
                        .findByEmployeeCodeOrderByDateDesc(
                                code
                        );

        return buildEmployeeActivity(
                employees,
                reports,
                today
        );
    }

    // =========================================================
    // BUILD EMPLOYEE ACTIVITY
    // =========================================================

    private List<Map<String, Object>>
    buildEmployeeActivity(
            List<Employee> employees,
            List<EODReport> reports,
            LocalDate today
    ) {

        Map<String, EODReport> todayReportsByEmployee =
                reports.stream()
                        .filter(report ->
                                report.getDate() != null &&
                                today.equals(
                                        report.getDate()
                                ) &&
                                report.getEmployeeCode() != null
                        )
                        .collect(
                                Collectors.toMap(
                                        EODReport::getEmployeeCode,
                                        report -> report,
                                        (first, second) -> second
                                )
                        );

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Employee employee : employees) {

            if (!employee.isActive()) {
                continue;
            }

            EODReport report =
                    todayReportsByEmployee.get(
                            employee.getEmployeeCode()
                    );

            Map<String, Object> activity =
                    new LinkedHashMap<>();

            activity.put(
                    "employeeCode",
                    employee.getEmployeeCode()
            );

            activity.put(
                    "name",
                    employee.getName()
            );

            activity.put(
                    "department",
                    employee.getDepartment()
            );

            activity.put(
                    "role",
                    employee.getRole()
            );

            // =================================================
            // NO EOD
            // =================================================

            if (report == null) {

                activity.put(
                        "status",
                        "Not Submitted"
                );

                activity.put(
                        "timeIn",
                        null
                );

                activity.put(
                        "timeOut",
                        null
                );

                activity.put(
                        "workingHours",
                        "0h 0m"
                );

                activity.put(
                        "tasksCompleted",
                        0
                );

                activity.put(
                        "tasksTotal",
                        0
                );
            }

            // =================================================
            // EOD SUBMITTED
            // =================================================

            else {

                activity.put(
                        "status",
                        "Submitted"
                );

                activity.put(
                        "timeIn",
                        report.getTimeIn()
                );

                activity.put(
                        "timeOut",
                        report.getTimeOut()
                );

                activity.put(
                        "workingHours",
                        formatHours(
                                getWorkingMinutes(report)
                                        / 60
                        )
                );

                int completed = 0;
                int total = 0;

                if (report.getTasks() != null) {

                    total =
                            report.getTasks().size();

                    completed =
                            (int) report.getTasks()
                                    .stream()
                                    .filter(task ->
                                            task != null &&
                                            task.getStatus() != null &&
                                            task.getStatus()
                                                    .trim()
                                                    .equalsIgnoreCase(
                                                            "Completed"
                                                    )
                                    )
                                    .count();
                }

                activity.put(
                        "tasksCompleted",
                        completed
                );

                activity.put(
                        "tasksTotal",
                        total
                );
            }

            result.add(activity);
        }

        return result;
    }

    // =========================================================
    // CALCULATE WEEKLY MINUTES
    // =========================================================

    private double calculateWeeklyMinutes(
            List<EODReport> reports
    ) {

        LocalDate today =
                LocalDate.now();

        LocalDate startOfWeek =
                today.with(
                        DayOfWeek.MONDAY
                );

        LocalDate endOfWeek =
                today.with(
                        DayOfWeek.SUNDAY
                );

        return reports.stream()
                .filter(report ->
                        report.getDate() != null &&
                        !report.getDate()
                                .isBefore(startOfWeek) &&
                        !report.getDate()
                                .isAfter(endOfWeek)
                )
                .mapToDouble(
                        this::getWorkingMinutes
                )
                .sum();
    }

    // =========================================================
    // WORKING MINUTES
    // EXCLUDES 1 PM - 2 PM
    // =========================================================

    private double getWorkingMinutes(
            EODReport report
    ) {

        if (report == null) {
            return 0;
        }

        if (report.getTimeIn() == null ||
                report.getTimeOut() == null ||
                report.getTimeIn().isBlank() ||
                report.getTimeOut().isBlank()) {

            return 0;
        }

        try {

            LocalTime timeIn =
                    LocalTime.parse(
                            report.getTimeIn()
                    );

            LocalTime timeOut =
                    LocalTime.parse(
                            report.getTimeOut()
                    );

            if (!timeOut.isAfter(timeIn)) {
                return 0;
            }

            long minutes =
                    Duration.between(
                            timeIn,
                            timeOut
                    ).toMinutes();

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

            if (overlapEnd.isAfter(overlapStart)) {

                long lunchMinutes =
                        Duration.between(
                                overlapStart,
                                overlapEnd
                        ).toMinutes();

                minutes -= lunchMinutes;
            }

            return Math.max(
                    minutes,
                    0
            );

        } catch (Exception e) {
             return 0;
        }
    }

    // =========================================================
    // FORMAT HOURS
    // =========================================================

    private String formatHours(
            double hours
    ) {

        int totalMinutes =
                (int) Math.round(
                        hours * 60
                );

        int h =
                totalMinutes / 60;

        int m =
                totalMinutes % 60;

        return h + "h " + m + "m";
    }
}
