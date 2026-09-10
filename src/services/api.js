
const API_BASE_URL = "http://localhost:8080/api";

// Prevent multiple simultaneous session-expired events
let sessionExpiryHandled = false;

// =============================================================
// CORE API REQUEST
// =============================================================

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("workpulse_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    // Attach JWT automatically when available
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }


    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers,
            }
        );

        // =====================================================
        // 401 — UNAUTHORIZED
        // =====================================================

        if (response.status === 401) {
            if (!sessionExpiryHandled) {
                sessionExpiryHandled = true;

                window.dispatchEvent(
                    new CustomEvent(
                        "workpulse-auth-expired"
                    )
                );
            }

            throw new Error(
                "Authentication required."
            );
        }

        // =====================================================
        // READ RESPONSE
        // =====================================================

        const contentType =
            response.headers.get("content-type") || "";

        let data;

        if (
            contentType.includes(
                "application/json"
            )
        ) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // =====================================================
        // OTHER API ERRORS
        // =====================================================

        if (!response.ok) {
            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message ||
                      data?.error ||
                      "Something went wrong."
            );
        }

        // =====================================================
        // SUCCESS
        // =====================================================

        return data;

    } catch (error) {

        // Network/server connection error
        if (
            error?.name === "TypeError"
        ) {
            throw new Error(
                "Unable to connect to the server."
            );
        }

        throw error;
    }
};

// =============================================================
// API HELPERS
// =============================================================

export const apiGet = (endpoint) =>
    apiRequest(endpoint, {
        method: "GET",
    });

export const apiPost = (endpoint, body) =>
    apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });

export const apiPut = (endpoint, body) =>
    apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
    });

export const apiPatch = (endpoint, body) =>
    apiRequest(endpoint, {
        method: "PATCH",
        body:
            body !== undefined
                ? JSON.stringify(body)
                : undefined,
    });

export const apiDelete = (endpoint) =>
    apiRequest(endpoint, {
        method: "DELETE",
    });

// =============================================================
// AUTH STATE
// =============================================================

export const resetAuthExpiryState = () => {
    sessionExpiryHandled = false;
};

// =============================================================
// LOGIN
// =============================================================

export const loginEmployee = async (
    email,
    password
) => {
    const response = await fetch(
        `${API_BASE_URL}/employees/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        }
    );

    const contentType =
        response.headers.get("content-type") || "";

    let data;

    if (
        contentType.includes(
            "application/json"
        )
    ) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const message =
            typeof data === "string"
                ? data
                : data?.message ||
                  data?.error ||
                  "Invalid email or password.";

        const error = new Error(message);

        error.status = response.status;

        throw error;
    }

    // Successful login means the session is valid again
    resetAuthExpiryState();

    return data;
};

export default apiRequest;
