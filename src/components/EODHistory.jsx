import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    Clock3,
    CheckCircle2,
    CircleAlert,
    ChevronDown,
    ClipboardList,
    Timer,
} from "lucide-react";
import { useState } from "react";
import { useEOD } from "../context/EODContext";

function EODHistory() {
    const { eodReports } = useEOD();

    const [openReport, setOpenReport] = useState(null);

    // ---------------------------------------------
    // Get currently logged-in employee
    // ---------------------------------------------

    const currentEmployee = JSON.parse(
        localStorage.getItem(
            "workpulse_current_employee"
        ) || "null"
    );

    const currentEmployeeCode =
        currentEmployee?.employeeCode || "";

    // ---------------------------------------------
    // Only show current employee's reports
    // ---------------------------------------------

    const myReports = eodReports.filter(
        (report) =>
            report.employeeCode ===
            currentEmployeeCode
    );

    // ---------------------------------------------
    // Toggle report
    // ---------------------------------------------

    const toggleReport = (id) => {
        setOpenReport((previous) =>
            previous === id ? null : id
        );
    };

    // ---------------------------------------------
    // Empty state
    // ---------------------------------------------

    if (myReports.length === 0) {
        return (
            <motion.div
                initial={{
                    opacity: 0,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="rounded-[24px] border border-dashed border-[#C8B1E4] bg-white/70 p-8 text-center shadow-[0_10px_35px_rgba(47,24,75,0.05)] backdrop-blur-xl"
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#532B88]">
                    <CalendarDays size={27} />
                </div>

                <h3 className="font-bold text-[#2F184B]">
                    No EOD reports yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806F8F]">
                    Your submitted daily reports will
                    appear here. Once you submit an EOD,
                    you can view its details from this
                    section.
                </p>
            </motion.div>
        );
    }

    // ---------------------------------------------
    // Format date
    // ---------------------------------------------

    const formatDate = (dateString) => {
        if (!dateString) {
            return "";
        }

        const date = new Date(
            `${dateString}T00:00:00`
        );

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-5">

            {/* =========================================
                SECTION HEADER
            ========================================= */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#532B88] text-white shadow-lg shadow-[#532B88]/20">
                        <ClipboardList size={20} />
                    </div>

                    <div>

                        <h2 className="text-xl font-bold text-[#2F184B]">
                            EOD History
                        </h2>

                        <p className="mt-1 text-sm text-[#806F8F]">
                            Your previously submitted daily
                            reports.
                        </p>

                    </div>

                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-[#C8B1E4]/50 bg-white/70 px-3 py-2 backdrop-blur-xl">

                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F4EFFA] text-xs font-bold text-[#532B88]">
                        {myReports.length}
                    </span>

                    <span className="text-xs font-semibold text-[#806F8F]">
                        {myReports.length === 1
                            ? "Report"
                            : "Reports"}
                    </span>

                </div>

            </div>

            {/* =========================================
                REPORTS
            ========================================= */}

            <div className="space-y-4">

                {myReports
                    .slice()
                    .reverse()
                    .map((report, index) => {

                        const reportTasks =
                            Array.isArray(
                                report.tasks
                            )
                                ? report.tasks
                                : [];

                        const completedTasks =
                            reportTasks.filter(
                                (task) =>
                                    task.status ===
                                    "Completed"
                            ).length;

                        const isOpen =
                            openReport ===
                            report.id;

                        return (
                            <motion.div
                                key={report.id}
                                initial={{
                                    opacity: 0,
                                    y: 15,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay:
                                        index * 0.05,
                                }}
                                className="overflow-hidden rounded-[22px] border border-[#C8B1E4]/40 bg-white/75 shadow-[0_10px_35px_rgba(47,24,75,0.06)] backdrop-blur-xl"
                            >

                                {/* =================================
                                    REPORT HEADER
                                ================================= */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleReport(
                                            report.id
                                        )
                                    }
                                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-[#F4EFFA]/60 sm:p-6"
                                >

                                    <div className="min-w-0">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <div className="flex items-center gap-2">

                                                <CalendarDays
                                                    size={16}
                                                    className="text-[#9B72CF]"
                                                />

                                                <h3 className="font-bold text-[#2F184B]">
                                                    {formatDate(
                                                        report.date
                                                    )}
                                                </h3>

                                            </div>

                                            <span className="rounded-full bg-[#F4EFFA] px-2.5 py-1 text-xs font-semibold text-[#532B88]">
                                                Submitted
                                            </span>

                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#806F8F] sm:text-sm">

                                            <span className="flex items-center gap-1.5">

                                                <Timer
                                                    size={14}
                                                    className="text-[#9B72CF]"
                                                />

                                                {report.totalWorkingHours ||
                                                    report.workingHours ||
                                                    "--"}

                                            </span>

                                            <span className="flex items-center gap-1.5">

                                                <ClipboardList
                                                    size={14}
                                                    className="text-[#9B72CF]"
                                                />

                                                {reportTasks.length}{" "}
                                                {reportTasks.length ===
                                                1
                                                    ? "Task"
                                                    : "Tasks"}

                                            </span>

                                            <span className="hidden sm:block">
                                                {report.department}
                                            </span>

                                        </div>

                                    </div>

                                    <motion.div
                                        animate={{
                                            rotate: isOpen
                                                ? 180
                                                : 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]"
                                    >
                                        <ChevronDown
                                            size={19}
                                        />
                                    </motion.div>

                                </button>

                                {/* =================================
                                    REPORT DETAILS
                                ================================= */}

                                <AnimatePresence initial={false}>

                                    {isOpen && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            transition={{
                                                duration: 0.25,
                                            }}
                                            className="overflow-hidden"
                                        >

                                            <div className="border-t border-[#C8B1E4]/30 bg-[#F4EFFA]/45 p-5 sm:p-6">

                                                {/* =========================
                                                    ATTENDANCE
                                                ========================= */}

                                                <div className="mb-6">

                                                    <div className="mb-3 flex items-center gap-2">

                                                        <Clock3
                                                            size={16}
                                                            className="text-[#532B88]"
                                                        />

                                                        <h4 className="text-sm font-bold text-[#2F184B]">
                                                            Attendance
                                                        </h4>

                                                    </div>

                                                    <div className="grid gap-3 sm:grid-cols-3">

                                                        {/* Time In */}

                                                        <div className="rounded-xl border border-[#C8B1E4]/30 bg-white p-4">

                                                            <p className="text-xs font-medium text-[#806F8F]">
                                                                Time In
                                                            </p>

                                                            <p className="mt-1 text-lg font-bold text-[#2F184B]">
                                                                {report.timeIn ||
                                                                    "--"}
                                                            </p>

                                                        </div>

                                                        {/* Time Out */}

                                                        <div className="rounded-xl border border-[#C8B1E4]/30 bg-white p-4">

                                                            <p className="text-xs font-medium text-[#806F8F]">
                                                                Time Out
                                                            </p>

                                                            <p className="mt-1 text-lg font-bold text-[#2F184B]">
                                                                {report.timeOut ||
                                                                    "--"}
                                                            </p>

                                                        </div>

                                                        {/* Working Hours */}

                                                        <div className="rounded-xl border border-[#C8B1E4]/40 bg-[#532B88] p-4 text-white shadow-lg shadow-[#532B88]/10">

                                                            <p className="text-xs font-medium text-white/70">
                                                                Working Hours
                                                            </p>

                                                            <p className="mt-1 text-lg font-bold">
                                                                {report.totalWorkingHours ||
                                                                    report.workingHours ||
                                                                    "--"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* =========================
                                                    TASKS
                                                ========================= */}

                                                <div>

                                                    <div className="mb-3 flex items-center justify-between">

                                                        <div className="flex items-center gap-2">

                                                            <ClipboardList
                                                                size={16}
                                                                className="text-[#532B88]"
                                                            />

                                                            <h4 className="text-sm font-bold text-[#2F184B]">
                                                                Tasks
                                                            </h4>

                                                        </div>

                                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#532B88]">
                                                            {
                                                                completedTasks
                                                            }
                                                            /
                                                            {
                                                                reportTasks.length
                                                            }{" "}
                                                            completed
                                                        </span>

                                                    </div>

                                                    <div className="space-y-3">

                                                        {reportTasks.map(
                                                            (
                                                                task,
                                                                taskIndex
                                                            ) => {

                                                                const isCompleted =
                                                                    task.status ===
                                                                    "Completed";

                                                                return (
                                                                    <motion.div
                                                                        key={
                                                                            task.id ||
                                                                            taskIndex
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                            y: 8,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            y: 0,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                taskIndex *
                                                                                0.04,
                                                                        }}
                                                                        className="rounded-xl border border-[#C8B1E4]/30 bg-white p-4"
                                                                    >

                                                                        <div className="flex items-start gap-3">

                                                                            {/* Status Icon */}

                                                                            <div className="mt-0.5 shrink-0">

                                                                                {isCompleted ? (
                                                                                    <CheckCircle2
                                                                                        size={
                                                                                            19
                                                                                        }
                                                                                        className="text-[#532B88]"
                                                                                    />
                                                                                ) : (
                                                                                    <CircleAlert
                                                                                        size={
                                                                                            19
                                                                                        }
                                                                                        className="text-[#9B72CF]"
                                                                                    />
                                                                                )}

                                                                            </div>

                                                                            {/* Task Content */}

                                                                            <div className="min-w-0 flex-1">

                                                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                                                                    <p className="font-semibold text-[#2F184B]">
                                                                                        Task{" "}
                                                                                        {taskIndex +
                                                                                            1}
                                                                                    </p>

                                                                                    <span className="w-fit rounded-full bg-[#F4EFFA] px-2.5 py-1 text-xs font-semibold text-[#532B88]">
                                                                                        {
                                                                                            task.status
                                                                                        }
                                                                                    </span>

                                                                                </div>

                                                                                <p className="mt-2 text-sm leading-6 text-[#69577A]">
                                                                                    {
                                                                                        task.description
                                                                                    }
                                                                                </p>

                                                                                {task.remarks && (
                                                                                    <div className="mt-3 rounded-lg bg-[#F4EFFA]/70 px-3 py-2">

                                                                                        <p className="text-xs leading-5 text-[#806F8F]">

                                                                                            <span className="font-semibold text-[#532B88]">
                                                                                                Remarks:
                                                                                            </span>{" "}

                                                                                            {
                                                                                                task.remarks
                                                                                            }

                                                                                        </p>

                                                                                    </div>
                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                    </motion.div>
                                                                );
                                                            }
                                                        )}

                                                    </div>

                                                </div>

                                                {/* =========================
                                                    SUMMARY
                                                ========================= */}

                                                <div className="mt-5 flex flex-wrap gap-3">

                                                    <div className="flex items-center gap-2 rounded-xl border border-[#C8B1E4]/30 bg-white px-4 py-2.5">

                                                        <CheckCircle2
                                                            size={16}
                                                            className="text-[#532B88]"
                                                        />

                                                        <span className="text-xs font-semibold text-[#532B88]">
                                                            {
                                                                completedTasks
                                                            }{" "}
                                                            Completed
                                                        </span>

                                                    </div>

                                                    <div className="flex items-center gap-2 rounded-xl border border-[#C8B1E4]/30 bg-white px-4 py-2.5">

                                                        <ClipboardList
                                                            size={16}
                                                            className="text-[#9B72CF]"
                                                        />

                                                        <span className="text-xs font-semibold text-[#806F8F]">
                                                            {
                                                                reportTasks.length
                                                            }{" "}
                                                            Total Tasks
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </motion.div>
                                    )}

                                </AnimatePresence>

                            </motion.div>
                        );
                    })}

            </div>

        </div>
    );
}

export default EODHistory;