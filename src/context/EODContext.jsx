// src/context/EODContext.jsx

import { createContext, useContext, useState } from "react";

const EODContext = createContext();

const STORAGE_KEY = "workpulse_eod_reports";

export const EODProvider = ({ children }) => {
    // ---------------------------------------------
    // Load saved EOD reports
    // ---------------------------------------------

    const [eodReports, setEodReports] = useState(() => {
        try {
            const savedReports =
                localStorage.getItem(STORAGE_KEY);

            return savedReports
                ? JSON.parse(savedReports)
                : [];
        } catch (error) {
            console.error(
                "Failed to load EOD reports:",
                error
            );

            return [];
        }
    });

    // ---------------------------------------------
    // Save reports
    // ---------------------------------------------

    const saveReports = (reports) => {
        setEodReports(reports);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(reports)
        );
    };

    // ---------------------------------------------
    // Add EOD
    // ---------------------------------------------

    const addEODReport = (report) => {
        const newReport = {
            id: report.id || Date.now(),

            employeeCode:
                report.employeeCode || "",

            employeeName:
                report.employeeName || "",

            department:
                report.department || "",

            date:
                report.date || "",

            timeIn:
                report.timeIn || "",

            timeOut:
                report.timeOut || "",

            // IMPORTANT:
            // Use totalWorkingHours consistently
            totalWorkingHours:
                report.totalWorkingHours ||
                report.workingHours ||
                "",

            tasks:
                Array.isArray(report.tasks)
                    ? report.tasks
                    : [],

            submittedAt:
                report.submittedAt ||
                new Date().toISOString(),

            updatedAt:
                report.updatedAt || null,
        };

        saveReports([
            ...eodReports,
            newReport,
        ]);
    };

    // ---------------------------------------------
    // Update EOD
    // ---------------------------------------------

    const updateEODReport = (updatedReport) => {
        const updatedReports = eodReports.map(
            (report) =>
                report.id === updatedReport.id
                    ? {
                          ...report,
                          ...updatedReport,

                          // Keep working-hours field
                          // consistent
                          totalWorkingHours:
                              updatedReport.totalWorkingHours ||
                              updatedReport.workingHours ||
                              report.totalWorkingHours ||
                              "",

                          updatedAt:
                              new Date().toISOString(),
                      }
                    : report
        );

        saveReports(updatedReports);
    };

    // ---------------------------------------------
    // Get employee EOD reports
    // ---------------------------------------------

    const getEmployeeEODReports = (
        employeeCode
    ) => {
        if (!employeeCode) {
            return [];
        }

        return eodReports.filter(
            (report) =>
                report.employeeCode ===
                employeeCode
        );
    };

    // ---------------------------------------------
    // Get employee EOD for specific date
    // ---------------------------------------------

    const getEmployeeEODByDate = (
        employeeCode,
        date
    ) => {
        if (!employeeCode || !date) {
            return null;
        }

        return eodReports.find(
            (report) =>
                report.employeeCode ===
                    employeeCode &&
                report.date === date
        );
    };

    // ---------------------------------------------
    // Context
    // ---------------------------------------------

    return (
        <EODContext.Provider
            value={{
                eodReports,

                addEODReport,

                updateEODReport,

                getEmployeeEODReports,

                getEmployeeEODByDate,
            }}
        >
            {children}
        </EODContext.Provider>
    );
};

// ---------------------------------------------
// Custom Hook
// ---------------------------------------------

export const useEOD = () => {
    const context = useContext(EODContext);

    if (!context) {
        throw new Error(
            "useEOD must be used inside EODProvider"
        );
    }

    return context;
};