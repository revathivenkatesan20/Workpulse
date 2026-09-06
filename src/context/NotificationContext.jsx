import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const NotificationContext = createContext();

const STORAGE_KEY = "workpulse_notifications";

export const NotificationProvider = ({ children }) => {
    // Load notifications from localStorage
    const [notifications, setNotifications] = useState(() => {
        try {
            const savedNotifications =
                localStorage.getItem(STORAGE_KEY);

            if (savedNotifications) {
                const parsedNotifications =
                    JSON.parse(savedNotifications);

                if (Array.isArray(parsedNotifications)) {
                    return parsedNotifications;
                }
            }
        } catch (error) {
            console.error(
                "Failed to load notifications:",
                error
            );
        }

        return [];
    });

    // Save notifications whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(notifications)
            );
        } catch (error) {
            console.error(
                "Failed to save notifications:",
                error
            );
        }
    }, [notifications]);

    // Add a notification
    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now(),
            read: false,
            createdAt: new Date().toISOString(),
            ...notification,
        };

        setNotifications((previousNotifications) => [
            newNotification,
            ...previousNotifications,
        ]);
    };

    // Mark one notification as read
    const markAsRead = (notificationId) => {
        setNotifications((previousNotifications) =>
            previousNotifications.map((notification) =>
                notification.id === notificationId
                    ? {
                          ...notification,
                          read: true,
                      }
                    : notification
            )
        );
    };

    // Mark all notifications for one employee as read
    const markAllAsRead = (employeeCode) => {
        setNotifications((previousNotifications) =>
            previousNotifications.map((notification) =>
                notification.employeeCode === employeeCode
                    ? {
                          ...notification,
                          read: true,
                      }
                    : notification
            )
        );
    };

    // Delete one notification
    const deleteNotification = (notificationId) => {
        setNotifications((previousNotifications) =>
            previousNotifications.filter(
                (notification) =>
                    notification.id !== notificationId
            )
        );
    };

    // Delete all notifications for one employee
    const clearNotifications = (employeeCode) => {
        setNotifications((previousNotifications) =>
            previousNotifications.filter(
                (notification) =>
                    notification.employeeCode !== employeeCode
            )
        );
    };

    // Get notifications belonging to one employee
    const getUserNotifications = (employeeCode) => {
        return notifications.filter(
            (notification) =>
                notification.employeeCode === employeeCode
        );
    };

    // Get unread notifications for one employee
    const getUnreadCount = (employeeCode) => {
        return notifications.filter(
            (notification) =>
                notification.employeeCode === employeeCode &&
                !notification.read
        ).length;
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearNotifications,
                getUserNotifications,
                getUnreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );
    }

    return context;
};