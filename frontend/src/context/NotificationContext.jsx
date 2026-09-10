// src/context/NotificationContext.jsx

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
    apiPatch,
    apiDelete,
} from "../services/api";

const NotificationContext = createContext();

const API_BASE_PATH = "/notifications";

/* ==================================================
   HELPERS
================================================== */

// --------------------------------------------------
// Get Current Employee
// --------------------------------------------------

const getCurrentEmployee = () => {
    try {
        return JSON.parse(
            localStorage.getItem(
                "workpulse_current_employee"
            ) || "null"
        );
    } catch (error) {
        return null;
    }
};

// --------------------------------------------------
// Normalize Notification
// --------------------------------------------------

const normalizeNotification = (notification) => {
    return {
        id: notification?.id,

        employeeCode:
            notification?.employeeCode || "",

        type:
            notification?.type || "INFO",

        title:
            notification?.title ||
            "WorkPulse Update",

        message:
            notification?.message || "",

        read:
            notification?.read === true,

        createdAt:
            notification?.createdAt ||
            new Date().toISOString(),

        ...notification,
    };
};

/* ==================================================
   PROVIDER
================================================== */

export const NotificationProvider = ({
    children,
}) => {
    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(false);


    /* ==================================================
       FETCH NOTIFICATIONS
    ================================================== */

    const refreshNotifications =
        useCallback(async (employeeCode) => {
            if (!employeeCode) {
                setNotifications([]);
                return [];
            }

            try {
                setLoading(true);

                const code =
                    employeeCode.trim();

                const data = await apiGet(
                    `${API_BASE_PATH}/employee/${encodeURIComponent(
                        code
                    )}`
                );

                const normalized =
                    Array.isArray(data)
                        ? data.map(
                            normalizeNotification
                        )
                        : [];

                setNotifications(normalized);

                return normalized;
            } catch (error) {

                /*
                 * Keep existing notifications
                 * during temporary API/network errors.
                 */
                return [];
            } finally {
                setLoading(false);
            }
        }, []);

    /* ==================================================
       FETCH UNREAD COUNT FROM BACKEND
    ================================================== */

    const refreshUnreadCount =
        useCallback(async (employeeCode) => {
            if (!employeeCode) {
                return 0;
            }

            try {
                const code =
                    employeeCode.trim();

                const data = await apiGet(
                    `${API_BASE_PATH}/employee/${encodeURIComponent(
                        code
                    )}/unread-count`
                );

                return Number(
                    data?.count || 0
                );
            } catch (error) {
                return 0;
            }
        }, []);

    /* ==================================================
       AUTOMATIC NOTIFICATION REFRESH
    ================================================== */

    useEffect(() => {
        const refreshForCurrentEmployee =
            async () => {
                const employee =
                    getCurrentEmployee();

                const employeeCode =
                    employee?.employeeCode;

                if (!employeeCode) {
                    return;
                }

                await refreshNotifications(
                    employeeCode
                );

                await refreshUnreadCount(
                    employeeCode
                );
            };

        refreshForCurrentEmployee();

        /*
         * Keep notifications and sidebar badge
         * updated while user is working.
         */
        const interval = setInterval(
            refreshForCurrentEmployee,
            15000
        );

        return () => {
            clearInterval(interval);
        };
    }, [
        refreshNotifications,
        refreshUnreadCount,
    ]);

    useEffect(() => {
        const handleEODNotificationRefresh = async (event) => {
            const employeeCode =
                event?.detail?.employeeCode;

            if (!employeeCode) {
                return;
            }

            try {
                await Promise.all([
                    refreshNotifications(employeeCode),
                    refreshUnreadCount(employeeCode),
                ]);
            } catch (error) {
            }
        };

        window.addEventListener(
            "workpulse:notification-refresh",
            handleEODNotificationRefresh
        );

        return () => {
            window.removeEventListener(
                "workpulse:notification-refresh",
                handleEODNotificationRefresh
            );
        };
    }, [
        refreshNotifications,
        refreshUnreadCount,
    ]);

    /* ==================================================
       ADD NOTIFICATION
       ADMIN / INTERNAL USE
    ================================================== */

    const addNotification =
        useCallback(
            async (notification) => {
                if (!notification) {
                    return null;
                }

                if (
                    !notification.employeeCode
                ) {
                    return null;
                }

                try {
                    const payload = {
                        employeeCode:
                            notification.employeeCode.trim(),

                        type:
                            notification.type ||
                            "INFO",

                        title:
                            notification.title ||
                            "WorkPulse Update",

                        message:
                            notification.message ||
                            "",

                        read: false,

                        createdAt:
                            notification.createdAt ||
                            new Date().toISOString(),
                    };

                    /*
                     * eventId is only included if
                     * supported by the backend entity.
                     */
                    if (
                        notification.eventId
                    ) {
                        payload.eventId =
                            notification.eventId;
                    }

                    const savedNotification =
                        await apiPost(
                            API_BASE_PATH,
                            payload
                        );

                    const normalized =
                        normalizeNotification(
                            savedNotification
                        );

                    setNotifications(
                        (
                            previousNotifications
                        ) => {
                            const alreadyExists =
                                previousNotifications.some(
                                    (
                                        existing
                                    ) =>
                                        existing.id ===
                                        normalized.id ||
                                        (
                                            notification.eventId &&
                                            existing.eventId ===
                                            notification.eventId
                                        )
                                );

                            if (
                                alreadyExists
                            ) {
                                return previousNotifications;
                            }

                            return [
                                normalized,
                                ...previousNotifications,
                            ];
                        }
                    );

                    return normalized;
                } catch (error) {
                    return null;
                }
            },
            []
        );

    /* ==================================================
       EOD SUBMITTED
    ================================================== */

    const addEODSubmittedNotification =
        useCallback(
            async ({
                employeeCode,
                employeeName,
                date,
            }) => {
                if (!employeeCode) {
                    return null;
                }

                return addNotification({
                    employeeCode,

                    type: "EOD_SUBMITTED",

                    title: "EOD Submitted",

                    message: employeeName
                        ? `${employeeName}, your EOD report has been submitted successfully.`
                        : "Your EOD report has been submitted successfully.",

                    eventId: `EOD_SUBMITTED-${employeeCode}-${date}`,
                });
            },
            [addNotification]
        );

    /* ==================================================
       EOD UPDATED
    ================================================== */

    const addEODUpdatedNotification =
        useCallback(
            async ({
                employeeCode,
                employeeName,
                date,
            }) => {
                if (!employeeCode) {
                    return null;
                }

                return addNotification({
                    employeeCode,

                    type: "EOD_UPDATED",

                    title: "EOD Updated",

                    message: employeeName
                        ? `${employeeName}, your EOD report has been updated successfully.`
                        : "Your EOD report has been updated successfully.",

                    eventId: `EOD_UPDATED-${employeeCode}-${date}`,
                });
            },
            [addNotification]
        );

    /* ==================================================
       EOD REMINDER
    ================================================== */

    const addEODReminderNotification =
        useCallback(
            async ({
                employeeCode,
                employeeName,
                date,
            }) => {
                if (!employeeCode) {
                    return null;
                }

                return addNotification({
                    employeeCode,

                    type: "REMINDER",

                    title: "EOD Reminder",

                    message: employeeName
                        ? `${employeeName}, don't forget to submit your EOD report for today.`
                        : "Don't forget to submit your EOD report for today.",

                    eventId: `REMINDER-${employeeCode}-${date}`,
                });
            },
            [addNotification]
        );

    /* ==================================================
       GENERAL INFORMATION
    ================================================== */

    const addInfoNotification =
        useCallback(
            async ({
                employeeCode,
                title,
                message,
            }) => {
                if (!employeeCode) {
                    return null;
                }

                return addNotification({
                    employeeCode,

                    type: "INFO",

                    title:
                        title ||
                        "WorkPulse Update",

                    message:
                        message || "",
                });
            },
            [addNotification]
        );

    /* ==================================================
       MARK ONE AS READ
    ================================================== */

    const markAsRead =
        useCallback(
            async (notificationId) => {
                if (!notificationId) {
                    return null;
                }

                try {
                    const updated =
                        await apiPatch(
                            `${API_BASE_PATH}/${notificationId}/read`
                        );

                    const normalized =
                        normalizeNotification(
                            updated
                        );

                    setNotifications(
                        (
                            previousNotifications
                        ) =>
                            previousNotifications.map(
                                (
                                    notification
                                ) =>
                                    notification.id ===
                                        notificationId
                                        ? normalized
                                        : notification
                            )
                    );

                    return normalized;
                } catch (error) {
                    return null;
                }
            },
            []
        );

    /* ==================================================
       MARK ONE AS UNREAD
    ================================================== */

    const markAsUnread =
        useCallback(
            async (notificationId) => {
                if (!notificationId) {
                    return null;
                }

                try {
                    const updated =
                        await apiPatch(
                            `${API_BASE_PATH}/${notificationId}/unread`
                        );

                    const normalized =
                        normalizeNotification(
                            updated
                        );

                    setNotifications(
                        (
                            previousNotifications
                        ) =>
                            previousNotifications.map(
                                (
                                    notification
                                ) =>
                                    notification.id ===
                                        notificationId
                                        ? normalized
                                        : notification
                            )
                    );

                    return normalized;
                } catch (error) {
                    return null;
                }
            },
            []
        );

    /* ==================================================
       MARK ALL AS READ
    ================================================== */

    const markAllAsRead =
        useCallback(
            async (employeeCode) => {
                if (!employeeCode) {
                    return false;
                }

                try {
                    const code =
                        employeeCode.trim();

                    await apiPatch(
                        `${API_BASE_PATH}/employee/${encodeURIComponent(
                            code
                        )}/read-all`
                    );

                    /*
                     * Backend currently returns:
                     * { message: "All notifications marked as read." }
                     *
                     * Therefore update local state after
                     * successful API response.
                     */
                    setNotifications(
                        (
                            previousNotifications
                        ) =>
                            previousNotifications.map(
                                (
                                    notification
                                ) =>
                                    notification.employeeCode
                                        ?.trim()
                                        .toLowerCase() ===
                                        code.toLowerCase()
                                        ? {
                                            ...notification,
                                            read: true,
                                        }
                                        : notification
                            )
                    );

                    return true;
                } catch (error) {
                    return false;
                }
            },
            []
        );

    /* ==================================================
       MARK ALL AS UNREAD
    ================================================== */

    const markAllAsUnread =
        useCallback(
            async (employeeCode) => {
                if (!employeeCode) {
                    return false;
                }

                try {
                    const code =
                        employeeCode.trim();

                    const employeeNotifications =
                        notifications.filter(
                            (notification) =>
                                notification.employeeCode
                                    ?.trim()
                                    .toLowerCase() ===
                                code.toLowerCase() &&
                                notification.read
                        );

                    await Promise.all(
                        employeeNotifications.map(
                            (notification) =>
                                apiPatch(
                                    `${API_BASE_PATH}/${notification.id}/unread`
                                )
                        )
                    );

                    setNotifications(
                        (
                            previousNotifications
                        ) =>
                            previousNotifications.map(
                                (
                                    notification
                                ) =>
                                    notification.employeeCode
                                        ?.trim()
                                        .toLowerCase() ===
                                        code.toLowerCase()
                                        ? {
                                            ...notification,
                                            read: false,
                                        }
                                        : notification
                            )
                    );

                    return true;
                } catch (error) {
                    return false;
                }
            },
            [notifications]
        );

    /* ==================================================
       DELETE ONE NOTIFICATION
    ================================================== */

    const deleteNotification =
        useCallback(
            async (notificationId) => {
                if (!notificationId) {
                    return false;
                }

                try {
                    await apiDelete(
                        `${API_BASE_PATH}/${notificationId}`
                    );

                    setNotifications(
                        (
                            previousNotifications
                        ) =>
                            previousNotifications.filter(
                                (
                                    notification
                                ) =>
                                    notification.id !==
                                    notificationId
                            )
                    );

                    return true;
                } catch (error) {
                    return false;
                }
            },
            []
        );

    /* ==================================================
       CLEAR EMPLOYEE NOTIFICATIONS
    ================================================== */

    const clearNotifications =
        useCallback(
            async (employeeCode) => {
                if (!employeeCode) {
                    return false;
                }

                try {
                    const code =
                        employeeCode.trim();

                    await apiDelete(
                        `${API_BASE_PATH}/employee/${encodeURIComponent(
                            code
                        )}`
                    );

                    setNotifications(
                        (
                            previousNotifications
                        ) =>
                            previousNotifications.filter(
                                (
                                    notification
                                ) =>
                                    notification.employeeCode
                                        ?.trim()
                                        .toLowerCase() !==
                                    code.toLowerCase()
                            )
                    );

                    return true;
                } catch (error) {
                    return false;
                }
            },
            []
        );

    /* ==================================================
       CLEAR ALL
    ================================================== */

    const clearAllNotifications =
        useCallback(
            async (employeeCode) => {
                if (!employeeCode) {
                    return false;
                }

                return await clearNotifications(
                    employeeCode
                );
            },
            [clearNotifications]
        );

    /* ==================================================
       GET USER NOTIFICATIONS
    ================================================== */

    const getUserNotifications =
        useCallback(
            (employeeCode) => {
                if (!employeeCode) {
                    return [];
                }

                const code =
                    employeeCode.trim();

                return notifications
                    .filter(
                        (notification) =>
                            notification.employeeCode
                                ?.trim()
                                .toLowerCase() ===
                            code.toLowerCase()
                    )
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt
                            ).getTime() -
                            new Date(
                                a.createdAt
                            ).getTime()
                    );
            },
            [notifications]
        );

    /* ==================================================
       GET UNREAD COUNT
    ================================================== */

    const getUnreadCount =
        useCallback(
            (employeeCode) => {
                if (!employeeCode) {
                    return 0;
                }

                const code =
                    employeeCode.trim();

                return notifications.filter(
                    (notification) =>
                        notification.employeeCode
                            ?.trim()
                            .toLowerCase() ===
                        code.toLowerCase() &&
                        !notification.read
                ).length;
            },
            [notifications]
        );

    /* ==================================================
       GET READ COUNT
    ================================================== */

    const getReadCount =
        useCallback(
            (employeeCode) => {
                if (!employeeCode) {
                    return 0;
                }

                const code =
                    employeeCode.trim();

                return notifications.filter(
                    (notification) =>
                        notification.employeeCode
                            ?.trim()
                            .toLowerCase() ===
                        code.toLowerCase() &&
                        notification.read
                ).length;
            },
            [notifications]
        );

    /* ==================================================
       HAS UNREAD
    ================================================== */

    const hasUnreadNotifications =
        useCallback(
            (employeeCode) =>
                getUnreadCount(
                    employeeCode
                ) > 0,
            [getUnreadCount]
        );

    /* ==================================================
       GET BY ID
    ================================================== */

    const getNotificationById =
        useCallback(
            (notificationId) => {
                if (!notificationId) {
                    return undefined;
                }

                return notifications.find(
                    (notification) =>
                        notification.id ===
                        notificationId
                );
            },
            [notifications]
        );

    /* ==================================================
       PROVIDER
    ================================================== */

    return (
        <NotificationContext.Provider
            value={{
                notifications,

                loading,

                refreshNotifications,

                refreshUnreadCount,

                addNotification,

                addEODSubmittedNotification,

                addEODUpdatedNotification,

                addEODReminderNotification,

                addInfoNotification,

                markAsRead,

                markAsUnread,

                markAllAsRead,

                markAllAsUnread,

                deleteNotification,

                clearNotifications,

                clearAllNotifications,

                getUserNotifications,

                getUnreadCount,

                getReadCount,

                hasUnreadNotifications,

                getNotificationById,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

/* ==================================================
   HOOK
================================================== */

export const useNotifications = () => {
    const context =
        useContext(
            NotificationContext
        );

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );
    }

    return context;
};