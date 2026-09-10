package com.workpulse.controller;

import com.workpulse.entity.Employee;
import com.workpulse.repository.EmployeeRepository;
import com.workpulse.security.JwtTokenService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    /*
     * =========================================================
     * FORGOT PASSWORD RESET TOKENS
     * =========================================================
     */

    private final Map<String, ResetTokenData> resetTokens =
            new ConcurrentHashMap<>();

    private static final long RESET_TOKEN_EXPIRY_SECONDS = 15 * 60;

    public EmployeeController(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService
    ) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    // =========================================================
    // GET ALL EMPLOYEES
    // ADMIN ONLY
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Map<String, Object>> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(this::sanitizeEmployee)
                .toList();
    }

    // =========================================================
    // GET EMPLOYEE BY ID
    // ADMIN OR OWN ACCOUNT
    // =========================================================

@PreAuthorize("hasRole('ADMIN') or @employeeController.isOwnEmployee(#id, authentication)")
@GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(
            @PathVariable Long id
    ) {

        return employeeRepository.findById(id)
                .map(employee ->
                        ResponseEntity.ok(
                                sanitizeEmployee(employee)
                        )
                )
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // REGISTER
    // PUBLIC
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> registerEmployee(
            @RequestBody Employee registrationDetails
    ) {

        if (registrationDetails.getEmployeeCode() == null ||
                registrationDetails.getEmployeeCode()
                        .trim()
                        .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Employee ID is required."
                    ));
        }

        if (registrationDetails.getName() == null ||
                registrationDetails.getName()
                        .trim()
                        .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Name is required."
                    ));
        }

        if (registrationDetails.getEmail() == null ||
                registrationDetails.getEmail()
                        .trim()
                        .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Email is required."
                    ));
        }

        if (registrationDetails.getPassword() == null ||
                registrationDetails.getPassword()
                        .trim()
                        .isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Password is required."
                    ));
        }

        String employeeCode =
                registrationDetails
                        .getEmployeeCode()
                        .trim();

        String email =
                registrationDetails
                        .getEmail()
                        .trim()
                        .toLowerCase();

        String rawPassword =
                registrationDetails.getPassword();

        if (employeeRepository
                .findByEmployeeCode(employeeCode)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(createMessage(
                            "This Employee ID is already registered."
                    ));
        }

        if (employeeRepository
                .findByEmail(email)
                .isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(createMessage(
                            "This email is already registered."
                    ));
        }

        Employee employee = new Employee();

        employee.setEmployeeCode(employeeCode);

        employee.setName(
                registrationDetails
                        .getName()
                        .trim()
        );

        employee.setEmail(email);

        employee.setDepartment(
                registrationDetails.getDepartment()
        );

        employee.setRole(
                registrationDetails.getRole()
        );

        employee.setPhone(
                registrationDetails.getPhone()
        );

        // IMPORTANT:
        // Public registration can ONLY create EMPLOYEE accounts.
        employee.setAccountRole("EMPLOYEE");

        employee.setActive(true);

        employee.setPassword(
                passwordEncoder.encode(rawPassword)
        );

        Employee savedEmployee =
                employeeRepository.save(employee);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        sanitizeEmployee(savedEmployee)
                );
    }

    // =========================================================
    // LOGIN
    // PUBLIC
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> loginRequest
    ) {

        String email =
                loginRequest.get("email");

        String password =
                loginRequest.get("password");

        if (email == null ||
                email.trim().isEmpty() ||
                password == null ||
                password.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Email and password are required."
                    ));
        }

        email = email.trim().toLowerCase();

        Employee employee =
                employeeRepository
                        .findByEmail(email)
                        .orElse(null);

        if (employee == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createMessage(
                            "Invalid email or password."
                    ));
        }

        String storedPassword =
                employee.getPassword();

        boolean passwordMatches = false;

        if (storedPassword != null &&
                !storedPassword.isEmpty()) {

            if (isBCryptPassword(storedPassword)) {

                passwordMatches =
                        passwordEncoder.matches(
                                password,
                                storedPassword
                        );

            } else {

                // Old plain-text password migration

                passwordMatches =
                        storedPassword.equals(password);

                if (passwordMatches) {

                    employee.setPassword(
                            passwordEncoder.encode(password)
                    );

                    employeeRepository.save(employee);
                }
            }
        }

        if (!passwordMatches) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createMessage(
                            "Invalid email or password."
                    ));
        }

        if (!employee.isActive()) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "Your account is inactive. Please contact the administrator."
                    ));
        }

        String token =
                jwtTokenService.generateToken(employee);

        Map<String, Object> loginResponse =
                new HashMap<>();

        loginResponse.put(
                "employee",
                sanitizeEmployee(employee)
        );

        loginResponse.put(
                "token",
                token
        );

        return ResponseEntity.ok(loginResponse);
    }

    // =========================================================
    // FORGOT PASSWORD - REQUEST RESET
    // PUBLIC
    // =========================================================

    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> requestPasswordReset(
            @RequestBody Map<String, String> request
    ) {

        String email =
                request.get("email");

        if (email == null ||
                email.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Email address is required."
                    ));
        }

        email = email.trim().toLowerCase();

        Employee employee =
                employeeRepository
                        .findByEmail(email)
                        .orElse(null);

        if (employee == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "No account was found with this email address."
                    ));
        }

        if (!employee.isActive()) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "This employee account is inactive. Please contact the administrator."
                    ));
        }

        resetTokens.entrySet().removeIf(
                entry ->
                        entry.getValue()
                                .employeeId()
                                .equals(employee.getId())
        );

        String resetToken =
                UUID.randomUUID().toString();

        Instant expiresAt =
                Instant.now()
                        .plusSeconds(
                                RESET_TOKEN_EXPIRY_SECONDS
                        );

        resetTokens.put(
                resetToken,
                new ResetTokenData(
                        employee.getId(),
                        expiresAt
                )
        );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "Password reset request created successfully."
        );

        response.put(
                "resetToken",
                resetToken
        );

        response.put(
                "expiresIn",
                RESET_TOKEN_EXPIRY_SECONDS
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // FORGOT PASSWORD - RESET PASSWORD
    // PUBLIC
    // =========================================================

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request
    ) {

        String resetToken =
                request.get("resetToken");

        String newPassword =
                request.get("newPassword");

        if (resetToken == null ||
                resetToken.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Password reset token is required."
                    ));
        }

        if (newPassword == null ||
                newPassword.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "New password is required."
                    ));
        }

        ResetTokenData tokenData =
                resetTokens.get(resetToken);

        if (tokenData == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createMessage(
                            "Invalid or expired password reset token."
                    ));
        }

        if (Instant.now()
                .isAfter(tokenData.expiresAt())) {

            resetTokens.remove(resetToken);

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createMessage(
                            "Password reset token has expired. Please request a new one."
                    ));
        }

        String passwordValidationError =
                validatePasswordStrength(newPassword);

        if (passwordValidationError != null) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            passwordValidationError
                    ));
        }

        Employee employee =
                employeeRepository
                        .findById(
                                tokenData.employeeId()
                        )
                        .orElse(null);

        if (employee == null) {

            resetTokens.remove(resetToken);

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createMessage(
                            "Employee account could not be found."
                    ));
        }

        if (!employee.isActive()) {

            resetTokens.remove(resetToken);

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createMessage(
                            "This employee account is inactive."
                    ));
        }

        employee.setPassword(
                passwordEncoder.encode(newPassword)
        );

        employeeRepository.save(employee);

        // One-time token
        resetTokens.remove(resetToken);

        return ResponseEntity.ok(
                createMessage(
                        "Password reset successfully."
                )
        );
    }

    // =========================================================
// UPDATE EMPLOYEE
// ADMIN OR OWN PROFILE
// =========================================================

@PreAuthorize("hasRole('ADMIN') or @employeeController.isOwnEmployee(#id, authentication)")
@PutMapping("/{id}")
public ResponseEntity<?> updateEmployee(
        @PathVariable Long id,
        @RequestBody Employee employeeDetails,
        Authentication authentication
) {

    return employeeRepository.findById(id)
            .map(employee -> {

                boolean isAdmin =
                        authentication.getAuthorities()
                                .stream()
                                .anyMatch(authority ->
                                        authority.getAuthority()
                                                .equals("ROLE_ADMIN")
                                );

                boolean isOwnProfile =
                        employee.getEmployeeCode()
                                .equals(authentication.getName());

                // Extra safety check
                if (!isAdmin && !isOwnProfile) {
                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(
                                    createMessage(
                                            "You are not allowed to update this employee."
                                    )
                            );
                }

                // =====================================================
                // BASIC PROFILE FIELDS
                // Employee + Admin can update
                // =====================================================

                // Name
                if (employeeDetails.getName() != null &&
                        !employeeDetails.getName().trim().isEmpty()) {

                    employee.setName(
                            employeeDetails.getName().trim()
                    );
                }

                // Email
                if (employeeDetails.getEmail() != null &&
                        !employeeDetails.getEmail().trim().isEmpty()) {

                    String newEmail =
                            employeeDetails.getEmail()
                                    .trim()
                                    .toLowerCase();

                    var existingEmployee =
                            employeeRepository
                                    .findByEmail(newEmail);

                    if (existingEmployee.isPresent() &&
                            !existingEmployee
                                    .get()
                                    .getId()
                                    .equals(id)) {

                        return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(
                                        createMessage(
                                                "Email already belongs to another employee."
                                        )
                                );
                    }

                    employee.setEmail(newEmail);
                }

                // Department
                if (employeeDetails.getDepartment() != null) {

                    employee.setDepartment(
                            employeeDetails.getDepartment()
                    );
                }

                // Phone
                if (employeeDetails.getPhone() != null) {

                    employee.setPhone(
                            employeeDetails.getPhone()
                    );
                }

                // =====================================================
                // ADMIN-ONLY FIELDS
                // Normal employee CANNOT modify these
                // =====================================================

                if (isAdmin) {

                    // Employee Code
                    if (employeeDetails.getEmployeeCode() != null &&
                            !employeeDetails
                                    .getEmployeeCode()
                                    .trim()
                                    .isEmpty() &&
                            !employeeDetails
                                    .getEmployeeCode()
                                    .trim()
                                    .equals(
                                            employee.getEmployeeCode()
                                    )) {

                        String newCode =
                                employeeDetails
                                        .getEmployeeCode()
                                        .trim();

                        var existingEmployee =
                                employeeRepository
                                        .findByEmployeeCode(newCode);

                        if (existingEmployee.isPresent() &&
                                !existingEmployee
                                        .get()
                                        .getId()
                                        .equals(id)) {

                            return ResponseEntity
                                    .status(HttpStatus.CONFLICT)
                                    .body(
                                            createMessage(
                                                    "Employee ID already belongs to another employee."
                                            )
                                    );
                        }

                        employee.setEmployeeCode(newCode);
                    }

                    // Role
                    if (employeeDetails.getRole() != null &&
                            !employeeDetails
                                    .getRole()
                                    .trim()
                                    .isEmpty()) {

                        employee.setRole(
                                employeeDetails
                                        .getRole()
                                        .trim()
                        );
                    }

                    // Account Role
                    if (employeeDetails.getAccountRole() != null &&
                            !employeeDetails
                                    .getAccountRole()
                                    .trim()
                                    .isEmpty()) {

                        String accountRole =
                                employeeDetails
                                        .getAccountRole()
                                        .trim()
                                        .toUpperCase();

                        if (accountRole.equals("ADMIN") ||
                                accountRole.equals("EMPLOYEE")) {

                            employee.setAccountRole(
                                    accountRole
                            );
                        }
                    }

                    // Active status
                    // Only update if explicitly provided by admin.
                    //
                    // Since boolean defaults to false when omitted,
                    // we intentionally do NOT modify active here.
                }

                // =====================================================
                // PASSWORD
                // NEVER CHANGE PASSWORD THROUGH THIS ENDPOINT
                //
                // Password changes must use:
                // PUT /{id}/change-password
                // =====================================================

                Employee updatedEmployee =
                        employeeRepository.save(employee);

                return ResponseEntity.ok(
                        sanitizeEmployee(updatedEmployee)
                );
            })
            .orElse(
                    ResponseEntity.notFound().build()
            );
}

    // =========================================================
    // CHANGE PASSWORD
    // OWN ACCOUNT ONLY
    // =========================================================

@PreAuthorize("@employeeController.isOwnEmployee(#id, authentication)")
@PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {

        String currentPassword =
                request.get("currentPassword");

        String newPassword =
                request.get("newPassword");

        if (currentPassword == null ||
                currentPassword.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "Current password is required."
                    ));
        }

        if (newPassword == null ||
                newPassword.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            "New password is required."
                    ));
        }

        Employee employee =
                employeeRepository
                        .findById(id)
                        .orElse(null);

        if (employee == null) {

            return ResponseEntity.notFound().build();
        }

        String storedPassword =
                employee.getPassword();

        boolean currentPasswordMatches;

        if (isBCryptPassword(storedPassword)) {

            currentPasswordMatches =
                    passwordEncoder.matches(
                            currentPassword,
                            storedPassword
                    );

        } else {

            currentPasswordMatches =
                    storedPassword != null &&
                            storedPassword.equals(
                                    currentPassword
                            );
        }

        if (!currentPasswordMatches) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createMessage(
                            "Current password is incorrect."
                    ));
        }

        String passwordValidationError =
                validatePasswordStrength(newPassword);

        if (passwordValidationError != null) {

            return ResponseEntity
                    .badRequest()
                    .body(createMessage(
                            passwordValidationError
                    ));
        }

        employee.setPassword(
                passwordEncoder.encode(newPassword)
        );

        employeeRepository.save(employee);

        return ResponseEntity.ok(
                createMessage(
                        "Password changed successfully."
                )
        );
    }

    // =========================================================
    // ACTIVATE / DEACTIVATE
    // ADMIN ONLY
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateEmployeeStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {

        return employeeRepository.findById(id)
                .map(employee -> {

                    employee.setActive(active);

                    Employee updatedEmployee =
                            employeeRepository.save(employee);

                    return ResponseEntity.ok(
                            sanitizeEmployee(updatedEmployee)
                    );
                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // CHECK WHETHER EMPLOYEE OWNS RESOURCE
    // =========================================================

    public boolean isOwnEmployee(
            Long id,
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return false;
        }

        String loggedInEmployeeCode =
                authentication.getName();

        return employeeRepository
                .findById(id)
                .map(employee ->
                        employee.getEmployeeCode()
                                .equals(loggedInEmployeeCode)
                )
                .orElse(false);
    }

    // =========================================================
    // PASSWORD VALIDATION
    // =========================================================

    private String validatePasswordStrength(
            String password
    ) {

        if (password.length() < 8) {
            return "Password must contain at least 8 characters.";
        }

        if (!password.matches(".*[A-Z].*")) {
            return "Password must contain at least one uppercase letter.";
        }

        if (!password.matches(".*[a-z].*")) {
            return "Password must contain at least one lowercase letter.";
        }

        if (!password.matches(".*[0-9].*")) {
            return "Password must contain at least one number.";
        }

        if (!password.matches(".*[^a-zA-Z0-9].*")) {
            return "Password must contain at least one special character.";
        }

        return null;
    }

    // =========================================================
    // CHECK BCRYPT
    // =========================================================

    private boolean isBCryptPassword(
            String password
    ) {

        if (password == null) {
            return false;
        }

        return password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$");
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

    // =========================================================
    // SAFE EMPLOYEE RESPONSE
    // =========================================================

    private Map<String, Object> sanitizeEmployee(
            Employee employee
    ) {

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "id",
                employee.getId()
        );

        response.put(
                "employeeCode",
                employee.getEmployeeCode()
        );

        response.put(
                "name",
                employee.getName()
        );

        response.put(
                "email",
                employee.getEmail()
        );

        response.put(
                "department",
                employee.getDepartment()
        );

        response.put(
                "role",
                employee.getRole()
        );

        response.put(
                "phone",
                employee.getPhone()
        );

        response.put(
                "active",
                employee.isActive()
        );

        response.put(
                "accountRole",
                employee.getAccountRole()
        );

        // Password is NEVER returned.

        return response;
    }

    // =========================================================
    // RESET TOKEN DATA
    // =========================================================

    private record ResetTokenData(
            Long employeeId,
            Instant expiresAt
    ) {
    }
}