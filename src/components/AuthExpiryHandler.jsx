import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetAuthExpiryState } from "../services/api";

const AuthExpiryHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthExpired = () => {
            localStorage.removeItem(
                "workpulse_token"
            );

            localStorage.removeItem(
                "workpulse_current_employee"
            );

            localStorage.removeItem(
                "workpulse_current_employee_code"
            );

            resetAuthExpiryState();

            navigate("/login", {
                replace: true,
                state: {
                    sessionExpired: true,
                },
            });
        };

        window.addEventListener(
            "workpulse-auth-expired",
            handleAuthExpired
        );

        return () => {
            window.removeEventListener(
                "workpulse-auth-expired",
                handleAuthExpired
            );
        };
    }, [navigate]);

    return null;
};

export default AuthExpiryHandler;