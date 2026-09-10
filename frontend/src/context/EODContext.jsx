// src/context/EODContext.jsx

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
} from "../services/api";

const EODContext = createContext();

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

        return JSON.parse(storedEmployee);
    } catch (error) {
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

const getCurrentEmployeeCode = () => {
    const storedCode =
        localStorage.getItem(
            "workpulse_current_employee_code"
        );

    if (storedCode) {
        return storedCode;
    }

    const currentEmployee =
        getCurrentEmployee();

    return (
        currentEmployee?.employeeCode || ""
    );
};

// ==================================================
// NOTIFICATION REFRESH EVENT
// ==================================================

const notifyNotificationRefresh = (
    employeeCode
) => {
    if (!employeeCode) {
        return;
    }

    window.dispatchEvent(
        new CustomEvent(
            "workpulse:notification-refresh",
            {
                detail: {
                    employeeCode,
                },
            }
        )
    );
};

// ==================================================
// NORMALIZE TASKS
// ==================================================

const normalizeTasks = (tasks) => {
    if (!Array.isArray(tasks)) {
        return [];
    }

    return tasks.map((task) => ({
        description:
            task?.description || "",

        status:
            task?.status || "Completed",

        remarks:
            task?.remarks || "",
    }));
};

// ==================================================
// EOD PROVIDER
// ==================================================

export const EODProvider = ({ children }) => {
    const [eodReports, setEodReports] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // ==================================================
    // GET EOD REPORTS
    // ==================================================

    const fetchEODReports =
        useCallback(async () => {
            const token =
                localStorage.getItem(
                    "workpulse_token"
                );

            if (!token) {
                setEodReports([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                // ======================================
                // ADMIN
                // ======================================

                if (isAdminUser()) {
                    const data =
                        await apiGet("/eod");

                    setEodReports(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                    return;
                }

                // ======================================
                // NORMAL EMPLOYEE
                // ======================================

                const employeeCode =
                    getCurrentEmployeeCode();

                if (!employeeCode) {
                    setEodReports([]);
                    return;
                }

                const data =
                    await apiGet(
                        `/eod/employee/${encodeURIComponent(
                            employeeCode
                        )}`
                    );

                setEodReports(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {
                setError(
                    "Unable to load EOD reports."
                );

                // Preserve previously loaded data
                setEodReports(
                    (previousReports) =>
                        Array.isArray(
                            previousReports
                        )
                            ? previousReports
                            : []
                );

            } finally {
                setLoading(false);
            }
        }, []);

    // ==================================================
    // LOAD EOD WHEN APP STARTS
    // ==================================================

    useEffect(() => {
        fetchEODReports();
    }, [fetchEODReports]);

    // ==================================================
    // ADD EOD REPORT
    // ==================================================

    const addEODReport =
        useCallback(async (report) => {
            try {
                setError("");

                if (!report) {
                    throw new Error(
                        "EOD report data is missing."
                    );
                }

                const currentEmployee =
                    getCurrentEmployee();

                const admin =
                    isAdminUser();

                // ======================================
                // BUILD REQUEST
                // ======================================

                const newReport = {
                    employeeCode:
                        admin
                            ? report.employeeCode || ""
                            : currentEmployee?.employeeCode || "",

                    employeeName:
                        admin
                            ? report.employeeName || ""
                            : currentEmployee?.name || "",

                    department:
                        admin
                            ? report.department || ""
                            : currentEmployee?.department || "",

                    date:
                        report.date || "",

                    timeIn:
                        report.timeIn || "",

                    timeOut:
                        report.timeOut || "",

                    // Backend calculates this.
                    tasks:
                        normalizeTasks(
                            report.tasks
                        ),
                };

                const savedReport =
                    await apiPost(
                        "/eod",
                        newReport
                    );

                setEodReports(
                    (previousReports) => [
                        savedReport,
                        ...previousReports,
                    ]
                );

                // ======================================
                // REFRESH NOTIFICATION BADGE
                // ======================================

                const employeeCode =
                    savedReport?.employeeCode ||
                    newReport.employeeCode ||
                    getCurrentEmployeeCode();

                notifyNotificationRefresh(
                    employeeCode
                );

                return savedReport;

            } catch (error) {
                setError(
                    "Unable to submit EOD report."
                );

                throw new Error(
                    "Unable to submit EOD report. Please try again."
                );
            }
        }, []);

    // ==================================================
    // UPDATE EOD REPORT
    // LOGGED-IN EMPLOYEE ONLY
    // ADMIN CAN EDIT THEIR OWN EOD
    // ==================================================

    const updateEODReport =
        useCallback(
            async (updatedReport) => {
                try {
                    setError("");

                    // ==================================
                    // VALIDATE REPORT ID
                    // ==================================

                    if (!updatedReport?.id) {
                        throw new Error(
                            "EOD report ID is missing."
                        );
                    }

                    // ==================================
                    // CURRENT EMPLOYEE
                    // ==================================

                    const currentEmployee =
                        getCurrentEmployee();

                    const currentEmployeeCode =
                        getCurrentEmployeeCode();

                    if (!currentEmployeeCode) {
                        throw new Error(
                            "Current employee code is missing."
                        );
                    }

                    // ==================================
                    // BUILD UPDATE REQUEST
                    //
                    // Employee code is always taken
                    // from the logged-in account.
                    // ==================================

                    const reportData = {
                        employeeCode:
                            currentEmployeeCode,

                        employeeName:
                            currentEmployee?.name || "",

                        department:
                            currentEmployee?.department || "",

                        date:
                            updatedReport.date || "",

                        timeIn:
                            updatedReport.timeIn || "",

                        timeOut:
                            updatedReport.timeOut || "",

                        tasks:
                            normalizeTasks(
                                updatedReport.tasks
                            ),
                    };

                    // ==================================
                    // PUT REQUEST
                    // ==================================

                    const savedReport =
                        await apiPut(
                            `/eod/${updatedReport.id}`,
                            reportData
                        );

                    // ==================================
                    // UPDATE LOCAL STATE
                    // ==================================

                    setEodReports(
                        (previousReports) =>
                            previousReports.map(
                                (report) =>
                                    report.id ===
                                        savedReport.id
                                        ? savedReport
                                        : report
                            )
                    );

                    // ==================================
                    // REFRESH NOTIFICATION BADGE
                    // ==================================

                    const employeeCode =
                        savedReport?.employeeCode ||
                        currentEmployeeCode;

                    notifyNotificationRefresh(
                        employeeCode
                    );

                    return savedReport;

                } catch (error) {

                    setError(
                        "Unable to update EOD report."
                    );

                    throw new Error(
                        "Unable to update EOD report. Please try again."
                    );
                }
            },
            []
        );

    // ==================================================
    // GET EMPLOYEE EOD REPORTS
    // ==================================================

    const getEmployeeEODReports =
        useCallback(
            (employeeCode) => {
                if (!employeeCode) {
                    return [];
                }

                return eodReports.filter(
                    (report) =>
                        report.employeeCode
                            ?.toUpperCase() ===
                        employeeCode.toUpperCase()
                );
            },
            [eodReports]
        );

    // ==================================================
    // GET EMPLOYEE EOD FOR SPECIFIC DATE
    // ==================================================

    const getEmployeeEODByDate =
        useCallback(
            (
                employeeCode,
                date
            ) => {
                if (
                    !employeeCode ||
                    !date
                ) {
                    return null;
                }

                return eodReports.find(
                    (report) =>
                        report.employeeCode
                            ?.toUpperCase() ===
                        employeeCode.toUpperCase() &&
                        report.date === date
                );
            },
            [eodReports]
        );

    // ==================================================
    // REFRESH EOD REPORTS
    // ==================================================

    const refreshEODReports =
        useCallback(async () => {
            await fetchEODReports();
        }, [fetchEODReports]);

    // ==================================================
    // CONTEXT
    // ==================================================

    return (
        <EODContext.Provider
            value={{
                eodReports,

                addEODReport,

                updateEODReport,

                getEmployeeEODReports,

                getEmployeeEODByDate,

                refreshEODReports,

                loading,

                error,
            }}
        >
            {children}
        </EODContext.Provider>
    );
};

// ==================================================
// CUSTOM HOOK
// ==================================================

export const useEOD = () => {
    const context =
        useContext(EODContext);

    if (!context) {
        throw new Error(
            "useEOD must be used inside EODProvider"
        );
    }

    return context;
};