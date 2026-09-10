// src/pages/Dashboard.jsx

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { apiGet } from "../services/api";
import { motion } from "framer-motion";

import {
    Users,
    ClipboardCheck,
    ListTodo,
    Clock,
    TrendingUp,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    Timer,
    CircleDot,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ==================================================
// HELPERS
// ==================================================

const getLocalDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// ==================================================

const convertHoursToMinutes = (
    hoursString
) => {
    if (
        !hoursString ||
        typeof hoursString !== "string"
    ) {
        return 0;
    }

    const hoursMatch =
        hoursString.match(
            /(\d+)\s*h/i
        );

    const minutesMatch =
        hoursString.match(
            /(\d+)\s*m/i
        );

    const hours = hoursMatch
        ? Number(hoursMatch[1])
        : 0;

    const minutes = minutesMatch
        ? Number(minutesMatch[1])
        : 0;

    return (
        hours * 60 +
        minutes
    );
};

// ==================================================

const formatWorkingHours = (
    totalMinutes
) => {
    if (
        !totalMinutes ||
        totalMinutes < 0
    ) {
        return "0h 0m";
    }

    const hours = Math.floor(
        totalMinutes / 60
    );

    const minutes =
        totalMinutes % 60;

    return `${hours}h ${minutes}m`;
};

// ==================================================
// ANIMATION VARIANTS
// ==================================================

const containerVariants = {
    hidden: {},

    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },

    show: {
        opacity: 1,
        y: 0,

        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

// ==================================================
// DASHBOARD
// ==================================================

function Dashboard() {

    // ==================================================
    // DASHBOARD STATE
    // ==================================================

    const [
        dashboardData,
        setDashboardData,
    ] = useState({
        summary: null,
        weeklyHours: [],
        employeeActivity: [],
    });

    const [
        dashboardLoading,
        setDashboardLoading,
    ] = useState(true);

    const [
        dashboardError,
        setDashboardError,
    ] = useState("");

    // ==================================================
    // CURRENT EMPLOYEE
    // ==================================================

    const [
        currentEmployee,
        setCurrentEmployee,
    ] = useState(null);

    useEffect(() => {

        try {

            const storedEmployee =
                localStorage.getItem(
                    "workpulse_current_employee"
                );

            if (storedEmployee) {

                setCurrentEmployee(
                    JSON.parse(
                        storedEmployee
                    )
                );

            }

        } catch (error) {

            setCurrentEmployee(null);
        }

    }, []);

    // ==================================================
    // FETCH DASHBOARD DATA
    // ==================================================

    const fetchDashboardData =
        useCallback(async () => {

            try {

                setDashboardError("");

                const [
                    summary,
                    weeklyHours,
                    employeeActivity,
                ] = await Promise.all([
                    apiGet("/dashboard/summary"),
                    apiGet("/dashboard/weekly-hours"),
                    apiGet("/dashboard/employee-activity"),
                ]);

                setDashboardData({
                    summary:
                        summary || null,

                    weeklyHours:
                        Array.isArray(
                            weeklyHours
                        )
                            ? weeklyHours
                            : [],

                    employeeActivity:
                        Array.isArray(
                            employeeActivity
                        )
                            ? employeeActivity
                            : [],
                });

            } catch (error) {

                setDashboardError(
                    error?.message ||
                    "Unable to load dashboard data."
                );

            } finally {

                setDashboardLoading(
                    false
                );
            }

        }, []);

    // ==================================================
    // INITIAL LOAD + AUTO REFRESH
    // ==================================================

    useEffect(() => {

        fetchDashboardData();

        const interval =
            setInterval(() => {

                fetchDashboardData();

            }, 30000);

        return () => {

            clearInterval(interval);

        };

    }, [fetchDashboardData]);

    // ==================================================
    // MANUAL REFRESH
    // ==================================================

    const handleRefresh =
        useCallback(async () => {

            setDashboardLoading(true);

            await fetchDashboardData();

        }, [
            fetchDashboardData,
        ]);

    // ==================================================
    // CURRENT DATE
    // ==================================================

    const currentDate =
        new Date();

    const today =
        getLocalDate();

    const formattedToday =
        currentDate.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            }
        );

    // ==================================================
    // SUMMARY DATA
    // ==================================================

    const summary =
        dashboardData.summary || {};

    const activeEmployees =
        Number(
            summary.activeEmployees || 0
        );

    const eodSubmitted =
        Number(
            summary.eodSubmitted || 0
        );

    const summaryTasksCompleted =
        Number(
            summary.tasksCompleted || 0
        );

    const summaryTasksInProgress =
        Number(
            summary.tasksInProgress || 0
        );

    const summaryTasksPending =
        Number(
            summary.tasksPending || 0
        );

    const summaryTasksBlocked =
        Number(
            summary.tasksBlocked || 0
        );

    const weeklyWorkingHours =
        summary.workingHours ||
        formatWorkingHours(
            dashboardData.weeklyHours.reduce(
                (total, item) =>
                    total +
                    (
                        typeof item.workingMinutes === "number"
                            ? item.workingMinutes
                            : convertHoursToMinutes(
                                item.workingHours
                            )
                    ),
                0
            )
        );

    // ==================================================
    // WEEKLY CHART DATA
    // ==================================================

    const weeklyChartData =
        useMemo(() => {

            if (
                !Array.isArray(
                    dashboardData.weeklyHours
                )
            ) {
                return [];
            }

            return dashboardData.weeklyHours.map(
                (item) => {

                    let hours = 0;

                    if (
                        typeof item.workingMinutes ===
                        "number"
                    ) {

                        hours =
                            item.workingMinutes /
                            60;

                    } else {

                        hours =
                            convertHoursToMinutes(
                                item.workingHours
                            ) / 60;

                    }

                    return {
                        day:
                            item.day ||
                            "",

                        hours: Number(
                            hours.toFixed(2)
                        ),
                    };
                }
            );

        }, [
            dashboardData.weeklyHours,
        ]);

    // ==================================================
    // TODAY'S EMPLOYEE ACTIVITY
    // ==================================================

    const todayReports =
        useMemo(() => {

            if (
                !Array.isArray(
                    dashboardData.employeeActivity
                )
            ) {
                return [];
            }

            return dashboardData.employeeActivity;

        }, [
            dashboardData.employeeActivity,
        ]);

    // ==================================================
    // TODAY'S REPORT COUNT
    // ==================================================

    const todayReportCount =
        todayReports.filter(
            (employee) =>
                employee.status ===
                "Submitted"
        ).length;

    // ==================================================
    // TASK STATISTICS
    // ==================================================

    const tasksCompleted =
        summaryTasksCompleted;

    const tasksInProgress =
        summaryTasksInProgress;

    const tasksPending =
        summaryTasksPending;

    const tasksBlocked =
        summaryTasksBlocked;

    const totalTasks =
        tasksCompleted +
        tasksInProgress +
        tasksPending +
        tasksBlocked;

    const completionPercentage =
        totalTasks > 0
            ? Math.round(
                (
                    tasksCompleted /
                    totalTasks
                ) * 100
            )
            : 0;

    // ==================================================
    // TODAY'S WORKING HOURS
    // ==================================================

    const totalWorkingMinutes =
        useMemo(() => {

            return todayReports.reduce(
                (
                    total,
                    employee
                ) => {

                    if (
                        employee.status !==
                        "Submitted"
                    ) {
                        return total;
                    }

                    return (
                        total +
                        convertHoursToMinutes(
                            employee.workingHours
                        )
                    );

                },
                0
            );

        }, [todayReports]);

    const totalWorkingHours =
        formatWorkingHours(
            totalWorkingMinutes
        );

    // ==================================================
    // STATISTICS
    // ==================================================

    const statistics = [

        {
            title:
                "Active Employees",

            value:
                activeEmployees,

            description:
                "Currently active",

            icon:
                Users,
        },

        {
            title:
                "EOD Submitted",

            value:
                eodSubmitted,

            description:
                "Reports submitted today",

            icon:
                ClipboardCheck,
        },

        {
            title:
                "Tasks Completed",

            value:
                tasksCompleted,

            description:
                "Completed today",

            icon:
                ListTodo,
        },

        {
            title:
                "Working Hours",

            value:
                weeklyWorkingHours,

            description:
                "Total this week",

            icon:
                Clock,
        },

    ];

    // ==================================================
    // TASK STATUS
    // ==================================================

    const taskStatuses = [

        {
            label:
                "Completed",

            value:
                tasksCompleted,

            icon:
                CheckCircle2,

            percentage:
                totalTasks > 0
                    ? Math.round(
                        (
                            tasksCompleted /
                            totalTasks
                        ) * 100
                    )
                    : 0,
        },

        {
            label:
                "In Progress",

            value:
                tasksInProgress,

            icon:
                Timer,

            percentage:
                totalTasks > 0
                    ? Math.round(
                        (
                            tasksInProgress /
                            totalTasks
                        ) * 100
                    )
                    : 0,
        },

        {
            label:
                "Pending",

            value:
                tasksPending,

            icon:
                CircleDot,

            percentage:
                totalTasks > 0
                    ? Math.round(
                        (
                            tasksPending /
                            totalTasks
                        ) * 100
                    )
                    : 0,
        },

        {
            label:
                "Blocked",

            value:
                tasksBlocked,

            icon:
                AlertCircle,

            percentage:
                totalTasks > 0
                    ? Math.round(
                        (
                            tasksBlocked /
                            totalTasks
                        ) * 100
                    )
                    : 0,
        },

    ];

    // ==================================================
    // LOADING SCREEN
    // ==================================================

    if (
        dashboardLoading &&
        !dashboardData.summary
    ) {

        return (

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4EFFA] px-4">

                <div className="pointer-events-none absolute inset-0 overflow-hidden">

                    <motion.div
                        animate={{
                            x: [
                                0,
                                30,
                                0,
                            ],

                            y: [
                                0,
                                -20,
                                0,
                            ],
                        }}

                        transition={{
                            duration: 8,
                            repeat:
                                Infinity,
                            ease:
                                "easeInOut",
                        }}

                        className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#C8B1E4]/30 blur-3xl"
                    />

                    <motion.div
                        animate={{
                            x: [
                                0,
                                -20,
                                0,
                            ],

                            y: [
                                0,
                                20,
                                0,
                            ],
                        }}

                        transition={{
                            duration: 10,
                            repeat:
                                Infinity,
                            ease:
                                "easeInOut",
                        }}

                        className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#9B72CF]/10 blur-3xl"
                    />

                </div>

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.95,
                    }}

                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}

                    className="relative w-full max-w-md rounded-[28px] border border-[#C8B1E4]/40 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(47,24,75,0.10)] backdrop-blur-xl"
                >

                    <motion.div
                        animate={{
                            rotate: 360,
                        }}

                        transition={{
                            duration: 1,
                            repeat:
                                Infinity,
                            ease:
                                "linear",
                        }}

                        className="mx-auto h-12 w-12 rounded-full border-4 border-[#C8B1E4]/40 border-t-[#532B88]"
                    />

                    <h2 className="mt-5 text-lg font-bold text-[#2F184B]">
                        Loading Dashboard
                    </h2>

                    <p className="mt-2 text-sm text-[#806F8F]">
                        Fetching the latest
                        dashboard data...
                    </p>

                </motion.div>

            </main>
        );
    }

    // ==================================================
    // COMPLETE ERROR SCREEN
    // ==================================================

    if (
        dashboardError &&
        !dashboardData.summary
    ) {

        return (

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4EFFA] px-4">

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.95,
                    }}

                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}

                    className="relative w-full max-w-md rounded-[28px] border border-[#C8B1E4]/40 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(47,24,75,0.10)] backdrop-blur-xl"
                >

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#532B88]">

                        <AlertCircle
                            size={28}
                        />

                    </div>

                    <h2 className="mt-5 text-lg font-bold text-[#2F184B]">
                        Unable to load Dashboard
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#806F8F]">
                        We couldn't connect to
                        the WorkPulse backend.
                        Please make sure your
                        Spring Boot server is
                        running.
                    </p>

                    <p className="mt-3 rounded-xl bg-[#F4EFFA] px-4 py-3 text-xs text-[#69577A]">
                        {dashboardError}
                    </p>

                    <motion.button
                        whileHover={{
                            scale: 1.02,
                        }}

                        whileTap={{
                            scale: 0.98,
                        }}

                        onClick={
                            handleRefresh
                        }

                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#532B88]/20 transition hover:bg-[#2F184B]"
                    >

                        <RefreshCw
                            size={17}
                        />

                        Retry

                    </motion.button>

                </motion.div>

            </main>
        );
    }

    // ==================================================
    // DASHBOARD UI
    // ==================================================

    return (

        <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* ==================================================
                AMBIENT BACKGROUND
            ================================================== */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">

                <motion.div
                    animate={{
                        x: [
                            0,
                            30,
                            0,
                        ],

                        y: [
                            0,
                            -20,
                            0,
                        ],
                    }}

                    transition={{
                        duration: 10,
                        repeat:
                            Infinity,
                        ease:
                            "easeInOut",
                    }}

                    className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#C8B1E4]/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [
                            0,
                            -20,
                            0,
                        ],

                        y: [
                            0,
                            20,
                            0,
                        ],
                    }}

                    transition={{
                        duration: 12,
                        repeat:
                            Infinity,
                        ease:
                            "easeInOut",
                    }}

                    className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#9B72CF]/10 blur-3xl"
                />

            </div>

            <div className="relative mx-auto max-w-7xl">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <motion.div
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

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#532B88] text-white shadow-sm">

                                    <CalendarDays
                                        size={16}
                                    />

                                </div>

                                <span className="text-sm font-medium text-[#806F8F]">
                                    {formattedToday}
                                </span>

                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-[#2F184B] sm:text-4xl">

                                Good day,{" "}

                                {
                                    currentEmployee?.name ||
                                    "Employee"
                                }

                                {" "}👋

                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#69577A] sm:text-base">
                                Here's what's happening
                                across your workplace
                                today.
                            </p>

                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                            {/* REFRESH */}

                            <motion.button
                                whileHover={{
                                    y: -2,
                                    scale: 1.02,
                                }}

                                whileTap={{
                                    scale: 0.97,
                                }}

                                onClick={
                                    handleRefresh
                                }

                                disabled={
                                    dashboardLoading
                                }

                                className="flex items-center justify-center gap-2 rounded-xl border border-[#C8B1E4]/50 bg-white/70 px-4 py-3 text-sm font-semibold text-[#532B88] shadow-[0_10px_35px_rgba(47,24,75,0.06)] backdrop-blur-xl transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                <motion.span
                                    animate={
                                        dashboardLoading
                                            ? {
                                                rotate: 360,
                                            }
                                            : {
                                                rotate: 0,
                                            }
                                    }

                                    transition={{
                                        duration: 0.8,

                                        repeat:
                                            dashboardLoading
                                                ? Infinity
                                                : 0,

                                        ease:
                                            "linear",
                                    }}
                                >

                                    <RefreshCw
                                        size={17}
                                    />

                                </motion.span>

                                Refresh

                            </motion.button>

                            {/* WEEKLY HOURS */}

                            <motion.div
                                whileHover={{
                                    y: -3,
                                    scale: 1.01,
                                }}

                                className="flex items-center gap-4 rounded-2xl border border-[#C8B1E4]/50 bg-white/70 px-5 py-4 shadow-[0_10px_35px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                            >

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">

                                    <TrendingUp
                                        size={21}
                                    />

                                </div>

                                <div>

                                    <p className="text-xs font-medium text-[#806F8F]">
                                        This week's hours
                                    </p>

                                    <p className="mt-0.5 text-xl font-bold text-[#2F184B]">
                                        {
                                            weeklyWorkingHours
                                        }
                                    </p>

                                </div>

                                <ArrowUpRight
                                    size={18}
                                    className="text-[#9B72CF]"
                                />

                            </motion.div>

                        </div>

                    </div>

                </motion.div>

                {/* ==================================================
                    PARTIAL ERROR
                ================================================== */}

                {dashboardError && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -10,
                        }}

                        animate={{
                            opacity: 1,
                            y: 0,
                        }}

                        className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#C8B1E4]/40 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
                    >

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">

                                <AlertCircle
                                    size={18}
                                />

                            </div>

                            <div>

                                <p className="text-sm font-semibold text-[#2F184B]">
                                    Some dashboard data
                                    couldn't be refreshed
                                </p>

                                <p className="text-xs text-[#806F8F]">
                                    Showing the latest
                                    available data.
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={
                                handleRefresh
                            }

                            className="rounded-xl bg-[#532B88] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2F184B]"
                        >
                            Try Again
                        </button>

                    </motion.div>
                )}

                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <motion.div
                    variants={
                        containerVariants
                    }

                    initial="hidden"

                    animate="show"

                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >

                    {statistics.map(
                        (stat) => {

                            const Icon =
                                stat.icon;

                            return (

                                <motion.div
                                    key={
                                        stat.title
                                    }

                                    variants={
                                        itemVariants
                                    }

                                    whileHover={{
                                        y: -5,

                                        transition: {
                                            duration: 0.2,
                                        },
                                    }}

                                    className="group relative overflow-hidden rounded-[22px] border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl"
                                >

                                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#C8B1E4]/20 blur-2xl transition-all duration-500 group-hover:bg-[#9B72CF]/20" />

                                    <div className="relative flex items-start justify-between">

                                        <div>

                                            <p className="text-sm font-medium text-[#806F8F]">
                                                {
                                                    stat.title
                                                }
                                            </p>

                                            <motion.p
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}

                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}

                                                transition={{
                                                    delay: 0.3,
                                                }}

                                                className="mt-2 text-3xl font-bold tracking-tight text-[#2F184B]"
                                            >
                                                {
                                                    stat.value
                                                }
                                            </motion.p>

                                            <p className="mt-2 text-xs text-[#9B72CF]">
                                                {
                                                    stat.description
                                                }
                                            </p>

                                        </div>

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88] transition-all duration-300 group-hover:bg-[#532B88] group-hover:text-white">

                                            <Icon
                                                size={21}
                                            />

                                        </div>

                                    </div>

                                </motion.div>
                            );
                        }
                    )}

                </motion.div>

                {/* ==================================================
                    MAIN GRID
                ================================================== */}

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.618fr_1fr]">

                    {/* ==================================================
                        WEEKLY CHART
                    ================================================== */}

                    <motion.section
                        initial={{
                            opacity: 0,
                            y: 25,
                        }}

                        animate={{
                            opacity: 1,
                            y: 0,
                        }}

                        transition={{
                            duration: 0.5,
                            delay: 0.25,
                        }}

                        className="rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl sm:p-6"
                    >

                        <div className="mb-6 flex items-start justify-between">

                            <div>

                                <div className="flex items-center gap-2">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">

                                        <Clock
                                            size={18}
                                        />

                                    </div>

                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        Working Hours
                                    </h2>

                                </div>

                                <p className="mt-2 text-sm text-[#806F8F]">
                                    Weekly activity from
                                    Monday to Sunday
                                </p>

                            </div>

                            <div className="hidden rounded-xl bg-[#F4EFFA] px-3 py-2 text-right sm:block">

                                <p className="text-[10px] font-medium uppercase tracking-wider text-[#806F8F]">
                                    Total
                                </p>

                                <p className="text-sm font-bold text-[#532B88]">
                                    {
                                        weeklyWorkingHours
                                    }
                                </p>

                            </div>

                        </div>

                        <div className="h-72 w-full">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={
                                        weeklyChartData
                                    }

                                    margin={{
                                        top: 10,
                                        right: 5,
                                        left: -15,
                                        bottom: 0,
                                    }}

                                    barCategoryGap="25%"
                                >

                                    <CartesianGrid
                                        strokeDasharray="4 4"
                                        vertical={false}
                                        stroke="#E8DFF0"
                                    />

                                    <XAxis
                                        dataKey="day"

                                        tick={{
                                            fontSize: 12,
                                            fill: "#806F8F",
                                        }}

                                        axisLine={false}

                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize: 11,
                                            fill: "#806F8F",
                                        }}

                                        axisLine={false}

                                        tickLine={false}
                                    />

                                    <Tooltip
                                        cursor={{
                                            fill: "#F4EFFA",
                                        }}

                                        contentStyle={{
                                            borderRadius:
                                                "14px",

                                            border:
                                                "1px solid #C8B1E4",

                                            boxShadow:
                                                "0 10px 30px rgba(47,24,75,0.12)",
                                        }}

                                        formatter={(
                                            value
                                        ) => [
                                                `${value} hours`,
                                                "Working Hours",
                                            ]}
                                    />

                                    <Bar
                                        dataKey="hours"

                                        name="Working Hours"

                                        fill="#9B72CF"

                                        radius={[
                                            8,
                                            8,
                                            2,
                                            2,
                                        ]}

                                        maxBarSize={
                                            42
                                        }
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </motion.section>

                    {/* ==================================================
                        TASK OVERVIEW
                    ================================================== */}

                    <motion.section
                        initial={{
                            opacity: 0,
                            y: 25,
                        }}

                        animate={{
                            opacity: 1,
                            y: 0,
                        }}

                        transition={{
                            duration: 0.5,
                            delay: 0.35,
                        }}

                        className="rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl sm:p-6"
                    >

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">

                                    <ListTodo
                                        size={18}
                                    />

                                </div>

                                <h2 className="text-lg font-bold text-[#2F184B]">
                                    Task Overview
                                </h2>

                            </div>

                            <p className="mt-2 text-sm text-[#806F8F]">
                                Today's productivity
                            </p>

                        </div>

                        <div className="my-7 flex justify-center">

                            <div className="relative flex h-40 w-40 items-center justify-center">

                                <svg
                                    className="absolute h-full w-full -rotate-90"
                                    viewBox="0 0 160 160"
                                >

                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="67"
                                        fill="none"
                                        stroke="#F4EFFA"
                                        strokeWidth="12"
                                    />

                                    <motion.circle
                                        cx="80"
                                        cy="80"
                                        r="67"
                                        fill="none"
                                        stroke="#532B88"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeDasharray="421"

                                        initial={{
                                            strokeDashoffset:
                                                421,
                                        }}

                                        animate={{
                                            strokeDashoffset:
                                                421 -
                                                (
                                                    421 *
                                                    completionPercentage
                                                ) /
                                                100,
                                        }}

                                        transition={{
                                            duration: 1,
                                            ease:
                                                "easeOut",
                                        }}
                                    />

                                </svg>

                                <div className="relative text-center">

                                    <p className="text-3xl font-bold text-[#2F184B]">
                                        {
                                            completionPercentage
                                        }%
                                    </p>

                                    <p className="text-xs text-[#806F8F]">
                                        completed
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="space-y-3">

                            {taskStatuses.map(
                                (status) => {

                                    const Icon =
                                        status.icon;

                                    return (

                                        <div
                                            key={
                                                status.label
                                            }

                                            className="flex items-center gap-3 rounded-xl bg-[#F4EFFA]/70 px-3 py-3"
                                        >

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#532B88]">

                                                <Icon
                                                    size={17}
                                                />

                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <div className="flex items-center justify-between">

                                                    <p className="text-sm font-medium text-[#2F184B]">
                                                        {
                                                            status.label
                                                        }
                                                    </p>

                                                    <p className="text-sm font-bold text-[#532B88]">
                                                        {
                                                            status.value
                                                        }
                                                    </p>

                                                </div>

                                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#C8B1E4]/40">

                                                    <motion.div
                                                        initial={{
                                                            width: 0,
                                                        }}

                                                        animate={{
                                                            width: `${status.percentage}%`,
                                                        }}

                                                        transition={{
                                                            duration: 0.7,
                                                        }}

                                                        className="h-full rounded-full bg-[#9B72CF]"
                                                    />

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </motion.section>

                </div>

                {/* ==================================================
                    EMPLOYEE ACTIVITY
                ================================================== */}

                <motion.section
                    initial={{
                        opacity: 0,
                        y: 25,
                    }}

                    animate={{
                        opacity: 1,
                        y: 0,
                    }}

                    transition={{
                        duration: 0.5,
                        delay: 0.45,
                    }}

                    className="mt-6 overflow-hidden rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl"
                >

                    <div className="flex flex-col gap-4 border-b border-[#C8B1E4]/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">

                                    <Users
                                        size={18}
                                    />

                                </div>

                                <h2 className="text-lg font-bold text-[#2F184B]">
                                    Employee Activity
                                </h2>

                            </div>

                            <p className="mt-2 text-sm text-[#806F8F]">
                                Today's employee EOD
                                activity
                            </p>

                        </div>

                        <div className="flex w-fit items-center gap-2 rounded-full bg-[#F4EFFA] px-3 py-2">

                            <span className="h-2 w-2 rounded-full bg-[#9B72CF]" />

                            <span className="text-xs font-medium text-[#532B88]">

                                {
                                    todayReportCount
                                }{" "}

                                reports today

                            </span>

                        </div>

                    </div>

                    {todayReports.length ===
                        0 ? (

                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                            <motion.div
                                animate={{
                                    y: [
                                        0,
                                        -6,
                                        0,
                                    ],
                                }}

                                transition={{
                                    duration: 2.5,
                                    repeat:
                                        Infinity,
                                    ease:
                                        "easeInOut",
                                }}

                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#9B72CF]"
                            >

                                <ClipboardCheck
                                    size={28}
                                />

                            </motion.div>

                            <h3 className="mt-5 text-base font-bold text-[#2F184B]">
                                No employee data yet
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-[#806F8F]">
                                Employee EOD activity
                                will appear here
                                once employees
                                submit their reports.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[850px]">

                                <thead>

                                    <tr className="border-b border-[#C8B1E4]/30 bg-[#F4EFFA]/60 text-left">

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                            Employee
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                            Department
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                            Time In
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                            Time Out
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                            Hours
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {todayReports.map(
                                        (
                                            employee,
                                            index
                                        ) => {

                                            const employeeStatus =
                                                employee.status ===
                                                    "Submitted"
                                                    ? "Completed"
                                                    : "Not Submitted";

                                            return (

                                                <motion.tr
                                                    key={
                                                        employee.employeeCode ||
                                                        index
                                                    }

                                                    initial={{
                                                        opacity: 0,
                                                        x: -10,
                                                    }}

                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}

                                                    transition={{
                                                        delay:
                                                            index *
                                                            0.05,
                                                    }}

                                                    className="border-b border-[#C8B1E4]/20 last:border-0 transition-colors hover:bg-[#F4EFFA]/50"
                                                >

                                                    {/* EMPLOYEE */}

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#532B88] text-sm font-bold text-white">

                                                                {
                                                                    employee.name
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase() ||
                                                                    "?"
                                                                }

                                                            </div>

                                                            <div>

                                                                <p className="text-sm font-semibold text-[#2F184B]">
                                                                    {
                                                                        employee.name ||
                                                                        "Unknown Employee"
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-[#9B72CF]">

                                                                    {
                                                                        employeeStatus ===
                                                                            "Completed"
                                                                            ? "EOD submitted"
                                                                            : "Awaiting EOD"
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* DEPARTMENT */}

                                                    <td className="px-6 py-4 text-sm text-[#69577A]">

                                                        {
                                                            employee.department ||
                                                            "—"
                                                        }

                                                    </td>

                                                    {/* TIME IN */}

                                                    <td className="px-6 py-4">

                                                        <span className="rounded-lg bg-[#F4EFFA] px-2.5 py-1.5 text-xs font-medium text-[#532B88]">

                                                            {
                                                                employee.timeIn ||
                                                                "—"
                                                            }

                                                        </span>

                                                    </td>

                                                    {/* TIME OUT */}

                                                    <td className="px-6 py-4">

                                                        <span className="rounded-lg bg-[#F4EFFA] px-2.5 py-1.5 text-xs font-medium text-[#532B88]">

                                                            {
                                                                employee.timeOut ||
                                                                "—"
                                                            }

                                                        </span>

                                                    </td>

                                                    {/* HOURS */}

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-2 text-sm font-medium text-[#2F184B]">

                                                            <Clock
                                                                size={15}
                                                                className="text-[#9B72CF]"
                                                            />

                                                            {
                                                                employee.workingHours ||
                                                                "0h 0m"
                                                            }

                                                        </div>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${employeeStatus ===
                                                                "Completed"
                                                                ? "bg-[#532B88]/10 text-[#532B88]"
                                                                : "bg-[#9B72CF]/15 text-[#69577A]"
                                                                }`}
                                                        >

                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${employeeStatus ===
                                                                    "Completed"
                                                                    ? "bg-[#532B88]"
                                                                    : "bg-[#9B72CF]"
                                                                    }`}
                                                            />

                                                            {
                                                                employeeStatus
                                                            }

                                                        </span>

                                                    </td>

                                                </motion.tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </motion.section>

                {/* ==================================================
                    FOOTER SUMMARY
                ================================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                    }}

                    animate={{
                        opacity: 1,
                    }}

                    transition={{
                        delay: 0.7,
                    }}

                    className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#C8B1E4]/30 bg-white/50 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
                >

                    <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#532B88] text-white">

                            <TrendingUp
                                size={16}
                            />

                        </div>

                        <p className="text-sm text-[#69577A]">
                            Today's total working
                            time
                        </p>

                    </div>

                    <p className="text-lg font-bold text-[#532B88]">
                        {
                            totalWorkingHours
                        }
                    </p>

                </motion.div>

            </div>

        </main>
    );
}

export default Dashboard;
