import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
    const location = useLocation();

    const token =
        localStorage.getItem("workpulse_token");

    const employeeData =
        localStorage.getItem(
            "workpulse_current_employee"
        );

    let validEmployeeData = false;

    if (employeeData) {
        try {
            const employee = JSON.parse(
                employeeData
            );

            validEmployeeData =
                Boolean(employee?.employeeCode);
        } catch {
            validEmployeeData = false;
        }
    }

    const isAuthenticated =
        Boolean(token) &&
        validEmployeeData;

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;