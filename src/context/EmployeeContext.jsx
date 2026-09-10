// src/context/EmployeeContext.jsx

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
} from "../services/api";

const EmployeeContext = createContext();

// ==================================================
// HELPERS
// ==================================================

const getCurrentEmployee = () => {
    try {
        const storedEmployee = localStorage.getItem(
            "workpulse_current_employee"
        );

        if (!storedEmployee) {
            return null;
        }

        const employee = JSON.parse(
            storedEmployee
        );

        if (
            !employee ||
            typeof employee !== "object"
        ) {
            return null;
        }

        return employee;
    } catch {
        return null;
    }
};

const isAdminUser = () => {
    const currentEmployee =
        getCurrentEmployee();

    const accountRole =
        currentEmployee?.accountRole
            ?.trim()
            .toUpperCase();

    return accountRole === "ADMIN";
};

const syncCurrentEmployee = (employee) => {
    if (!employee?.id) {
        return;
    }

    const currentEmployee =
        getCurrentEmployee();

    if (!currentEmployee?.id) {
        return;
    }

    if (
        currentEmployee.id !==
        employee.id
    ) {
        return;
    }

    const synchronizedEmployee = {
        id: employee.id,

        employeeCode:
            employee.employeeCode ||
            currentEmployee.employeeCode ||
            "",

        name:
            employee.name ||
            currentEmployee.name ||
            "",

        email:
            employee.email ||
            currentEmployee.email ||
            "",

        department:
            employee.department ||
            currentEmployee.department ||
            "",

        designation:
            employee.designation ||
            employee.role ||
            currentEmployee.designation ||
            "",

        role:
            employee.role ||
            currentEmployee.role ||
            "",

        phone:
            employee.phone ||
            currentEmployee.phone ||
            "",

        active:
            employee.active !== false,

        status:
            employee.active === false
                ? "Inactive"
                : "Active",

        accountRole:
            employee.accountRole ||
            currentEmployee.accountRole ||
            "EMPLOYEE",
    };

    localStorage.setItem(
        "workpulse_current_employee",
        JSON.stringify(
            synchronizedEmployee
        )
    );

    localStorage.setItem(
        "workpulse_current_employee_code",
        synchronizedEmployee.employeeCode
    );

    window.dispatchEvent(
        new Event(
            "workpulse-employee-updated"
        )
    );
};

// ==================================================
// EMPLOYEE PROVIDER
// ==================================================

export const EmployeeProvider = ({
    children,
}) => {
    const [employees, setEmployees] =
        useState([]);

    const [currentEmployee, setCurrentEmployee] =
        useState(() =>
            getCurrentEmployee()
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

// ==================================================
// SYNC CURRENT EMPLOYEE
// ==================================================

    useEffect(() => {
        const syncEmployee = () => {
            setCurrentEmployee(
                getCurrentEmployee()
            );
        };

        window.addEventListener(
            "workpulse-employee-updated",
            syncEmployee
        );

        return () => {
            window.removeEventListener(
                "workpulse-employee-updated",
                syncEmployee
            );
        };
    }, []);

// ==================================================
// GET EMPLOYEES
// ==================================================

    const fetchEmployees =
        useCallback(async () => {
            const token =
                localStorage.getItem(
                    "workpulse_token"
                );

            if (!token) {
                setEmployees([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const loggedInEmployee =
                    getCurrentEmployee();

                // ==========================================
                // ADMIN
                // ==========================================

                if (isAdminUser()) {
                    const data =
                        await apiGet(
                            "/employees"
                        );

                    setEmployees(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                    return;
                }

                // ==========================================
                // NORMAL EMPLOYEE
                // ==========================================

                if (!loggedInEmployee?.id) {
                    setEmployees(
                        loggedInEmployee
                            ? [loggedInEmployee]
                            : []
                    );

                    return;
                }

                const employee =
                    await apiGet(
                        `/employees/${loggedInEmployee.id}`
                    );

                if (employee) {
                    setEmployees([
                        employee,
                    ]);

                    syncCurrentEmployee(
                        employee
                    );
                } else {
                    setEmployees([]);
                }
            } catch {
                setError(
                    "Unable to load employees."
                );

                // Preserve already loaded data
                setEmployees(
                    (previousEmployees) =>
                        Array.isArray(
                            previousEmployees
                        )
                            ? previousEmployees
                            : []
                );
            } finally {
                setLoading(false);
            }
        }, []);

// ==================================================
// LOAD EMPLOYEES WHEN APP STARTS
// ==================================================

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

// ==================================================
// GET EMPLOYEE BY CODE
// ==================================================

    const getEmployeeByCode =
        useCallback(
            (employeeCode) => {
                if (!employeeCode) {
                    return undefined;
                }

                const normalizedCode =
                    employeeCode
                        .toString()
                        .trim()
                        .toUpperCase();

                return employees.find(
                    (employee) =>
                        employee.employeeCode
                            ?.toString()
                            .trim()
                            .toUpperCase() ===
                        normalizedCode
                );
            },
            [employees]
        );

// ==================================================
// GET EMPLOYEE BY EMAIL
// ==================================================

    const getEmployeeByEmail =
        useCallback(
            (email) => {
                if (!email) {
                    return undefined;
                }

                const normalizedEmail =
                    email
                        .toString()
                        .trim()
                        .toLowerCase();

                return employees.find(
                    (employee) =>
                        employee.email
                            ?.toString()
                            .trim()
                            .toLowerCase() ===
                        normalizedEmail
                );
            },
            [employees]
        );

// ==================================================
// REFRESH EMPLOYEES
// ==================================================

    const refreshEmployees =
        useCallback(async () => {
            await fetchEmployees();
        }, [fetchEmployees]);

// ==================================================
// ADD EMPLOYEE
// ==================================================

    const addEmployee =
        useCallback(
            async (employee) => {
                try {
                    setError("");

                    const savedEmployee =
                        await apiPost(
                            "/employees/register",
                            employee
                        );

                    setEmployees(
                        (previousEmployees) => [
                            ...previousEmployees,
                            savedEmployee,
                        ]
                    );

                    return savedEmployee;
                } catch {
                    setError(
                        "Unable to add employee."
                    );

                    throw new Error(
                        "Unable to add employee. Please try again."
                    );
                }
            },
            []
        );

// ==================================================
// UPDATE EMPLOYEE
// ==================================================

    const updateEmployee =
        useCallback(
            async (employee) => {
                try {
                    setError("");

                    if (!employee?.id) {
                        throw new Error(
                            "Employee ID is missing."
                        );
                    }

                    const savedEmployee =
                        await apiPut(
                            `/employees/${employee.id}`,
                            employee
                        );

                    setEmployees(
                        (previousEmployees) =>
                            previousEmployees.map(
                                (item) =>
                                    item.id ===
                                    savedEmployee.id
                                        ? savedEmployee
                                        : item
                            )
                    );

                    // Synchronize current employee
                    // information after self-update.
                    syncCurrentEmployee(
                        savedEmployee
                    );

                    return savedEmployee;
                } catch {
                    setError(
                        "Unable to update employee."
                    );

                    throw new Error(
                        "Unable to update employee. Please try again."
                    );
                }
            },
            []
        );

// ==================================================
// CHANGE ACTIVE / INACTIVE STATUS
// ==================================================

    const updateEmployeeStatus =
        useCallback(
            async (
                employeeId,
                active
            ) => {
                try {
                    setError("");

                    if (!employeeId) {
                        throw new Error(
                            "Employee ID is missing."
                        );
                    }

                    const updatedEmployee =
                        await apiPatch(
                            `/employees/${employeeId}/status?active=${active}`
                        );

                    setEmployees(
                        (previousEmployees) =>
                            previousEmployees.map(
                                (employee) =>
                                    employee.id ===
                                    updatedEmployee.id
                                        ? updatedEmployee
                                        : employee
                            )
                    );

                    // Synchronize localStorage
                    // only when the changed employee
                    // is the currently logged-in employee.
                    syncCurrentEmployee(
                        updatedEmployee
                    );

                    return updatedEmployee;
                } catch {
                    setError(
                        "Unable to update employee status."
                    );

                    throw new Error(
                        "Unable to update employee status. Please try again."
                    );
                }
            },
            []
        );

// ==================================================
// CONTEXT
// ==================================================

    return (
        <EmployeeContext.Provider
            value={{
                employees,

                currentEmployee,

                loading,
                error,

                getEmployeeByCode,
                getEmployeeByEmail,

                addEmployee,
                updateEmployee,
                updateEmployeeStatus,

                refreshEmployees,

                setEmployees,
            }}
        >
            {children}
        </EmployeeContext.Provider>
    );
};

// ==================================================
// CUSTOM HOOK - useEmployees
// ==================================================

export const useEmployees = () => {
    const context =
        useContext(EmployeeContext);

    if (!context) {
        throw new Error(
            "useEmployees must be used inside EmployeeProvider"
        );
    }

    return context;
};

// ==================================================
// CUSTOM HOOK - useEmployee
// ==================================================

export const useEmployee = () => {
    const context =
        useContext(EmployeeContext);

    if (!context) {
        throw new Error(
            "useEmployee must be used inside EmployeeProvider"
        );
    }

    return context;
};