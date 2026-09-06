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

import { useEOD } from "../context/EODContext";
import { useEmployees } from "../context/EmployeeContext";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const convertHoursToMinutes = (hoursString) => {
    if (!hoursString) return 0;

    const hoursMatch = hoursString.match(/(\d+)h/);
    const minutesMatch = hoursString.match(/(\d+)m/);

    const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

    return hours * 60 + minutes;
};

const formatWorkingHours = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
};

// --------------------------------------------------
// Animation Variants
// --------------------------------------------------

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

// --------------------------------------------------
// Dashboard
// --------------------------------------------------

function Dashboard() {
    const { eodReports } = useEOD();
    const { employees } = useEmployees();

    // --------------------------------------------------
    // Dates
    // --------------------------------------------------

    const currentDate = new Date();

    const today = currentDate.toISOString().split("T")[0];

    const formattedToday = currentDate.toLocaleDateString("en-IN", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    // Monday of current week
    const day = currentDate.getDay();

    const monday = new Date(currentDate);

    monday.setDate(
        currentDate.getDate() - (day === 0 ? 6 : day - 1)
    );

    monday.setHours(0, 0, 0, 0);

    // Sunday
    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    sunday.setHours(23, 59, 59, 999);

    const formatDate = (date) => {
        return date.toISOString().split("T")[0];
    };

    const weekStart = formatDate(monday);
    const weekEnd = formatDate(sunday);

    // --------------------------------------------------
    // Weekly Reports
    // --------------------------------------------------

    const thisWeekReports = eodReports.filter(
        (report) =>
            report.date >= weekStart &&
            report.date <= weekEnd
    );

    const weeklyChartData = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);

        date.setDate(monday.getDate() + i);

        const dateString = formatDate(date);

        const dayReports = eodReports.filter(
            (report) => report.date === dateString
        );

        const minutes = dayReports.reduce(
            (total, report) =>
                total +
                convertHoursToMinutes(
                    report.totalWorkingHours
                ),
            0
        );

        weeklyChartData.push({
            day: date.toLocaleDateString("en-IN", {
                weekday: "short",
            }),
            hours: Number((minutes / 60).toFixed(2)),
        });
    }

    // --------------------------------------------------
    // Weekly Working Hours
    // --------------------------------------------------

    const weeklyWorkingMinutes = thisWeekReports.reduce(
        (total, report) =>
            total +
            convertHoursToMinutes(
                report.totalWorkingHours
            ),
        0
    );

    const weeklyWorkingHours = formatWorkingHours(
        weeklyWorkingMinutes
    );

    // --------------------------------------------------
    // Today's Reports
    // --------------------------------------------------

    const todayReports = eodReports.filter(
        (report) => report.date === today
    );

    // --------------------------------------------------
    // Task Statistics
    // --------------------------------------------------

    const tasksCompleted = todayReports.reduce(
        (total, report) =>
            total +
            report.tasks.filter(
                (task) => task.status === "Completed"
            ).length,
        0
    );

    const tasksInProgress = todayReports.reduce(
        (total, report) =>
            total +
            report.tasks.filter(
                (task) => task.status === "In Progress"
            ).length,
        0
    );

    const tasksPending = todayReports.reduce(
        (total, report) =>
            total +
            report.tasks.filter(
                (task) => task.status === "Pending"
            ).length,
        0
    );

    const tasksBlocked = todayReports.reduce(
        (total, report) =>
            total +
            report.tasks.filter(
                (task) => task.status === "Blocked"
            ).length,
        0
    );

    const totalTasks =
        tasksCompleted +
        tasksInProgress +
        tasksPending +
        tasksBlocked;

    const completionPercentage =
        totalTasks > 0
            ? Math.round(
                (tasksCompleted / totalTasks) * 100
            )
            : 0;

    // --------------------------------------------------
    // Today's Working Hours
    // --------------------------------------------------

    const totalWorkingMinutes = todayReports.reduce(
        (total, report) =>
            total +
            convertHoursToMinutes(
                report.totalWorkingHours
            ),
        0
    );

    const totalWorkingHours = formatWorkingHours(
        totalWorkingMinutes
    );

    // --------------------------------------------------
    // Statistics
    // --------------------------------------------------

    const activeEmployees = employees.filter(
        (employee) => employee.status === "Active"
    ).length;

    const statistics = [
        {
            title: "Active Employees",
            value: activeEmployees,
            description: "Currently active",
            icon: Users,
        },
        {
            title: "EOD Submitted",
            value: todayReports.length,
            description: "Reports submitted today",
            icon: ClipboardCheck,
        },
        {
            title: "Tasks Completed",
            value: tasksCompleted,
            description: "Completed today",
            icon: ListTodo,
        },
        {
            title: "Working Hours",
            value: weeklyWorkingHours,
            description: "Total this week",
            icon: Clock,
        },
    ];

    // --------------------------------------------------
    // Task status information
    // --------------------------------------------------

    const taskStatuses = [
        {
            label: "Completed",
            value: tasksCompleted,
            icon: CheckCircle2,
            percentage:
                totalTasks > 0
                    ? Math.round(
                        (tasksCompleted / totalTasks) * 100
                    )
                    : 0,
        },
        {
            label: "In Progress",
            value: tasksInProgress,
            icon: Timer,
            percentage:
                totalTasks > 0
                    ? Math.round(
                        (tasksInProgress / totalTasks) * 100
                    )
                    : 0,
        },
        {
            label: "Pending",
            value: tasksPending,
            icon: CircleDot,
            percentage:
                totalTasks > 0
                    ? Math.round(
                        (tasksPending / totalTasks) * 100
                    )
                    : 0,
        },
        {
            label: "Blocked",
            value: tasksBlocked,
            icon: AlertCircle,
            percentage:
                totalTasks > 0
                    ? Math.round(
                        (tasksBlocked / totalTasks) * 100
                    )
                    : 0,
        },
    ];

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* Ambient Background */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -20, 0],
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
            </div>

            <div className="relative mx-auto max-w-7xl">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#532B88] text-white shadow-sm">
                                    <CalendarDays size={16} />
                                </div>

                                <span className="text-sm font-medium text-[#806F8F]">
                                    {formattedToday}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-[#2F184B] sm:text-4xl">
                                Good day,{" "}
                                {JSON.parse(
                                    localStorage.getItem(
                                        "workpulse_current_employee"
                                    ) || "null"
                                )?.name || "Employee"}{" "}
                                👋
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#69577A] sm:text-base">
                                Here's what's happening across your
                                workplace today.
                            </p>
                        </div>

                        {/* Weekly Hours Mini Card */}

                        <motion.div
                            whileHover={{
                                y: -3,
                                scale: 1.01,
                            }}
                            className="flex items-center gap-4 rounded-2xl border border-[#C8B1E4]/50 bg-white/70 px-5 py-4 shadow-[0_10px_35px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                <TrendingUp size={21} />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-[#806F8F]">
                                    This week's hours
                                </p>

                                <p className="mt-0.5 text-xl font-bold text-[#2F184B]">
                                    {weeklyWorkingHours}
                                </p>
                            </div>

                            <ArrowUpRight
                                size={18}
                                className="text-[#9B72CF]"
                            />
                        </motion.div>
                    </div>
                </motion.div>

                {/* ==========================================
                    STATISTICS
                ========================================== */}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {statistics.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <motion.div
                                key={stat.title}
                                variants={itemVariants}
                                whileHover={{
                                    y: -5,
                                    transition: {
                                        duration: 0.2,
                                    },
                                }}
                                className="group relative overflow-hidden rounded-[22px] border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl"
                            >
                                {/* Decorative Glow */}

                                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#C8B1E4]/20 blur-2xl transition-all duration-500 group-hover:bg-[#9B72CF]/20" />

                                <div className="relative flex items-start justify-between">

                                    <div>
                                        <p className="text-sm font-medium text-[#806F8F]">
                                            {stat.title}
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
                                            {stat.value}
                                        </motion.p>

                                        <p className="mt-2 text-xs text-[#9B72CF]">
                                            {stat.description}
                                        </p>
                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88] transition-all duration-300 group-hover:bg-[#532B88] group-hover:text-white">
                                        <Icon size={21} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ==========================================
                    MAIN GRID
                ========================================== */}

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.618fr_1fr]">

                    {/* ======================================
                        WEEKLY CHART
                    ====================================== */}

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
                                        <Clock size={18} />
                                    </div>

                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        Working Hours
                                    </h2>
                                </div>

                                <p className="mt-2 text-sm text-[#806F8F]">
                                    Weekly activity from Monday to Sunday
                                </p>
                            </div>

                            <div className="hidden rounded-xl bg-[#F4EFFA] px-3 py-2 text-right sm:block">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-[#806F8F]">
                                    Total
                                </p>

                                <p className="text-sm font-bold text-[#532B88]">
                                    {weeklyWorkingHours}
                                </p>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={weeklyChartData}
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
                                            borderRadius: "14px",
                                            border: "1px solid #C8B1E4",
                                            boxShadow:
                                                "0 10px 30px rgba(47,24,75,0.12)",
                                        }}
                                        formatter={(value) => [
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
                                        maxBarSize={42}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.section>

                    {/* ======================================
                        TASK OVERVIEW
                    ====================================== */}

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
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                        <ListTodo size={18} />
                                    </div>

                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        Task Overview
                                    </h2>
                                </div>

                                <p className="mt-2 text-sm text-[#806F8F]">
                                    Today's productivity
                                </p>
                            </div>
                        </div>

                        {/* Completion Circle */}

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
                                            strokeDashoffset: 421,
                                        }}
                                        animate={{
                                            strokeDashoffset:
                                                421 -
                                                (421 *
                                                    completionPercentage) /
                                                100,
                                        }}
                                        transition={{
                                            duration: 1,
                                            ease: "easeOut",
                                        }}
                                    />
                                </svg>

                                <div className="relative text-center">
                                    <p className="text-3xl font-bold text-[#2F184B]">
                                        {completionPercentage}%
                                    </p>

                                    <p className="text-xs text-[#806F8F]">
                                        completed
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Rows */}

                        <div className="space-y-3">
                            {taskStatuses.map((status) => {
                                const Icon = status.icon;

                                return (
                                    <div
                                        key={status.label}
                                        className="flex items-center gap-3 rounded-xl bg-[#F4EFFA]/70 px-3 py-3"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#532B88]">
                                            <Icon size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-[#2F184B]">
                                                    {status.label}
                                                </p>

                                                <p className="text-sm font-bold text-[#532B88]">
                                                    {status.value}
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
                            })}
                        </div>
                    </motion.section>
                </div>

                {/* ==========================================
                    TODAY'S EMPLOYEE ACTIVITY
                ========================================== */}

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

                    {/* Header */}

                    <div className="flex flex-col gap-4 border-b border-[#C8B1E4]/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                    <Users size={18} />
                                </div>

                                <h2 className="text-lg font-bold text-[#2F184B]">
                                    Employee Activity
                                </h2>
                            </div>

                            <p className="mt-2 text-sm text-[#806F8F]">
                                Today's submitted EOD reports
                            </p>
                        </div>

                        <div className="flex w-fit items-center gap-2 rounded-full bg-[#F4EFFA] px-3 py-2">
                            <span className="h-2 w-2 rounded-full bg-[#9B72CF]" />

                            <span className="text-xs font-medium text-[#532B88]">
                                {todayReports.length} reports today
                            </span>
                        </div>
                    </div>

                    {/* Empty State */}

                    {todayReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                            <motion.div
                                animate={{
                                    y: [0, -6, 0],
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#9B72CF]"
                            >
                                <ClipboardCheck size={28} />
                            </motion.div>

                            <h3 className="mt-5 text-base font-bold text-[#2F184B]">
                                No EOD reports yet
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-[#806F8F]">
                                Employee submissions will appear here
                                once they complete their daily report.
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
                                        (report, index) => {

                                            const hasIncompleteTask =
                                                report.tasks.some(
                                                    (task) =>
                                                        task.status !==
                                                        "Completed"
                                                );

                                            const employeeStatus =
                                                hasIncompleteTask
                                                    ? "In Progress"
                                                    : "Completed";

                                            return (
                                                <motion.tr
                                                    key={report.id}
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

                                                    {/* Employee */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#532B88] text-sm font-bold text-white">
                                                                {report.employeeName
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="text-sm font-semibold text-[#2F184B]">
                                                                    {
                                                                        report.employeeName
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-[#9B72CF]">
                                                                    EOD submitted
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Department */}

                                                    <td className="px-6 py-4 text-sm text-[#69577A]">
                                                        {
                                                            report.department
                                                        }
                                                    </td>

                                                    {/* Time In */}

                                                    <td className="px-6 py-4">
                                                        <span className="rounded-lg bg-[#F4EFFA] px-2.5 py-1.5 text-xs font-medium text-[#532B88]">
                                                            {
                                                                report.timeIn
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* Time Out */}

                                                    <td className="px-6 py-4">
                                                        <span className="rounded-lg bg-[#F4EFFA] px-2.5 py-1.5 text-xs font-medium text-[#532B88]">
                                                            {
                                                                report.timeOut
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* Working Hours */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-[#2F184B]">
                                                            <Clock
                                                                size={15}
                                                                className="text-[#9B72CF]"
                                                            />

                                                            {
                                                                report.totalWorkingHours
                                                            }
                                                        </div>
                                                    </td>

                                                    {/* Status */}

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

                {/* ==========================================
                    FOOTER SUMMARY
                ========================================== */}

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
                            <TrendingUp size={16} />
                        </div>

                        <p className="text-sm text-[#69577A]">
                            Today's total working time
                        </p>
                    </div>

                    <p className="text-lg font-bold text-[#532B88]">
                        {totalWorkingHours}
                    </p>
                </motion.div>

            </div>
        </main>
    );
}

export default Dashboard;