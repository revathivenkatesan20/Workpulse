import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    Search,
    CalendarDays,
    Clock3,
    CheckCircle2,
    CircleDot,
    AlertCircle,
    Eye,
    X,
    Building2,
    FileText,
    MessageSquareText,
    Filter,
} from "lucide-react";

import { useEOD } from "../context/EODContext";

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getReportStatus = (report) => {
    const tasks = Array.isArray(report?.tasks)
        ? report.tasks
        : [];

    if (!tasks.length) {
        return "Pending";
    }

    const statuses = tasks.map((task) =>
        String(task.status || "").toLowerCase()
    );

    if (
        statuses.every(
            (status) => status === "completed"
        )
    ) {
        return "Completed";
    }

    if (
        statuses.some(
            (status) =>
                status === "in progress" ||
                status === "in-progress"
        )
    ) {
        return "In Progress";
    }

    if (
        statuses.some(
            (status) =>
                status === "pending" ||
                status === "not started"
        )
    ) {
        return "Pending";
    }

    return "Completed";
};

const getStatusClasses = (status) => {
    switch (status) {
        case "Completed":
            return {
                badge:
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
                icon: "text-emerald-600",
            };

        case "In Progress":
            return {
                badge:
                    "bg-amber-50 text-amber-700 border-amber-200",
                icon: "text-amber-600",
            };

        default:
            return {
                badge:
                    "bg-rose-50 text-rose-700 border-rose-200",
                icon: "text-rose-600",
            };
    }
};

/* =========================================================
   ADMIN EOD
========================================================= */

function AdminEOD() {
    const {
        eodReports,
        loading,
        error,
    } = useEOD();

    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("All");

    const [selectedReport, setSelectedReport] =
        useState(null);

    /* =====================================================
       FILTER REPORTS
    ===================================================== */

    const filteredReports = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        return [...eodReports]
            .filter((report) => {
                if (!searchValue) return true;

                return (
                    String(
                        report.employeeName || ""
                    )
                        .toLowerCase()
                        .includes(searchValue) ||
                    String(
                        report.employeeCode || ""
                    )
                        .toLowerCase()
                        .includes(searchValue) ||
                    String(
                        report.department || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)
                );
            })
            .filter((report) => {
                if (!dateFilter) return true;

                return report.date === dateFilter;
            })
            .filter((report) => {
                if (statusFilter === "All") {
                    return true;
                }

                return (
                    getReportStatus(report) ===
                    statusFilter
                );
            })
            .sort((a, b) => {
                const dateA =
                    new Date(
                        `${a.date || "1900-01-01"}T00:00:00`
                    ).getTime();

                const dateB =
                    new Date(
                        `${b.date || "1900-01-01"}T00:00:00`
                    ).getTime();

                return dateB - dateA;
            });
    }, [
        eodReports,
        search,
        dateFilter,
        statusFilter,
    ]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const statistics = useMemo(() => {
        const total = eodReports.length;

        const completed =
            eodReports.filter(
                (report) =>
                    getReportStatus(report) ===
                    "Completed"
            ).length;

        const inProgress =
            eodReports.filter(
                (report) =>
                    getReportStatus(report) ===
                    "In Progress"
            ).length;

        const pending =
            eodReports.filter(
                (report) =>
                    getReportStatus(report) ===
                    "Pending"
            ).length;

        return {
            total,
            completed,
            inProgress,
            pending,
        };
    }, [eodReports]);

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4EFFA] p-5 sm:p-7 lg:p-10">
                <div className="mx-auto max-w-7xl">
                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <div
                                className="
                                    mx-auto mb-4
                                    h-10 w-10
                                    animate-spin
                                    rounded-full
                                    border-4
                                    border-[#C8B1E4]
                                    border-t-[#532B88]
                                "
                            />

                            <p className="text-sm font-semibold text-[#69577A]">
                                Loading EOD reports...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4EFFA] p-4 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-7xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="mb-7"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <div
                                    className="
                                        flex h-10 w-10
                                        items-center justify-center
                                        rounded-2xl
                                        bg-[#532B88]
                                        text-white
                                        shadow-lg
                                        shadow-[#532B88]/20
                                    "
                                >
                                    <ClipboardList
                                        size={21}
                                    />
                                </div>

                                <span
                                    className="
                                        rounded-full
                                        border border-[#C8B1E4]/60
                                        bg-white/70
                                        px-3 py-1
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.16em]
                                        text-[#9B72CF]
                                    "
                                >
                                    Admin
                                </span>
                            </div>

                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                    tracking-tight
                                    text-[#2F184B]
                                    sm:text-3xl
                                "
                            >
                                EOD Management
                            </h1>

                            <p
                                className="
                                    mt-1
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-[#806F8F]
                                "
                            >
                                Monitor and review daily
                                end-of-day reports submitted
                                by employees.
                            </p>
                        </div>

                    </div>
                </motion.div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        className="
                            mb-5
                            flex items-start gap-3
                            rounded-2xl
                            border border-rose-200
                            bg-rose-50
                            p-4
                            text-sm
                            text-rose-700
                        "
                    >
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            <p className="font-semibold">
                                Unable to load EOD data
                            </p>

                            <p className="mt-1 text-xs">
                                Unable to load the latest EOD reports. Please try again.
                            </p>
                        </div>
                    </div>
                )}

                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

                    <StatCard
                        title="Total Reports"
                        value={statistics.total}
                        icon={ClipboardList}
                    />

                    <StatCard
                        title="Completed"
                        value={statistics.completed}
                        icon={CheckCircle2}
                    />

                    <StatCard
                        title="In Progress"
                        value={statistics.inProgress}
                        icon={CircleDot}
                    />

                    <StatCard
                        title="Pending"
                        value={statistics.pending}
                        icon={AlertCircle}
                    />

                </div>

                {/* =================================================
                    FILTERS
                ================================================= */}

                <div
                    className="
                        mb-6
                        rounded-3xl
                        border border-[#C8B1E4]/50
                        bg-white/70
                        p-4
                        shadow-sm
                        backdrop-blur-xl
                        sm:p-5
                    "
                >

                    <div className="mb-4 flex items-center gap-2">
                        <Filter
                            size={17}
                            className="text-[#532B88]"
                        />

                        <h2 className="text-sm font-bold text-[#2F184B]">
                            Filter Reports
                        </h2>

                        <span className="ml-auto text-xs text-[#9B72CF]">
                            {filteredReports.length} result
                            {filteredReports.length !== 1
                                ? "s"
                                : ""}
                        </span>
                    </div>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            md:grid-cols-3
                        "
                    >

                        {/* Search */}

                        <div className="relative">
                            <Search
                                size={17}
                                className="
                                    absolute
                                    left-3.5
                                    top-1/2
                                    -translate-y-1/2
                                    text-[#9B72CF]
                                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search employee, ID or department..."
                                className="
                                    w-full
                                    rounded-2xl
                                    border border-[#C8B1E4]/60
                                    bg-[#F4EFFA]/60
                                    py-3
                                    pl-10
                                    pr-4
                                    text-sm
                                    text-[#2F184B]
                                    outline-none
                                    transition
                                    focus:border-[#9B72CF]
                                    focus:ring-2
                                    focus:ring-[#9B72CF]/20
                                "
                            />
                        </div>

                        {/* Date */}

                        <div className="relative">
                            <CalendarDays
                                size={17}
                                className="
                                    absolute
                                    left-3.5
                                    top-1/2
                                    -translate-y-1/2
                                    text-[#9B72CF]
                                "
                            />

                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(event) =>
                                    setDateFilter(
                                        event.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-2xl
                                    border border-[#C8B1E4]/60
                                    bg-[#F4EFFA]/60
                                    py-3
                                    pl-10
                                    pr-4
                                    text-sm
                                    text-[#2F184B]
                                    outline-none
                                    transition
                                    focus:border-[#9B72CF]
                                    focus:ring-2
                                    focus:ring-[#9B72CF]/20
                                "
                            />
                        </div>

                        {/* Status */}

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="
                                w-full
                                rounded-2xl
                                border border-[#C8B1E4]/60
                                bg-[#F4EFFA]/60
                                px-4
                                py-3
                                text-sm
                                font-medium
                                text-[#2F184B]
                                outline-none
                                transition
                                focus:border-[#9B72CF]
                                focus:ring-2
                                focus:ring-[#9B72CF]/20
                            "
                        >
                            <option value="All">
                                All Status
                            </option>
                            <option value="Completed">
                                Completed
                            </option>
                            <option value="In Progress">
                                In Progress
                            </option>
                            <option value="Pending">
                                Pending
                            </option>
                        </select>

                    </div>

                    {(search ||
                        dateFilter ||
                        statusFilter !== "All") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setDateFilter("");
                                    setStatusFilter("All");
                                }}
                                className="
                                mt-3
                                text-xs
                                font-semibold
                                text-[#532B88]
                                hover:underline
                            "
                            >
                                Clear all filters
                            </button>
                        )}

                </div>

                {/* =================================================
                    REPORT TABLE
                ================================================= */}

                <div
                    className="
                        overflow-hidden
                        rounded-3xl
                        border border-[#C8B1E4]/50
                        bg-white/75
                        shadow-sm
                        backdrop-blur-xl
                    "
                >

                    {/* Desktop table */}

                    <div className="hidden overflow-x-auto lg:block">

                        <table className="w-full min-w-[900px]">

                            <thead>
                                <tr className="border-b border-[#C8B1E4]/40 bg-[#F4EFFA]/60">
                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                        Employee
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                        Department
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                        Working Hours
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                        Tasks
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#C8B1E4]/25">

                                {filteredReports.map(
                                    (report, index) => (
                                        <ReportRow
                                            key={
                                                report.id ||
                                                `${report.employeeCode}-${report.date}-${index}`
                                            }
                                            report={report}
                                            onView={() =>
                                                setSelectedReport(
                                                    report
                                                )
                                            }
                                        />
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* Mobile / tablet cards */}

                    <div className="divide-y divide-[#C8B1E4]/30 lg:hidden">

                        {filteredReports.map(
                            (report, index) => (
                                <MobileReportCard
                                    key={
                                        report.id ||
                                        `${report.employeeCode}-${report.date}-${index}`
                                    }
                                    report={report}
                                    onView={() =>
                                        setSelectedReport(
                                            report
                                        )
                                    }
                                />
                            )
                        )}

                    </div>

                    {/* Empty */}

                    {filteredReports.length === 0 && (
                        <div className="px-6 py-16 text-center">

                            <div
                                className="
                                    mx-auto mb-4
                                    flex h-16 w-16
                                    items-center justify-center
                                    rounded-3xl
                                    bg-[#F4EFFA]
                                    text-[#9B72CF]
                                "
                            >
                                <ClipboardList
                                    size={28}
                                />
                            </div>

                            <h3 className="text-base font-bold text-[#2F184B]">
                                No EOD reports found
                            </h3>

                            <p className="mt-1 text-sm text-[#806F8F]">
                                Try changing your search or
                                filter criteria.
                            </p>

                        </div>
                    )}

                </div>

            </div>

            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            <AnimatePresence>
                {selectedReport && (
                    <ReportDetailsModal
                        report={selectedReport}
                        onClose={() =>
                            setSelectedReport(null)
                        }
                    />
                )}
            </AnimatePresence>

        </div>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    title,
    value,
    icon: Icon,
}) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="
                rounded-3xl
                border border-[#C8B1E4]/50
                bg-white/75
                p-4
                shadow-sm
                backdrop-blur-xl
                sm:p-5
            "
        >
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#2F184B]">
                        {value}
                    </p>
                </div>

                <div
                    className="
                        flex h-11 w-11
                        items-center justify-center
                        rounded-2xl
                        bg-[#F4EFFA]
                        text-[#532B88]
                    "
                >
                    <Icon size={21} />
                </div>

            </div>
        </motion.div>
    );
}

/* =========================================================
   DESKTOP REPORT ROW
========================================================= */

function ReportRow({
    report,
    onView,
}) {
    const status =
        getReportStatus(report);

    const statusClasses =
        getStatusClasses(status);

    const tasks = Array.isArray(report.tasks)
        ? report.tasks
        : [];

    return (
        <motion.tr
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            className="group transition hover:bg-[#F4EFFA]/50"
        >

            <td className="px-5 py-4">
                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex h-10 w-10
                            shrink-0
                            items-center justify-center
                            rounded-full
                            bg-[#532B88]
                            text-sm
                            font-bold
                            text-white
                        "
                    >
                        {report.employeeName
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#2F184B]">
                            {report.employeeName || "-"}
                        </p>

                        <p className="text-xs text-[#9B72CF]">
                            {report.employeeCode || "-"}
                        </p>
                    </div>

                </div>
            </td>

            <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-[#69577A]">
                    <Building2
                        size={15}
                        className="text-[#9B72CF]"
                    />
                    {report.department || "-"}
                </div>
            </td>

            <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#69577A]">
                    <CalendarDays
                        size={15}
                        className="text-[#9B72CF]"
                    />
                    {formatDate(report.date)}
                </div>
            </td>

            <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2F184B]">
                    <Clock3
                        size={15}
                        className="text-[#9B72CF]"
                    />
                    {report.totalWorkingHours || "-"}
                </div>
            </td>

            <td className="px-5 py-4">
                <span className="text-sm font-semibold text-[#532B88]">
                    {tasks.length}
                </span>

                <span className="ml-1 text-xs text-[#806F8F]">
                    task{tasks.length !== 1 ? "s" : ""}
                </span>
            </td>

            <td className="px-5 py-4">
                <StatusBadge
                    status={status}
                    classes={statusClasses}
                />
            </td>

            <td className="px-5 py-4 text-right">
                <button
                    type="button"
                    onClick={onView}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-[#F4EFFA]
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-[#532B88]
                        transition
                        hover:bg-[#C8B1E4]/40
                    "
                >
                    <Eye size={15} />
                    View
                </button>
            </td>

        </motion.tr>
    );
}

/* =========================================================
   MOBILE REPORT CARD
========================================================= */

function MobileReportCard({
    report,
    onView,
}) {
    const status =
        getReportStatus(report);

    const statusClasses =
        getStatusClasses(status);

    const tasks = Array.isArray(report.tasks)
        ? report.tasks
        : [];

    return (
        <div className="p-4 sm:p-5">

            <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">

                    <div
                        className="
                            flex h-11 w-11
                            shrink-0
                            items-center justify-center
                            rounded-full
                            bg-[#532B88]
                            text-sm
                            font-bold
                            text-white
                        "
                    >
                        {report.employeeName
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#2F184B]">
                            {report.employeeName || "-"}
                        </p>

                        <p className="text-xs text-[#9B72CF]">
                            {report.employeeCode || "-"}
                        </p>
                    </div>

                </div>

                <StatusBadge
                    status={status}
                    classes={statusClasses}
                />

            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">

                <InfoMini
                    icon={Building2}
                    label="Department"
                    value={report.department || "-"}
                />

                <InfoMini
                    icon={CalendarDays}
                    label="Date"
                    value={formatDate(report.date)}
                />

                <InfoMini
                    icon={Clock3}
                    label="Working Hours"
                    value={
                        report.totalWorkingHours ||
                        "-"
                    }
                />

                <InfoMini
                    icon={ClipboardList}
                    label="Tasks"
                    value={String(tasks.length)}
                />

            </div>

            <button
                type="button"
                onClick={onView}
                className="
                    mt-4
                    flex w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[#532B88]
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-md
                    shadow-[#532B88]/20
                    transition
                    hover:bg-[#2F184B]
                "
            >
                <Eye size={17} />
                View EOD Details
            </button>

        </div>
    );
}

/* =========================================================
   MINI INFO
========================================================= */

function InfoMini({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-2xl bg-[#F4EFFA]/70 p-3">

            <div className="flex items-center gap-1.5">
                <Icon
                    size={13}
                    className="text-[#9B72CF]"
                />

                <span className="text-[9px] font-bold uppercase tracking-wider text-[#9B72CF]">
                    {label}
                </span>
            </div>

            <p className="mt-1 truncate text-xs font-semibold text-[#2F184B]">
                {value}
            </p>

        </div>
    );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
    status,
    classes,
}) {
    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                text-[10px]
                font-bold
                ${classes.badge}
            `}
        >
            {status === "Completed" ? (
                <CheckCircle2
                    size={12}
                    className={classes.icon}
                />
            ) : status === "In Progress" ? (
                <CircleDot
                    size={12}
                    className={classes.icon}
                />
            ) : (
                <AlertCircle
                    size={12}
                    className={classes.icon}
                />
            )}

            {status}
        </span>
    );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function ReportDetailsModal({
    report,
    onClose,
}) {
    const status =
        getReportStatus(report);

    const statusClasses =
        getStatusClasses(status);

    const tasks = Array.isArray(report.tasks)
        ? report.tasks
        : [];

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            exit={{
                opacity: 0,
            }}
            className="
                fixed inset-0 z-[100]
                flex items-center justify-center
                bg-[#2F184B]/40
                p-4
                backdrop-blur-sm
            "
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >

            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.96,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                }}
                exit={{
                    opacity: 0,
                    scale: 0.96,
                    y: 15,
                }}
                transition={{
                    duration: 0.2,
                }}
                className="
                    flex
                    max-h-[90vh]
                    w-full
                    max-w-3xl
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border border-[#C8B1E4]/50
                    bg-white
                    shadow-2xl
                "
            >

                {/* Header */}

                <div
                    className="
                        shrink-0
                        border-b
                        border-[#C8B1E4]/40
                        bg-[#F4EFFA]/70
                        p-5
                        sm:p-6
                    "
                >

                    <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    flex h-12 w-12
                                    shrink-0
                                    items-center justify-center
                                    rounded-2xl
                                    bg-[#532B88]
                                    text-white
                                "
                            >
                                <FileText
                                    size={22}
                                />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#2F184B]">
                                    EOD Report
                                </h2>

                                <p className="text-xs text-[#806F8F]">
                                    {formatDate(
                                        report.date
                                    )}
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-xl
                                p-2
                                text-[#806F8F]
                                transition
                                hover:bg-white
                                hover:text-[#532B88]
                            "
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>

                    </div>

                </div>

                {/* Content */}

                <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

                    {/* Employee information */}

                    <div
                        className="
                            mb-5
                            rounded-3xl
                            border border-[#C8B1E4]/40
                            bg-[#F4EFFA]/50
                            p-4
                        "
                    >

                        <div className="mb-4 flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex h-11 w-11
                                        items-center justify-center
                                        rounded-full
                                        bg-[#532B88]
                                        text-sm
                                        font-bold
                                        text-white
                                    "
                                >
                                    {report.employeeName
                                        ?.charAt(0)
                                        .toUpperCase() ||
                                        "?"}
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-[#2F184B]">
                                        {report.employeeName ||
                                            "-"}
                                    </p>

                                    <p className="text-xs text-[#9B72CF]">
                                        {report.employeeCode ||
                                            "-"}
                                    </p>
                                </div>

                            </div>

                            <StatusBadge
                                status={status}
                                classes={
                                    statusClasses
                                }
                            />

                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                            <DetailInfo
                                icon={Building2}
                                label="Department"
                                value={
                                    report.department ||
                                    "-"
                                }
                            />

                            <DetailInfo
                                icon={Clock3}
                                label="Time In"
                                value={
                                    report.timeIn ||
                                    "-"
                                }
                            />

                            <DetailInfo
                                icon={Clock3}
                                label="Time Out"
                                value={
                                    report.timeOut ||
                                    "-"
                                }
                            />

                        </div>

                    </div>

                    {/* Working hours */}

                    <div
                        className="
                            mb-5
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                        "
                    >

                        <div
                            className="
                                rounded-2xl
                                border border-[#C8B1E4]/40
                                bg-white
                                p-4
                            "
                        >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                Total Working Hours
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                                <Clock3
                                    size={18}
                                    className="text-[#532B88]"
                                />

                                <p className="text-lg font-bold text-[#2F184B]">
                                    {report.totalWorkingHours ||
                                        "-"}
                                </p>
                            </div>
                        </div>

                        <div
                            className="
                                rounded-2xl
                                border border-[#C8B1E4]/40
                                bg-white
                                p-4
                            "
                        >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B72CF]">
                                Submitted
                            </p>

                            <p className="mt-2 text-sm font-bold text-[#2F184B]">
                                {report.submittedAt
                                    ? new Date(
                                        report.submittedAt
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                    : "-"}
                            </p>
                        </div>

                    </div>

                    {/* Tasks */}

                    <div>

                        <div className="mb-3 flex items-center justify-between">

                            <div className="flex items-center gap-2">
                                <ClipboardList
                                    size={17}
                                    className="text-[#532B88]"
                                />

                                <h3 className="text-sm font-bold text-[#2F184B]">
                                    Tasks
                                </h3>
                            </div>

                            <span className="text-xs font-semibold text-[#9B72CF]">
                                {tasks.length} task
                                {tasks.length !== 1
                                    ? "s"
                                    : ""}
                            </span>

                        </div>

                        <div className="space-y-3">

                            {tasks.length === 0 ? (
                                <div className="rounded-2xl bg-[#F4EFFA] p-4 text-sm text-[#806F8F]">
                                    No tasks recorded.
                                </div>
                            ) : (
                                tasks.map(
                                    (task, index) => (
                                        <div
                                            key={index}
                                            className="
                                                rounded-2xl
                                                border border-[#C8B1E4]/35
                                                bg-white
                                                p-4
                                            "
                                        >

                                            <div className="flex items-start gap-3">

                                                <div
                                                    className="
                                                        flex h-8 w-8
                                                        shrink-0
                                                        items-center justify-center
                                                        rounded-xl
                                                        bg-[#F4EFFA]
                                                        text-xs
                                                        font-bold
                                                        text-[#532B88]
                                                    "
                                                >
                                                    {index +
                                                        1}
                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                                                        <p className="text-sm font-semibold text-[#2F184B]">
                                                            {task.description ||
                                                                "No description"}
                                                        </p>

                                                        <span className="shrink-0 rounded-full bg-[#F4EFFA] px-2.5 py-1 text-[10px] font-bold text-[#532B88]">
                                                            {task.status ||
                                                                "Completed"}
                                                        </span>

                                                    </div>

                                                    {task.remarks && (
                                                        <div className="mt-3 flex gap-2 rounded-xl bg-[#F4EFFA]/70 p-3">
                                                            <MessageSquareText
                                                                size={14}
                                                                className="mt-0.5 shrink-0 text-[#9B72CF]"
                                                            />

                                                            <p className="text-xs leading-5 text-[#69577A]">
                                                                {
                                                                    task.remarks
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                </div>

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </div>

                    {/* HR Notes placeholder */}

                    <div
                        className="
                            mt-5
                            rounded-2xl
                            border border-dashed
                            border-[#C8B1E4]
                            bg-[#F4EFFA]/40
                            p-4
                        "
                    >
                        <div className="flex items-start gap-3">

                            <MessageSquareText
                                size={18}
                                className="mt-0.5 text-[#9B72CF]"
                            />

                            <div>
                                <p className="text-sm font-bold text-[#2F184B]">
                                    HR Notes
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#806F8F]">
                                    HR notes will be connected
                                    to the backend in the next
                                    step.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Footer */}

                <div
                    className="
                        shrink-0
                        border-t
                        border-[#C8B1E4]/40
                        bg-[#F4EFFA]/50
                        p-4
                        sm:p-5
                    "
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            w-full
                            rounded-2xl
                            bg-[#532B88]
                            px-4
                            py-3
                            text-sm
                            font-bold
                            text-white
                            shadow-lg
                            shadow-[#532B88]/20
                            transition
                            hover:bg-[#2F184B]
                        "
                    >
                        Close
                    </button>
                </div>

            </motion.div>

        </motion.div>
    );
}

/* =========================================================
   DETAIL INFO
========================================================= */

function DetailInfo({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-2xl bg-white p-3">

            <div className="flex items-center gap-1.5">
                <Icon
                    size={13}
                    className="text-[#9B72CF]"
                />

                <span className="text-[9px] font-bold uppercase tracking-wider text-[#9B72CF]">
                    {label}
                </span>
            </div>

            <p className="mt-1 text-sm font-bold text-[#2F184B]">
                {value}
            </p>

        </div>
    );
}

export default AdminEOD;