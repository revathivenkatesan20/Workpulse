// src/pages/Notifications.jsx

import { useEffect, useMemo } from "react";
import {
    motion,
    AnimatePresence,
} from "framer-motion";

import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    ClipboardCheck,
    Info,
    AlertCircle,
    Sparkles,
    Clock3,
    Inbox,
} from "lucide-react";

import { useNotifications } from "../context/NotificationContext";

// --------------------------------------------------
// Format Date
// --------------------------------------------------

const formatNotificationDate = (date) => {
    if (!date) {
        return "Just now";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Just now";
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

// --------------------------------------------------
// Notification Icon
// --------------------------------------------------

const getNotificationIcon = (type) => {
    switch (type) {
        case "EOD_SUBMITTED":
            return ClipboardCheck;

        case "EOD_UPDATED":
            return Sparkles;

        case "REMINDER":
            return AlertCircle;

        case "INFO":
        default:
            return Info;
    }
};

// --------------------------------------------------
// Notification Label
// --------------------------------------------------

const getNotificationLabel = (type) => {
    switch (type) {
        case "EOD_SUBMITTED":
            return "EOD Submitted";

        case "EOD_UPDATED":
            return "EOD Updated";

        case "REMINDER":
            return "Reminder";

        case "INFO":
        default:
            return "WorkPulse Update";
    }
};

// --------------------------------------------------
// Notifications
// --------------------------------------------------

function Notifications() {
    const {
        notifications,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    // --------------------------------------------------
    // Current Employee
    // --------------------------------------------------

    const currentEmployee = useMemo(() => {
        try {
            return JSON.parse(
                localStorage.getItem(
                    "workpulse_current_employee"
                ) || "null"
            );
        } catch (error) {
            return null;
        }
    }, []);

    const currentEmployeeCode =
        currentEmployee?.employeeCode || "";

    // --------------------------------------------------
    // Load Notifications From Backend
    // --------------------------------------------------

    useEffect(() => {
        if (!currentEmployeeCode) {
            return;
        }

        refreshNotifications(
            currentEmployeeCode
        );
    }, [
        currentEmployeeCode,
        refreshNotifications,
    ]);

    // --------------------------------------------------
    // Employee Notifications
    // --------------------------------------------------

    const myNotifications = useMemo(() => {
        if (!currentEmployeeCode) {
            return [];
        }

        return notifications
            .filter(
                (notification) =>
                    notification.employeeCode ===
                    currentEmployeeCode
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
    }, [
        notifications,
        currentEmployeeCode,
    ]);

    // --------------------------------------------------
    // Counts
    // --------------------------------------------------

    const unreadNotifications = useMemo(
        () =>
            myNotifications.filter(
                (notification) =>
                    !notification.read
            ),
        [myNotifications]
    );

    const readNotifications = useMemo(
        () =>
            myNotifications.filter(
                (notification) =>
                    notification.read
            ),
        [myNotifications]
    );

    const totalNotifications =
        myNotifications.length;

    const unreadCount =
        unreadNotifications.length;

    const readCount =
        readNotifications.length;

    // --------------------------------------------------
    // Mark All As Read
    // --------------------------------------------------

    const handleMarkAllAsRead = async () => {
        if (!currentEmployeeCode) {
            return;
        }

        await markAllAsRead(
            currentEmployeeCode
        );
    };

    // --------------------------------------------------
    // Mark Single Notification
    // --------------------------------------------------

    const handleMarkAsRead = async (
        notification
    ) => {
        if (notification.read) {
            return;
        }

        await markAsRead(notification.id);
    };

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------

    const handleDelete = async (
        notificationId
    ) => {
        await deleteNotification(
            notificationId
        );
    };

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* ==========================================
                AMBIENT BACKGROUND
            ========================================== */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">

                <motion.div
                    animate={{
                        x: [0, 25, 0],
                        y: [0, -15, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#C8B1E4]/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#9B72CF]/10 blur-3xl"
                />

                <motion.div
                    animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#C8B1E4]/10 blur-3xl"
                />

            </div>

            <div className="relative mx-auto max-w-5xl">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <motion.header
                    initial={{
                        opacity: 0,
                        y: -20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.5,
                    }}
                    className="mb-8"
                >

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#532B88] text-white shadow-lg shadow-[#532B88]/20">

                                    <Bell size={18} />

                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2F184B] px-1 text-[9px] font-bold text-white ring-2 ring-[#F4EFFA]">
                                            {unreadCount >
                                            99
                                                ? "99+"
                                                : unreadCount}
                                        </span>
                                    )}

                                </div>

                                <span className="text-sm font-semibold text-[#806F8F]">
                                    Stay Updated
                                </span>

                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-[#2F184B] sm:text-4xl">
                                Notifications
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#69577A] sm:text-base">
                                Stay updated with your EOD
                                submissions, reminders, and
                                WorkPulse activities.
                            </p>

                        </div>

                        {/* Mark All */}

                        {unreadCount > 0 && (
                            <motion.button
                                whileHover={{
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.97,
                                }}
                                type="button"
                                onClick={
                                    handleMarkAllAsRead
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#532B88]/20 transition hover:bg-[#2F184B] sm:w-auto"
                            >

                                <CheckCheck
                                    size={17}
                                />

                                Mark All as Read

                            </motion.button>
                        )}

                    </div>

                </motion.header>

                {/* ==========================================
                    SUMMARY CARDS
                ========================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.1,
                    }}
                    className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
                >

                    {/* Total */}

                    <div className="rounded-2xl border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(47,24,75,0.06)] backdrop-blur-xl">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                    Total
                                </p>

                                <p className="mt-2 text-2xl font-bold text-[#2F184B]">
                                    {totalNotifications}
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                <Inbox size={20} />
                            </div>

                        </div>

                    </div>

                    {/* Unread */}

                    <div className="rounded-2xl border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(47,24,75,0.06)] backdrop-blur-xl">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                    Unread
                                </p>

                                <p className="mt-2 text-2xl font-bold text-[#532B88]">
                                    {unreadCount}
                                </p>

                            </div>

                            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#532B88] text-white">

                                <Bell size={20} />

                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#C8B1E4] ring-2 ring-white" />
                                )}

                            </div>

                        </div>

                    </div>

                    {/* Read */}

                    <div className="rounded-2xl border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(47,24,75,0.06)] backdrop-blur-xl">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                    Read
                                </p>

                                <p className="mt-2 text-2xl font-bold text-[#2F184B]">
                                    {readCount}
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                <CheckCheck
                                    size={20}
                                />
                            </div>

                        </div>

                    </div>

                </motion.div>

                {/* ==========================================
                    NOTIFICATIONS PANEL
                ========================================== */}

                <motion.section
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.2,
                    }}
                    className="overflow-hidden rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl"
                >

                    {/* Panel Header */}

                    <div className="border-b border-[#C8B1E4]/30 px-5 py-5 sm:px-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-bold text-[#2F184B]">
                                    Your Notifications
                                </h2>

                                <p className="mt-1 text-sm text-[#806F8F]">
                                    {unreadCount > 0
                                        ? `You have ${unreadCount} unread notification${
                                              unreadCount ===
                                              1
                                                  ? ""
                                                  : "s"
                                          }.`
                                        : "You're all caught up."}
                                </p>

                            </div>

                            <div className="hidden items-center gap-2 rounded-full bg-[#F4EFFA] px-3 py-1.5 sm:flex">

                                <span className="h-2 w-2 rounded-full bg-[#532B88]" />

                                <span className="text-xs font-semibold text-[#532B88]">
                                    {totalNotifications}{" "}
                                    total
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* Notification List */}

                    <div className="p-4 sm:p-6">

                        {loading ? (
                            /* LOADING STATE */

                            <motion.div
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                }}
                                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8B1E4]/60 bg-[#F4EFFA]/50 px-6 py-16 text-center"
                            >

                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#9B72CF] shadow-sm">

                                    <motion.div
                                        animate={{
                                            rotate: 360,
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    >
                                        <Bell
                                            size={28}
                                        />
                                    </motion.div>

                                </div>

                                <h3 className="text-lg font-bold text-[#2F184B]">
                                    Loading notifications...
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-[#806F8F]">
                                    Fetching your latest
                                    WorkPulse notifications.
                                </p>

                            </motion.div>
                        ) : (
                            <AnimatePresence
                                initial={false}
                                mode="popLayout"
                            >

                                {myNotifications.length ===
                                0 ? (
                                    /* EMPTY STATE */

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8B1E4]/60 bg-[#F4EFFA]/50 px-6 py-16 text-center"
                                    >

                                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#9B72CF] shadow-sm">

                                            <Bell
                                                size={28}
                                            />

                                        </div>

                                        <h3 className="text-lg font-bold text-[#2F184B]">
                                            No notifications yet
                                        </h3>

                                        <p className="mt-2 max-w-md text-sm leading-6 text-[#806F8F]">
                                            When you submit an
                                            EOD, update a
                                            report, or receive a
                                            reminder, your
                                            notifications will
                                            appear here.
                                        </p>

                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">

                                        {myNotifications.map(
                                            (
                                                notification
                                            ) => {
                                                const Icon =
                                                    getNotificationIcon(
                                                        notification.type
                                                    );

                                                const label =
                                                    getNotificationLabel(
                                                        notification.type
                                                    );

                                                return (
                                                    <motion.div
                                                        key={
                                                            notification.id
                                                        }
                                                        layout
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            height: 0,
                                                            marginTop: 0,
                                                            marginBottom: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.25,
                                                        }}
                                                        className={`group relative overflow-hidden rounded-2xl border p-4 transition sm:p-5 ${
                                                            notification.read
                                                                ? "border-[#C8B1E4]/30 bg-white"
                                                                : "border-[#9B72CF]/30 bg-[#F4EFFA]/70 shadow-sm"
                                                        }`}
                                                    >

                                                        {/* Unread indicator */}

                                                        {!notification.read && (
                                                            <div className="absolute left-0 top-0 h-full w-1 bg-[#532B88]" />
                                                        )}

                                                        <div className="flex gap-4">

                                                            {/* Icon */}

                                                            <div
                                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                                    notification.read
                                                                        ? "bg-[#F4EFFA] text-[#806F8F]"
                                                                        : "bg-[#532B88] text-white shadow-md shadow-[#532B88]/20"
                                                                }`}
                                                            >

                                                                <Icon
                                                                    size={19}
                                                                />

                                                            </div>

                                                            {/* Content */}

                                                            <div className="min-w-0 flex-1">

                                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                                                                    <div className="min-w-0">

                                                                        <div className="flex flex-wrap items-center gap-2">

                                                                            <h3 className="text-sm font-bold text-[#2F184B]">
                                                                                {notification.title ||
                                                                                    "WorkPulse Update"}
                                                                            </h3>

                                                                            {!notification.read && (
                                                                                <span className="rounded-full bg-[#532B88]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#532B88]">
                                                                                    New
                                                                                </span>
                                                                            )}

                                                                        </div>

                                                                        <div className="mt-1 flex flex-wrap items-center gap-2">

                                                                            <span className="rounded-full bg-[#F4EFFA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                                                                {label}
                                                                            </span>

                                                                            <span className="flex items-center gap-1 text-[11px] text-[#806F8F]">

                                                                                <Clock3
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                />

                                                                                {formatNotificationDate(
                                                                                    notification.createdAt
                                                                                )}

                                                                            </span>

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                                <p className="mt-3 text-sm leading-6 text-[#69577A]">
                                                                    {notification.message ||
                                                                        "No additional information available."}
                                                                </p>

                                                                {/* Actions */}

                                                                <div className="mt-4 flex flex-wrap items-center gap-2">

                                                                    {!notification.read && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleMarkAsRead(
                                                                                    notification
                                                                                )
                                                                            }
                                                                            className="flex items-center gap-1.5 rounded-lg bg-[#F4EFFA] px-3 py-2 text-xs font-semibold text-[#532B88] transition hover:bg-[#532B88] hover:text-white"
                                                                        >

                                                                            <Check
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />

                                                                            Mark Read

                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                notification.id
                                                                            )
                                                                        }
                                                                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#806F8F] transition hover:bg-[#532B88]/10 hover:text-[#532B88]"
                                                                    >

                                                                        <Trash2
                                                                            size={
                                                                                14
                                                                            }
                                                                        />

                                                                        Delete

                                                                    </button>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </motion.div>
                                                );
                                            }
                                        )}

                                    </div>
                                )}

                            </AnimatePresence>
                        )}

                    </div>

                </motion.section>

                {/* ==========================================
                    FOOTER
                ========================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        delay: 0.4,
                    }}
                    className="mt-5 flex items-center justify-center gap-2 text-xs text-[#806F8F]"
                >

                    <Bell size={13} />

                    <span>
                        WorkPulse keeps you informed about
                        your daily activity.
                    </span>

                </motion.div>

            </div>
        </main>
    );
}

export default Notifications;
