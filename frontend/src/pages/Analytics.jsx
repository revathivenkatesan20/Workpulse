// src/pages/Analytics.jsx

import { useState } from "react";
import { motion } from "framer-motion";

import { useEOD } from "../context/EODContext";

import {
    BarChart3,
    Clock,
    CheckCircle2,
    ClipboardCheck,
    CalendarDays,
    TrendingUp,
    Users,
    Sparkles,
    AlertCircle,
    RefreshCw,
    Search,
} from "lucide-react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

/* --------------------------------
   DATE HELPERS
--------------------------------- */

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date) => {
    const result = new Date(date);
    const day = result.getDay();

    result.setDate(
        result.getDate() - (day === 0 ? 6 : day - 1)
    );

    result.setHours(0, 0, 0, 0);

    return result;
};

const getEndOfWeek = (date) => {
    const monday = getStartOfWeek(date);
    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return sunday;
};

const getDaysBetween = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);

    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
};

/* --------------------------------
   WORKING HOURS HELPERS
--------------------------------- */

const convertHoursToMinutes = (hoursString) => {
    if (!hoursString) {
        return 0;
    }

    if (typeof hoursString === "number") {
        return Math.round(hoursString * 60);
    }

    const value = String(hoursString);

    const hoursMatch = value.match(
        /(\d+(?:\.\d+)?)\s*h/i
    );

    const minutesMatch = value.match(
        /(\d+)\s*m/i
    );

    const hours = hoursMatch
        ? Number(hoursMatch[1])
        : 0;

    const minutes = minutesMatch
        ? Number(minutesMatch[1])
        : 0;

    return Math.round(hours * 60 + minutes);
};

const getReportMinutes = (report) => {
    return convertHoursToMinutes(
        report?.totalWorkingHours ||
        report?.workingHours ||
        ""
    );
};

const formatHours = (minutes) => {
    const safeMinutes = Math.max(
        0,
        Number(minutes) || 0
    );

    const hours = Math.floor(safeMinutes / 60);
    const remainingMinutes = safeMinutes % 60;

    return `${hours}h ${remainingMinutes}m`;
};

/* --------------------------------
   CHART COLORS
--------------------------------- */

const chartColors = [
    "#532B88",
    "#9B72CF",
    "#C8B1E4",
    "#2F184B",
];

/* --------------------------------
   CUSTOM TOOLTIP
--------------------------------- */

const CustomTooltip = ({
    active,
    payload,
    label,
}) => {
    if (
        !active ||
        !payload ||
        payload.length === 0
    ) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-[#C8B1E4]/50 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl">
            {label && (
                <p className="mb-1 text-xs font-semibold text-[#806F8F]">
                    {label}
                </p>
            )}

            {payload.map((item, index) => (
                <div
                    key={`${item.dataKey}-${index}`}
                    className="flex items-center justify-between gap-5"
                >
                    <span className="text-sm font-medium text-[#2F184B]">
                        {item.name || "Value"}
                    </span>

                    <span className="text-sm font-bold text-[#532B88]">
                        {item.value}h
                    </span>
                </div>
            ))}
        </div>
    );
};

/* --------------------------------
   ANALYTICS
--------------------------------- */

function Analytics() {
    const {
        eodReports = [],
        loading,
        error,
        refreshEODReports,
        refreshing = false,
    } = useEOD();

    const [selectedPeriod, setSelectedPeriod] =
        useState("week");

    const [employeeSearch, setEmployeeSearch] = useState("");

    /* --------------------------------
       INITIAL LOADING
    --------------------------------- */

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F4EFFA] px-4">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#532B88] text-white shadow-xl shadow-[#532B88]/20">
                        <RefreshCw
                            size={28}
                            className="animate-spin"
                        />
                    </div>

                    <h2 className="text-xl font-bold text-[#2F184B]">
                        Loading Analytics
                    </h2>

                    <p className="mt-2 text-sm text-[#806F8F]">
                        Fetching the latest EOD reports...
                    </p>
                </div>
            </main>
        );
    }

    const today = new Date();

    /* --------------------------------
       DATE RANGE
    --------------------------------- */

    const getDateRange = () => {
        const now = new Date();

        if (selectedPeriod === "today") {
            const todayString = formatDate(now);

            return {
                start: todayString,
                end: todayString,
            };
        }

        if (selectedPeriod === "month") {
            const start = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

            const end = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            );

            return {
                start: formatDate(start),
                end: formatDate(end),
            };
        }

        const monday = getStartOfWeek(now);
        const sunday = getEndOfWeek(now);

        return {
            start: formatDate(monday),
            end: formatDate(sunday),
        };
    };

    const { start, end } = getDateRange();

    /* --------------------------------
       FILTER REPORTS
    --------------------------------- */

    const filteredReports = eodReports.filter(
        (report) =>
            report?.date >= start &&
            report?.date <= end
    );

    /* --------------------------------
       PERIOD DATES
    --------------------------------- */

    const startDate = new Date(
        `${start}T00:00:00`
    );

    const endDate = new Date(
        `${end}T00:00:00`
    );

    const periodDates = getDaysBetween(
        startDate,
        endDate
    );

    /* --------------------------------
       PERIOD WORKING HOURS
    --------------------------------- */

    const periodHoursData = periodDates.map(
        (date) => {
            const dateString = formatDate(date);

            const reports = eodReports.filter(
                (report) =>
                    report?.date === dateString
            );

            const totalMinutes = reports.reduce(
                (total, report) =>
                    total +
                    getReportMinutes(report),
                0
            );

            let label = "";

            if (
                selectedPeriod === "today"
            ) {
                label = date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short",
                    }
                );
            } else if (
                selectedPeriod === "week"
            ) {
                label = date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short",
                    }
                );
            } else {
                label = date.toLocaleDateString(
                    "en-US",
                    {
                        day: "numeric",
                    }
                );
            }

            return {
                day: label,
                hours: Number(
                    (
                        totalMinutes / 60
                    ).toFixed(2)
                ),
            };
        }
    );

    /* --------------------------------
       TASK STATUS
    --------------------------------- */

    const taskStatusCounts = {
        Completed: 0,
        "In Progress": 0,
        Pending: 0,
        Blocked: 0,
    };

    filteredReports.forEach((report) => {
        const tasks = Array.isArray(
            report?.tasks
        )
            ? report.tasks
            : [];

        tasks.forEach((task) => {
            if (
                taskStatusCounts[
                task?.status
                ] !== undefined
            ) {
                taskStatusCounts[
                    task.status
                ]++;
            }
        });
    });

    const taskStatusData = Object.entries(
        taskStatusCounts
    )
        .map(([name, value]) => ({
            name,
            value,
        }))
        .filter(
            (item) => item.value > 0
        );

    /* --------------------------------
       EMPLOYEE HOURS
    --------------------------------- */

    const employeeHoursMap = {};

    filteredReports.forEach((report) => {
        const employeeCode =
            report?.employeeCode || "UNKNOWN";

        const employeeName =
            report?.employeeName ||
            employeeCode;

        if (!employeeHoursMap[employeeCode]) {
            employeeHoursMap[employeeCode] = {
                code: employeeCode,
                name: employeeName,
                minutes: 0,
            };
        }

        employeeHoursMap[employeeCode].minutes +=
            getReportMinutes(report);
    });

    const employeeHoursData = Object.values(
        employeeHoursMap
    )
        .map((employee) => ({
            code: employee.code,
            name: employee.name,
            hours: Number(
                (employee.minutes / 60).toFixed(2)
            ),
        }))
        .sort((a, b) => b.hours - a.hours);

    const searchedEmployeeHours = employeeHoursData.filter(
        (employee) => {
            const search = employeeSearch
                .trim()
                .toLowerCase();

            if (!search) return true;

            return (
                employee.name
                    .toLowerCase()
                    .includes(search) ||
                employee.code
                    .toLowerCase()
                    .includes(search)
            );
        }
    );

    const employeeChartData =
        employeeSearch.trim()
            ? searchedEmployeeHours
            : employeeHoursData.slice(0, 10);

    /* --------------------------------
       SUMMARY
    --------------------------------- */

    const totalMinutes =
        filteredReports.reduce(
            (total, report) =>
                total +
                getReportMinutes(report),
            0
        );

    const completedTasks =
        taskStatusCounts.Completed;

    const totalTasks =
        Object.values(
            taskStatusCounts
        ).reduce(
            (total, count) =>
                total + count,
            0
        );

    const averageMinutes =
        filteredReports.length > 0
            ? Math.round(
                totalMinutes /
                filteredReports.length
            )
            : 0;

    const periodLabel =
        selectedPeriod === "today"
            ? "Today's"
            : selectedPeriod === "month"
                ? "This month's"
                : "This week's";

    const selectedPeriodLabel =
        selectedPeriod === "today"
            ? "Today"
            : selectedPeriod === "month"
                ? "This Month"
                : "This Week";

    const completionPercentage =
        totalTasks > 0
            ? Math.round(
                (completedTasks /
                    totalTasks) *
                100
            )
            : 0;

    /* --------------------------------
       SUMMARY CARDS
    --------------------------------- */

    const summaryCards = [
        {
            title: "Total Working Hours",
            value: formatHours(
                totalMinutes
            ),
            description: `${periodLabel} combined hours`,
            icon: Clock,
        },
        {
            title: "EOD Reports",
            value: filteredReports.length,
            description: `${periodLabel} EOD reports`,
            icon: ClipboardCheck,
        },
        {
            title: "Tasks Completed",
            value: completedTasks,
            description: `Completed ${periodLabel.toLowerCase()}`,
            icon: CheckCircle2,
        },
        {
            title: "Average Hours",
            value: formatHours(
                averageMinutes
            ),
            description: `${periodLabel} average`,
            icon: BarChart3,
        },
    ];

    /* --------------------------------
       CHART TITLE
    --------------------------------- */

    const workingChartTitle =
        selectedPeriod === "today"
            ? "Today's Working Overview"
            : selectedPeriod === "month"
                ? "Monthly Working Overview"
                : "Weekly Working Overview";

    const workingChartDescription =
        selectedPeriod === "today"
            ? "Working hours recorded today across all employees."
            : selectedPeriod === "month"
                ? "Daily working hours recorded throughout this month."
                : "Working hours recorded across the current week.";

    /* --------------------------------
       RETRY
    --------------------------------- */

    const handleRetry = async () => {
        try {
            await refreshEODReports(false);
        } catch (error) {
            return;
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

            {/* --------------------------------
                AMBIENT BACKGROUND
            --------------------------------- */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 35, 0],
                        y: [0, -25, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#9B72CF]/20 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-[#C8B1E4]/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-[#532B88]/10 blur-3xl"
                />

                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#532B88 1px, transparent 1px), linear-gradient(90deg, #532B88 1px, transparent 1px)",
                        backgroundSize:
                            "38px 38px",
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl">

                {/* --------------------------------
                    HEADER
                --------------------------------- */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: -24,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.55,
                    }}
                    className="mb-7"
                >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#532B88] text-white shadow-lg shadow-[#532B88]/20">
                                    <BarChart3
                                        size={18}
                                    />
                                </div>

                                <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#9B72CF]">
                                    Performance
                                    Insights
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-[#2F184B] sm:text-4xl">
                                    Analytics
                                </h1>

                                {refreshing && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#532B88] shadow-sm">
                                        <RefreshCw
                                            size={13}
                                            className="animate-spin"
                                        />
                                        Updating...
                                    </span>
                                )}
                            </div>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806F8F] sm:text-base">
                                Analyze employee
                                working hours,
                                task progress, and
                                EOD submissions
                                from one place.
                            </p>
                        </div>

                        {/* PERIOD SELECTOR */}

                        <div className="rounded-2xl border border-[#C8B1E4]/50 bg-white/60 p-2 shadow-lg shadow-[#532B88]/5 backdrop-blur-xl">
                            <div className="flex flex-wrap gap-1">
                                {[
                                    {
                                        value: "today",
                                        label: "Today",
                                    },
                                    {
                                        value: "week",
                                        label: "This Week",
                                    },
                                    {
                                        value: "month",
                                        label: "This Month",
                                    },
                                ].map(
                                    (period) => (
                                        <button
                                            key={
                                                period.value
                                            }
                                            type="button"
                                            onClick={() =>
                                                setSelectedPeriod(
                                                    period.value
                                                )
                                            }
                                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${selectedPeriod ===
                                                period.value
                                                ? "bg-[#532B88] text-white shadow-lg shadow-[#532B88]/20"
                                                : "text-[#69577A] hover:bg-[#F4EFFA] hover:text-[#532B88]"
                                                }`}
                                        >
                                            {
                                                period.label
                                            }
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --------------------------------
                    ERROR BANNER
                --------------------------------- */}

                {error && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-lg shadow-red-900/5 backdrop-blur-xl"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <AlertCircle
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-red-800">
                                        Unable to refresh EOD data
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-red-600">
                                        Unable to load the latest EOD analytics data.
                                    </p>

                                    {eodReports.length >
                                        0 && (
                                            <p className="mt-1 text-xs text-red-500">
                                                Showing the
                                                last available
                                                analytics data.
                                            </p>
                                        )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleRetry}
                                disabled={loading}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#532B88] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#532B88]/20 transition-all hover:bg-[#2F184B] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={15}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                                Retry
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* --------------------------------
                    PERIOD OVERVIEW
                --------------------------------- */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 18,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.15,
                    }}
                    className="mb-6 overflow-hidden rounded-3xl border border-[#C8B1E4]/50 bg-white/55 p-5 shadow-xl shadow-[#532B88]/5 backdrop-blur-xl sm:p-6"
                >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#532B88]">
                                <CalendarDays
                                    size={22}
                                />
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#9B72CF]">
                                    Selected period
                                </p>

                                <h2 className="mt-1 text-lg font-bold text-[#2F184B]">
                                    {
                                        selectedPeriodLabel
                                    }
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl bg-[#F4EFFA]/80 px-4 py-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#532B88] text-white">
                                <Sparkles
                                    size={17}
                                />
                            </div>

                            <div>
                                <p className="text-xs text-[#806F8F]">
                                    Task completion
                                </p>

                                <p className="text-sm font-bold text-[#2F184B]">
                                    {
                                        completionPercentage
                                    }
                                    % complete
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --------------------------------
                    SUMMARY CARDS
                --------------------------------- */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map(
                        (
                            card,
                            index
                        ) => {
                            const Icon =
                                card.icon;

                            return (
                                <motion.div
                                    key={
                                        card.title
                                    }
                                    initial={{
                                        opacity: 0,
                                        y: 22,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        delay:
                                            0.2 +
                                            index *
                                            0.08,
                                    }}
                                    whileHover={{
                                        y: -5,
                                        scale: 1.01,
                                    }}
                                    className="group relative overflow-hidden rounded-3xl border border-[#C8B1E4]/50 bg-white/65 p-5 shadow-lg shadow-[#532B88]/5 backdrop-blur-xl sm:p-6"
                                >
                                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#C8B1E4]/20 blur-2xl transition-transform duration-500 group-hover:scale-150" />

                                    <div className="relative flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-[#806F8F]">
                                                {
                                                    card.title
                                                }
                                            </p>

                                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#2F184B] sm:text-3xl">
                                                {
                                                    card.value
                                                }
                                            </h2>

                                            <p className="mt-2 text-xs text-[#9B72CF]">
                                                {
                                                    card.description
                                                }
                                            </p>
                                        </div>

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#532B88] transition-all duration-300 group-hover:bg-[#532B88] group-hover:text-white">
                                            <Icon
                                                size={
                                                    21
                                                }
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }
                    )}
                </div>

                {/* --------------------------------
                    CHART GRID
                --------------------------------- */}

                <div className="mt-6 grid gap-6 xl:grid-cols-2">

                    {/* WORKING HOURS */}

                    <motion.section
                        initial={{
                            opacity: 0,
                            y: 24,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.48,
                        }}
                        className="rounded-3xl border border-[#C8B1E4]/50 bg-white/65 p-5 shadow-xl shadow-[#532B88]/5 backdrop-blur-xl sm:p-6"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                        <Clock
                                            size={18}
                                        />
                                    </div>

                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        {
                                            workingChartTitle
                                        }
                                    </h2>
                                </div>

                                <p className="mt-2 text-sm text-[#806F8F]">
                                    {
                                        workingChartDescription
                                    }
                                </p>
                            </div>

                            <div className="hidden rounded-xl bg-[#F4EFFA] px-3 py-2 text-xs font-bold text-[#532B88] sm:block">
                                {selectedPeriod ===
                                    "today"
                                    ? "1 Day"
                                    : selectedPeriod ===
                                        "month"
                                        ? `${periodDates.length} Days`
                                        : "7 Days"}
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            {periodHoursData.length >
                                0 ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={
                                            periodHoursData
                                        }
                                        margin={{
                                            top: 10,
                                            right: 8,
                                            left: -18,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            stroke="#C8B1E4"
                                            strokeOpacity={
                                                0.25
                                            }
                                            vertical={
                                                false
                                            }
                                            strokeDasharray="4 4"
                                        />

                                        <XAxis
                                            dataKey="day"
                                            tick={{
                                                fill: "#806F8F",
                                                fontSize: 12,
                                            }}
                                            axisLine={
                                                false
                                            }
                                            tickLine={
                                                false
                                            }
                                            interval={
                                                selectedPeriod ===
                                                    "month"
                                                    ? "preserveStartEnd"
                                                    : 0
                                            }
                                        />

                                        <YAxis
                                            tick={{
                                                fill: "#806F8F",
                                                fontSize: 12,
                                            }}
                                            axisLine={
                                                false
                                            }
                                            tickLine={
                                                false
                                            }
                                        />

                                        <Tooltip
                                            content={
                                                <CustomTooltip />
                                            }
                                            cursor={{
                                                fill: "#F4EFFA",
                                            }}
                                        />

                                        <Bar
                                            dataKey="hours"
                                            name="Working Hours"
                                            fill="#532B88"
                                            radius={[
                                                8,
                                                8,
                                                3,
                                                3,
                                            ]}
                                            maxBarSize={
                                                selectedPeriod ===
                                                    "month"
                                                    ? 22
                                                    : 42
                                            }
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#9B72CF]">
                                        <Clock
                                            size={24}
                                        />
                                    </div>

                                    <p className="text-sm font-semibold text-[#2F184B]">
                                        No working-hour
                                        data yet
                                    </p>

                                    <p className="mt-1 text-xs text-[#9B72CF]">
                                        Submit an EOD
                                        report to see
                                        working-hour
                                        analytics.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* TASK STATUS */}

                    <motion.section
                        initial={{
                            opacity: 0,
                            y: 24,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.56,
                        }}
                        className="rounded-3xl border border-[#C8B1E4]/50 bg-white/65 p-5 shadow-xl shadow-[#532B88]/5 backdrop-blur-xl sm:p-6"
                    >
                        <div className="mb-6">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                    <CheckCircle2
                                        size={18}
                                    />
                                </div>

                                <h2 className="text-lg font-bold text-[#2F184B]">
                                    Task Status
                                </h2>
                            </div>

                            <p className="mt-2 text-sm text-[#806F8F]">
                                Breakdown of task progress
                                for the selected
                                period.
                            </p>
                        </div>

                        <div className="h-[300px] w-full">
                            {taskStatusData.length >
                                0 ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <PieChart>
                                        <Pie
                                            data={
                                                taskStatusData
                                            }
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="48%"
                                            outerRadius="68%"
                                            innerRadius="42%"
                                            paddingAngle={
                                                3
                                            }
                                            label
                                        >
                                            {taskStatusData.map(
                                                (
                                                    _,
                                                    index
                                                ) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            chartColors[
                                                            index %
                                                            chartColors.length
                                                            ]
                                                        }
                                                        stroke="#F4EFFA"
                                                        strokeWidth={
                                                            3
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>

                                        <Tooltip
                                            contentStyle={{
                                                borderRadius:
                                                    "16px",
                                                border:
                                                    "1px solid rgba(200,177,228,0.5)",
                                                background:
                                                    "rgba(255,255,255,0.96)",
                                                boxShadow:
                                                    "0 10px 30px rgba(47,24,75,0.10)",
                                            }}
                                        />

                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{
                                                fontSize:
                                                    "12px",
                                                color: "#69577A",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#9B72CF]">
                                        <ClipboardCheck
                                            size={24}
                                        />
                                    </div>

                                    <p className="text-sm font-semibold text-[#2F184B]">
                                        No task data yet
                                    </p>

                                    <p className="mt-1 text-xs text-[#9B72CF]">
                                        Submit an EOD
                                        report to see
                                        task analytics.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* EMPLOYEE HOURS */}

                    <motion.section
                        initial={{
                            opacity: 0,
                            y: 24,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.64,
                        }}
                        className="rounded-3xl border border-[#C8B1E4]/50 bg-white/65 p-5 shadow-xl shadow-[#532B88]/5 backdrop-blur-xl sm:p-6 xl:col-span-2"
                    >
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                        <Users
                                            size={18}
                                        />
                                    </div>

                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        Employee Working
                                        Hours
                                    </h2>
                                </div>

                                <p className="mt-2 text-sm text-[#806F8F]">
                                    Compare total working
                                    hours between
                                    employees.
                                </p>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-64">
                                    <Search
                                        size={16}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                    />
                                    <input
                                        type="text"
                                        value={employeeSearch}
                                        onChange={(event) =>
                                            setEmployeeSearch(event.target.value)
                                        }
                                        placeholder="Search name or employee code"
                                        className="w-full rounded-xl border border-[#C8B1E4]/60 bg-white/80 py-2.5 pl-9 pr-3 text-sm text-[#2F184B] outline-none transition-all placeholder:text-[#9B72CF]/70 focus:border-[#9B72CF] focus:ring-2 focus:ring-[#9B72CF]/20"
                                    />
                                </div>

                                {employeeHoursData.length > 0 && (
                                    <div className="flex items-center gap-2 self-start rounded-xl bg-[#F4EFFA] px-3 py-2">
                                        <TrendingUp
                                            size={15}
                                            className="text-[#532B88]"
                                        />

                                        <span className="whitespace-nowrap text-xs font-bold text-[#532B88]">
                                            {employeeHoursData.length}{" "}
                                            {employeeHoursData.length === 1
                                                ? "employee"
                                                : "employees"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="mb-3 text-xs font-semibold text-[#9B72CF]">
                            {employeeSearch.trim()
                                ? `Search results: ${employeeChartData.length} employee${employeeChartData.length === 1 ? "" : "s"
                                }`
                                : `Top ${Math.min(10, employeeHoursData.length)} employees by working hours`}
                        </p>

                        {employeeHoursData.length >
                            0 ? (
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={employeeChartData}
                                        layout="vertical"
                                        margin={{
                                            left: 10,
                                            right: 20,
                                            top: 5,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            stroke="#C8B1E4"
                                            strokeOpacity={
                                                0.25
                                            }
                                            horizontal={
                                                false
                                            }
                                            strokeDasharray="4 4"
                                        />

                                        <XAxis
                                            type="number"
                                            tick={{
                                                fill: "#806F8F",
                                                fontSize: 12,
                                            }}
                                            axisLine={
                                                false
                                            }
                                            tickLine={
                                                false
                                            }
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={120}
                                            tick={{
                                                fill: "#2F184B",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                            axisLine={
                                                false
                                            }
                                            tickLine={
                                                false
                                            }
                                        />

                                        <Tooltip
                                            content={
                                                <CustomTooltip />
                                            }
                                            cursor={{
                                                fill: "#F4EFFA",
                                            }}
                                        />

                                        <Bar
                                            dataKey="hours"
                                            name="Working Hours"
                                            fill="#9B72CF"
                                            radius={[
                                                0,
                                                8,
                                                8,
                                                0,
                                            ]}
                                            maxBarSize={
                                                30
                                            }
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex h-[250px] flex-col items-center justify-center text-center">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#9B72CF]">
                                    <Users
                                        size={24}
                                    />
                                </div>

                                <p className="text-sm font-semibold text-[#2F184B]">
                                    No employee data yet
                                </p>

                                <p className="mt-1 text-xs text-[#9B72CF]">
                                    Employee
                                    working-hour data
                                    will appear here.
                                </p>
                            </div>
                        )}
                    </motion.section>
                </div>

                {/* --------------------------------
                    FOOTER INSIGHT
                --------------------------------- */}

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
                        delay: 0.72,
                    }}
                    className="mt-6 rounded-3xl border border-[#C8B1E4]/50 bg-[#2F184B] p-5 text-white shadow-xl shadow-[#532B88]/10 sm:p-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                                <Sparkles
                                    size={20}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-bold">
                                    Analytics at a
                                    glance
                                </p>

                                <p className="mt-1 text-xs leading-5 text-white/65">
                                    {
                                        filteredReports.length
                                    }{" "}
                                    EOD{" "}
                                    {filteredReports.length ===
                                        1
                                        ? "report"
                                        : "reports"}{" "}
                                    recorded with{" "}
                                    {
                                        completedTasks
                                    }{" "}
                                    completed{" "}
                                    {completedTasks ===
                                        1
                                        ? "task"
                                        : "tasks"}{" "}
                                    during{" "}
                                    {periodLabel.toLowerCase()}
                                    .
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5">
                            <Clock
                                size={15}
                            />

                            <span className="text-xs font-semibold">
                                {formatHours(
                                    totalMinutes
                                )}{" "}
                                tracked
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

export default Analytics;