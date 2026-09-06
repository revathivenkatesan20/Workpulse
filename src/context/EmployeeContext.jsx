// src/context/EmployeeContext.jsx

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const EmployeeContext = createContext();

const STORAGE_KEY = "workpulse_employees";

export const EmployeeProvider = ({ children }) => {
    const [employees, setEmployees] = useState(() => {
        try {
            const savedEmployees =
                localStorage.getItem(STORAGE_KEY);

            if (savedEmployees) {
                const parsedEmployees =
                    JSON.parse(savedEmployees);

                if (Array.isArray(parsedEmployees)) {
                    return parsedEmployees;
                }
            }
        } catch (error) {
            console.error(
                "Failed to load employees:",
                error
            );
        }

        // No default/sample employees
        return [];
    });

    /* --------------------------------
       LISTEN FOR EMPLOYEE UPDATES
    --------------------------------- */

    useEffect(() => {
        const handleEmployeeUpdate = () => {
            try {
                const savedEmployees = JSON.parse(
                    localStorage.getItem(STORAGE_KEY) || "[]"
                );

                if (Array.isArray(savedEmployees)) {
                    setEmployees(savedEmployees);
                }
            } catch (error) {
                console.error(
                    "Failed to refresh employees:",
                    error
                );
            }
        };

        window.addEventListener(
            "workpulse_employees_updated",
            handleEmployeeUpdate
        );

        return () => {
            window.removeEventListener(
                "workpulse_employees_updated",
                handleEmployeeUpdate
            );
        };
    }, []);

    /* --------------------------------
       KEEP LOCAL STORAGE UPDATED
    --------------------------------- */

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(employees)
            );
        } catch (error) {
            console.error(
                "Failed to save employees:",
                error
            );
        }
    }, [employees]);

    /* --------------------------------
       GET EMPLOYEE BY CODE
    --------------------------------- */

    const getEmployeeByCode = (employeeCode) => {
        if (!employeeCode) {
            return undefined;
        }

        return employees.find(
            (employee) =>
                employee.employeeCode?.toUpperCase() ===
                employeeCode.toUpperCase()
        );
    };

    /* --------------------------------
       GET EMPLOYEE BY EMAIL
    --------------------------------- */

    const getEmployeeByEmail = (email) => {
        if (!email) {
            return undefined;
        }

        return employees.find(
            (employee) =>
                employee.email?.toLowerCase() ===
                email.toLowerCase()
        );
    };

    return (
        <EmployeeContext.Provider
            value={{
                employees,
                getEmployeeByCode,
                getEmployeeByEmail,
                setEmployees,
            }}
        >
            {children}
        </EmployeeContext.Provider>
    );
};

export const useEmployees = () => {
    const context = useContext(EmployeeContext);

    if (!context) {
        throw new Error(
            "useEmployees must be used inside EmployeeProvider"
        );
    }

    return context;
};
