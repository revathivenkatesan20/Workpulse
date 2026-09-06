import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEOD } from "../context/EODContext";
import EODHistory from "../components/EODHistory";
import { useNotifications } from "../context/NotificationContext";

import {
    Plus,
    Trash2,
    Send,
    Copy,
    CalendarDays,
    Clock3,
    User,
    Building2,
    CheckCircle2,
    AlertCircle,
    Timer,
    ClipboardList,
    Mail,
    Pencil,
    Sparkles,
} from "lucide-react";

// --------------------------------------------------
// Create Task
// --------------------------------------------------

const createTask = () => ({
    id: Date.now() + Math.random(),
    description: "",
    status: "Completed",
    remarks: "",
});

// --------------------------------------------------
// Get today's date in local time
// --------------------------------------------------

const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// --------------------------------------------------
// Calculate working hours excluding 1 PM - 2 PM lunch
// --------------------------------------------------

const calculateWorkingHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) {
        return "";
    }

    const [inHour, inMinute] = timeIn.split(":").map(Number);
    const [outHour, outMinute] = timeOut.split(":").map(Number);

    const start = new Date();
    start.setHours(inHour, inMinute, 0, 0);

    const end = new Date();
    end.setHours(outHour, outMinute, 0, 0);

    if (end <= start) {
        return null;
    }

    let totalMinutes = (end - start) / (1000 * 60);

    // Lunch break: 1 PM - 2 PM
    const lunchStart = new Date();
    lunchStart.setHours(13, 0, 0, 0);

    const lunchEnd = new Date();
    lunchEnd.setHours(14, 0, 0, 0);

    const overlapStart = Math.max(
        start.getTime(),
        lunchStart.getTime()
    );

    const overlapEnd = Math.min(
        end.getTime(),
        lunchEnd.getTime()
    );

    if (overlapEnd > overlapStart) {
        totalMinutes -=
            (overlapEnd - overlapStart) / (1000 * 60);
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return `${hours}h ${minutes}m`;
};

// --------------------------------------------------
// Animation
// --------------------------------------------------

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 22,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

// --------------------------------------------------
// My EOD
// --------------------------------------------------

function MyEOD() {
    const {
        eodReports,
        addEODReport,
        updateEODReport,
    } = useEOD();

    const { addNotification } = useNotifications();

    // --------------------------------------------------
    // Current employee
    // --------------------------------------------------

    const currentEmployee = JSON.parse(
        localStorage.getItem(
            "workpulse_current_employee"
        ) || "null"
    );

    const currentEmployeeCode =
        currentEmployee?.employeeCode || "";

    // --------------------------------------------------
    // Form
    // --------------------------------------------------

    const [formData, setFormData] = useState({
        employeeName: currentEmployee?.name || "",
        department: currentEmployee?.department || "",
        date: getTodayDate(),
        timeIn: "09:30",
        timeOut: "17:00",
    });

    const [tasks, setTasks] = useState([
        createTask(),
    ]);

    const [errors, setErrors] = useState({});

    const [submitted, setSubmitted] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [submitMessage, setSubmitMessage] = useState("");

    const [emailContent, setEmailContent] = useState("");

    const [emailCopied, setEmailCopied] = useState(false);

    // --------------------------------------------------
    // Working Hours
    // --------------------------------------------------

    const workingHours = calculateWorkingHours(
        formData.timeIn,
        formData.timeOut
    );

    // --------------------------------------------------
    // Form Change
    // --------------------------------------------------

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setSubmitted(false);
        setSubmitMessage("");
    };

    // --------------------------------------------------
    // Task Change
    // --------------------------------------------------

    const handleTaskChange = (id, field, value) => {
        setTasks((previousTasks) =>
            previousTasks.map((task) =>
                task.id === id
                    ? {
                          ...task,
                          [field]: value,
                      }
                    : task
            )
        );

        setErrors((previous) => ({
            ...previous,
            tasks: "",
        }));

        setSubmitted(false);
        setSubmitMessage("");
    };

    // --------------------------------------------------
    // Add Task
    // --------------------------------------------------

    const addTask = () => {
        setTasks((previousTasks) => [
            ...previousTasks,
            createTask(),
        ]);
    };

    // --------------------------------------------------
    // Remove Task
    // --------------------------------------------------

    const removeTask = (id) => {
        if (tasks.length === 1) {
            return;
        }

        setTasks((previousTasks) =>
            previousTasks.filter(
                (task) => task.id !== id
            )
        );
    };

    // --------------------------------------------------
    // Validate
    // --------------------------------------------------

    const validateForm = () => {
        const newErrors = {};

        if (!formData.employeeName.trim()) {
            newErrors.employeeName =
                "Employee name is required.";
        }

        if (!formData.department) {
            newErrors.department =
                "Department is required.";
        }

        if (!formData.date) {
            newErrors.date =
                "Please select a date.";
        }

        if (!formData.timeIn) {
            newErrors.timeIn =
                "Please enter Time In.";
        }

        if (!formData.timeOut) {
            newErrors.timeOut =
                "Please enter Time Out.";
        }

        if (
            formData.timeIn &&
            formData.timeOut &&
            workingHours === null
        ) {
            newErrors.timeOut =
                "Time Out must be later than Time In.";
        }

        const invalidTask = tasks.some(
            (task) => !task.description.trim()
        );

        if (invalidTask) {
            newErrors.tasks =
                "Please enter a description for every task.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // --------------------------------------------------
    // Edit Today's EOD
    // --------------------------------------------------

    const handleEditEOD = () => {
        const existingReport = eodReports.find(
            (report) =>
                report.employeeCode ===
                    currentEmployeeCode &&
                report.date === formData.date
        );

        if (!existingReport) {
            return;
        }

        setFormData({
            employeeName:
                existingReport.employeeName,
            department:
                existingReport.department,
            date: existingReport.date,
            timeIn: existingReport.timeIn,
            timeOut: existingReport.timeOut,
        });

        setTasks(
            existingReport.tasks || [createTask()]
        );

        setIsEditing(true);
        setSubmitted(false);
        setSubmitMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // --------------------------------------------------
    // Generate Email
    // --------------------------------------------------

    const generateEmailContent = (report) => {
        const formattedDate = new Date(
            `${report.date}T00:00:00`
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const formatTime = (time) => {
            if (!time) return "";

            const [hour, minute] = time.split(":");

            const date = new Date();

            date.setHours(
                Number(hour),
                Number(minute)
            );

            return date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        };

        const taskDetails = report.tasks
            .map(
                (task, index) =>
                    `${index + 1}. ${task.description}
   Status: ${task.status}
   Remarks: ${task.remarks || "N/A"}`
            )
            .join("\n\n");

        return `Subject: EOD Report - ${report.employeeName} - ${formattedDate}

Dear Sir/Madam,

Please find below my End of Day report.

Employee Name: ${report.employeeName}
Department: ${report.department}
Date: ${formattedDate}
Time In: ${formatTime(report.timeIn)}
Time Out: ${formatTime(report.timeOut)}
Total Working Hours: ${report.totalWorkingHours}

Today's Tasks:

${taskDetails}

Regards,
${report.employeeName}`;
    };

    // --------------------------------------------------
    // Copy Email
    // --------------------------------------------------

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(
                emailContent
            );

            setEmailCopied(true);

            setTimeout(() => {
                setEmailCopied(false);
            }, 2000);
        } catch (error) {
            console.error(
                "Failed to copy email:",
                error
            );
        }
    };

    // --------------------------------------------------
    // Submit EOD
    // --------------------------------------------------

    const handleSubmit = (e) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        if (
            !currentEmployee ||
            !currentEmployeeCode
        ) {
            setSubmitMessage(
                "Employee information is not available."
            );
            return;
        }

        const existingReport = eodReports.find(
            (report) =>
                report.employeeCode ===
                    currentEmployeeCode &&
                report.date === formData.date
        );

        // ----------------------------------------------
        // UPDATE
        // ----------------------------------------------

        if (
            isEditing &&
            existingReport
        ) {
            const updatedReport = {
                ...existingReport,
                employeeCode:
                    currentEmployeeCode,
                employeeName:
                    currentEmployee.name,
                department:
                    currentEmployee.department,
                date: formData.date,
                timeIn: formData.timeIn,
                timeOut: formData.timeOut,
                totalWorkingHours:
                    workingHours,
                tasks,
                updatedAt:
                    new Date().toISOString(),
            };

            updateEODReport(updatedReport);

            setEmailContent(
                generateEmailContent(
                    updatedReport
                )
            );

            setEmailCopied(false);

            addNotification({
                employeeCode:
                    currentEmployeeCode,
                type: "EOD_UPDATED",
                title:
                    "EOD Updated Successfully",
                message:
                    `${currentEmployee.name} updated the EOD report for ${formData.date} successfully.`,
            });

            setSubmitted(true);

            setSubmitMessage(
                "EOD updated successfully!"
            );

            setIsEditing(false);

            return;
        }

        // ----------------------------------------------
        // PREVENT DUPLICATE
        // ----------------------------------------------

        if (existingReport) {
            setSubmitted(true);

            setSubmitMessage(
                "Today's EOD is already submitted."
            );

            return;
        }

        // ----------------------------------------------
        // CREATE
        // ----------------------------------------------

        const eodData = {
            id: Date.now(),
            employeeCode:
                currentEmployeeCode,
            employeeName:
                currentEmployee.name,
            department:
                currentEmployee.department,
            date: formData.date,
            timeIn: formData.timeIn,
            timeOut: formData.timeOut,
            totalWorkingHours:
                workingHours,
            tasks,
            submittedAt:
                new Date().toISOString(),
        };

        addEODReport(eodData);

        addNotification({
            employeeCode:
                currentEmployeeCode,
            type: "EOD_SUBMITTED",
            title:
                "EOD Submitted Successfully",
            message:
                `${currentEmployee.name} submitted an EOD report for ${formData.date} successfully.`,
        });

        setEmailContent(
            generateEmailContent(eodData)
        );

        setEmailCopied(false);

        setSubmitted(true);

        setSubmitMessage(
            "EOD submitted successfully!"
        );
    };

    // --------------------------------------------------
    // Task Counts
    // --------------------------------------------------

    const completedTasks = tasks.filter(
        (task) => task.status === "Completed"
    ).length;

    const taskProgress =
        tasks.length > 0
            ? Math.round(
                  (completedTasks /
                      tasks.length) *
                      100
              )
            : 0;

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* Ambient Background */}

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

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#532B88] text-white shadow-lg shadow-[#532B88]/20">
                                    <ClipboardList
                                        size={18}
                                    />
                                </div>

                                <span className="text-sm font-semibold text-[#806F8F]">
                                    Daily Report
                                </span>

                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-[#2F184B] sm:text-4xl">
                                My EOD
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#69577A] sm:text-base">
                                Capture your workday, track your
                                progress, and generate your EOD
                                email in seconds.
                            </p>

                        </div>

                        {/* Progress Mini Card */}

                        <div className="flex items-center gap-3 rounded-2xl border border-[#C8B1E4]/50 bg-white/70 px-4 py-3 shadow-[0_10px_35px_rgba(47,24,75,0.07)] backdrop-blur-xl">

                            <div className="relative flex h-11 w-11 items-center justify-center">

                                <svg
                                    className="absolute h-full w-full -rotate-90"
                                    viewBox="0 0 44 44"
                                >

                                    <circle
                                        cx="22"
                                        cy="22"
                                        r="17"
                                        fill="none"
                                        stroke="#F4EFFA"
                                        strokeWidth="4"
                                    />

                                    <motion.circle
                                        cx="22"
                                        cy="22"
                                        r="17"
                                        fill="none"
                                        stroke="#532B88"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray="107"
                                        initial={{
                                            strokeDashoffset: 107,
                                        }}
                                        animate={{
                                            strokeDashoffset:
                                                107 -
                                                (107 *
                                                    taskProgress) /
                                                    100,
                                        }}
                                        transition={{
                                            duration: 0.8,
                                        }}
                                    />

                                </svg>

                                <span className="text-[10px] font-bold text-[#532B88]">
                                    {taskProgress}%
                                </span>

                            </div>

                            <div>

                                <p className="text-xs font-medium text-[#806F8F]">
                                    Task progress
                                </p>

                                <p className="text-sm font-bold text-[#2F184B]">
                                    {completedTasks}/
                                    {tasks.length} completed
                                </p>

                            </div>

                        </div>

                    </div>

                </motion.header>

                {/* ==========================================
                    STEP INDICATOR
                ========================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.1,
                    }}
                    className="mb-6 flex items-center justify-center"
                >

                    <div className="flex w-full max-w-2xl items-center">

                        <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#532B88] text-xs font-bold text-white">
                                1
                            </div>

                            <span className="hidden text-xs font-semibold text-[#532B88] sm:block">
                                Report Details
                            </span>

                        </div>

                        <div className="mx-3 h-px flex-1 bg-[#C8B1E4]" />

                        <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9B72CF]/20 text-xs font-bold text-[#532B88]">
                                2
                            </div>

                            <span className="hidden text-xs font-semibold text-[#806F8F] sm:block">
                                Tasks
                            </span>

                        </div>

                        <div className="mx-3 h-px flex-1 bg-[#C8B1E4]" />

                        <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9B72CF]/20 text-xs font-bold text-[#532B88]">
                                3
                            </div>

                            <span className="hidden text-xs font-semibold text-[#806F8F] sm:block">
                                Submit
                            </span>

                        </div>

                    </div>

                </motion.div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* ======================================
                        EMPLOYEE INFORMATION
                    ====================================== */}

                    <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="overflow-hidden rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl"
                    >

                        <div className="border-b border-[#C8B1E4]/30 px-5 py-5 sm:px-6">

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                    <User size={19} />
                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        Report Details
                                    </h2>

                                    <p className="mt-1 text-sm text-[#806F8F]">
                                        Your employee information and
                                        working hours.
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="p-5 sm:p-6">

                            <div className="grid gap-5 md:grid-cols-2">

                                {/* Employee */}

                                <div>

                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                        Employee
                                    </label>

                                    <div className="flex items-center gap-3 rounded-xl border border-[#C8B1E4]/40 bg-[#F4EFFA]/70 px-4 py-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#532B88] text-sm font-bold text-white">
                                            {currentEmployee?.name
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                                "U"}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-[#2F184B]">
                                                {currentEmployee?.name ||
                                                    "Employee"}
                                            </p>

                                            <p className="text-xs text-[#9B72CF]">
                                                {currentEmployeeCode ||
                                                    "No employee code"}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* Department */}

                                <div>

                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                        Department
                                    </label>

                                    <div className="flex items-center gap-3 rounded-xl border border-[#C8B1E4]/40 bg-[#F4EFFA]/70 px-4 py-3">

                                        <Building2
                                            size={18}
                                            className="shrink-0 text-[#9B72CF]"
                                        />

                                        <p className="truncate text-sm font-medium text-[#2F184B]">
                                            {currentEmployee?.department ||
                                                "Department"}
                                        </p>

                                    </div>

                                </div>

                                {/* Date */}

                                <div>

                                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                        <CalendarDays
                                            size={14}
                                        />
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleFormChange}
                                        className="w-full rounded-xl border border-[#C8B1E4]/50 bg-white px-4 py-3 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-4 focus:ring-[#532B88]/10"
                                    />

                                    {errors.date && (
                                        <p className="mt-2 text-xs font-medium text-[#532B88]">
                                            {errors.date}
                                        </p>
                                    )}

                                </div>

                                {/* Time In */}

                                <div>

                                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                        <Clock3
                                            size={14}
                                        />
                                        Time In
                                    </label>

                                    <input
                                        type="time"
                                        name="timeIn"
                                        value={formData.timeIn}
                                        onChange={handleFormChange}
                                        className={`w-full rounded-xl border ${
                                            errors.timeIn
                                                ? "border-[#532B88]"
                                                : "border-[#C8B1E4]/50"
                                        } bg-white px-4 py-3 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-4 focus:ring-[#532B88]/10`}
                                    />

                                    {errors.timeIn && (
                                        <p className="mt-2 text-xs font-medium text-[#532B88]">
                                            {errors.timeIn}
                                        </p>
                                    )}

                                </div>

                                {/* Time Out */}

                                <div>

                                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                        <Clock3
                                            size={14}
                                        />
                                        Time Out
                                    </label>

                                    <input
                                        type="time"
                                        name="timeOut"
                                        value={formData.timeOut}
                                        onChange={handleFormChange}
                                        className={`w-full rounded-xl border ${
                                            errors.timeOut
                                                ? "border-[#532B88]"
                                                : "border-[#C8B1E4]/50"
                                        } bg-white px-4 py-3 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-4 focus:ring-[#532B88]/10`}
                                    />

                                    {errors.timeOut && (
                                        <p className="mt-2 text-xs font-medium text-[#532B88]">
                                            {errors.timeOut}
                                        </p>
                                    )}

                                </div>

                                {/* Working Hours */}

                                <div className="md:col-span-2">

                                    <div className="relative overflow-hidden rounded-2xl border border-[#C8B1E4]/50 bg-gradient-to-br from-[#F4EFFA] to-white p-5">

                                        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#C8B1E4]/20 blur-2xl" />

                                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#532B88] text-white shadow-lg shadow-[#532B88]/20">
                                                    <Timer size={21} />
                                                </div>

                                                <div>

                                                    <p className="text-sm font-bold text-[#2F184B]">
                                                        Total Working Hours
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#806F8F]">
                                                        Automatically calculated
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="sm:text-right">

                                                <motion.p
                                                    key={workingHours}
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    className="text-3xl font-bold text-[#532B88]"
                                                >
                                                    {workingHours ||
                                                        "--"}
                                                </motion.p>

                                                <p className="mt-1 text-xs text-[#806F8F]">
                                                    Lunch break 1:00 PM –
                                                    2:00 PM excluded
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </motion.section>

                    {/* ======================================
                        TASKS
                    ====================================== */}

                    <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{
                            delay: 0.1,
                        }}
                        className="overflow-hidden rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl"
                    >

                        <div className="border-b border-[#C8B1E4]/30 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                        <ClipboardList
                                            size={19}
                                        />
                                    </div>

                                    <div>

                                        <h2 className="text-lg font-bold text-[#2F184B]">
                                            Today's Tasks
                                        </h2>

                                        <p className="mt-1 text-sm text-[#806F8F]">
                                            Record everything you worked on
                                            today.
                                        </p>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={addTask}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#F4EFFA] px-4 py-3 text-sm font-semibold text-[#532B88] transition hover:bg-[#532B88] hover:text-white sm:w-auto"
                                >

                                    <Plus
                                        size={18}
                                        className="transition-transform group-hover:rotate-90"
                                    />

                                    Add Task

                                </button>

                            </div>

                        </div>

                        <div className="p-5 sm:p-6">

                            {errors.tasks && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: -5,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    className="mb-5 flex items-center gap-2 rounded-xl border border-[#C8B1E4]/50 bg-[#F4EFFA] p-3 text-sm font-medium text-[#532B88]"
                                >

                                    <AlertCircle size={18} />

                                    {errors.tasks}

                                </motion.div>
                            )}

                            <div className="space-y-4">

                                <AnimatePresence mode="popLayout">

                                    {tasks.map(
                                        (
                                            task,
                                            index
                                        ) => (
                                            <motion.div
                                                key={task.id}
                                                layout
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                    scale: 0.98,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: "auto",
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    height: 0,
                                                    scale: 0.98,
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                }}
                                                className="overflow-hidden rounded-2xl border border-[#C8B1E4]/40 bg-[#F4EFFA]/45 p-4 sm:p-5"
                                            >

                                                <div className="mb-5 flex items-center justify-between">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#532B88] text-xs font-bold text-white">
                                                            {index + 1}
                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-bold text-[#2F184B]">
                                                                Task{" "}
                                                                {index + 1}
                                                            </p>

                                                            <p className="text-xs text-[#9B72CF]">
                                                                Daily work item
                                                            </p>

                                                        </div>

                                                    </div>

                                                    {tasks.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeTask(
                                                                    task.id
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-[#806F8F] transition hover:bg-[#532B88]/10 hover:text-[#532B88]"
                                                            aria-label={`Remove task ${
                                                                index + 1
                                                            }`}
                                                        >
                                                            <Trash2
                                                                size={18}
                                                            />
                                                        </button>
                                                    )}

                                                </div>

                                                <div className="grid gap-5 md:grid-cols-2">

                                                    {/* Description */}

                                                    <div className="md:col-span-2">

                                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                                            Task Description
                                                        </label>

                                                        <textarea
                                                            value={
                                                                task.description
                                                            }
                                                            onChange={(e) =>
                                                                handleTaskChange(
                                                                    task.id,
                                                                    "description",
                                                                    e.target.value
                                                                )
                                                            }
                                                            rows={3}
                                                            placeholder="What did you work on today?"
                                                            className="w-full resize-none rounded-xl border border-[#C8B1E4]/50 bg-white px-4 py-3 text-sm text-[#2F184B] placeholder:text-[#9B72CF]/60 outline-none transition focus:border-[#532B88] focus:ring-4 focus:ring-[#532B88]/10"
                                                        />

                                                    </div>

                                                    {/* Status */}

                                                    <div>

                                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                                            Status
                                                        </label>

                                                        <select
                                                            value={
                                                                task.status
                                                            }
                                                            onChange={(e) =>
                                                                handleTaskChange(
                                                                    task.id,
                                                                    "status",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-[#C8B1E4]/50 bg-white px-4 py-3 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-4 focus:ring-[#532B88]/10"
                                                        >

                                                            <option value="Completed">
                                                                Completed
                                                            </option>

                                                            <option value="In Progress">
                                                                In Progress
                                                            </option>

                                                            <option value="Pending">
                                                                Pending
                                                            </option>

                                                            <option value="Blocked">
                                                                Blocked
                                                            </option>

                                                        </select>

                                                    </div>

                                                    {/* Remarks */}

                                                    <div>

                                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                                                            Remarks
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                task.remarks
                                                            }
                                                            onChange={(e) =>
                                                                handleTaskChange(
                                                                    task.id,
                                                                    "remarks",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Additional remarks..."
                                                            className="w-full rounded-xl border border-[#C8B1E4]/50 bg-white px-4 py-3 text-sm text-[#2F184B] placeholder:text-[#9B72CF]/60 outline-none transition focus:border-[#532B88] focus:ring-4 focus:ring-[#532B88]/10"
                                                        />

                                                    </div>

                                                </div>

                                            </motion.div>
                                        )
                                    )}

                                </AnimatePresence>

                            </div>

                        </div>

                    </motion.section>

                    {/* ======================================
                        SUBMIT
                    ====================================== */}

                    <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{
                            delay: 0.2,
                        }}
                        className="overflow-hidden rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl sm:p-6"
                    >

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            <div>

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#532B88] text-white">
                                        <Sparkles size={19} />
                                    </div>

                                    <div>

                                        <h2 className="text-lg font-bold text-[#2F184B]">
                                            Ready to submit?
                                        </h2>

                                        <p className="mt-1 text-sm text-[#806F8F]">
                                            Save your EOD and generate your
                                            email automatically.
                                        </p>

                                    </div>

                                </div>

                                <AnimatePresence>

                                    {submitted &&
                                        submitMessage && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: 8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    y: 8,
                                                }}
                                                className="mt-4 flex items-center gap-2 rounded-xl bg-[#F4EFFA] px-4 py-3 text-sm font-semibold text-[#532B88]"
                                            >

                                                <CheckCircle2
                                                    size={18}
                                                />

                                                {submitMessage}

                                            </motion.div>
                                        )}

                                </AnimatePresence>

                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">

                                {submitted &&
                                    !isEditing && (
                                        <button
                                            type="button"
                                            onClick={
                                                handleEditEOD
                                            }
                                            className="flex items-center justify-center gap-2 rounded-xl border border-[#C8B1E4]/60 bg-white px-5 py-3 text-sm font-semibold text-[#532B88] transition hover:bg-[#F4EFFA]"
                                        >

                                            <Pencil size={17} />

                                            Edit Today's EOD

                                        </button>
                                    )}

                                <button
                                    type="submit"
                                    className="group flex items-center justify-center gap-2 rounded-xl bg-[#532B88] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#532B88]/20 transition hover:-translate-y-0.5 hover:bg-[#2F184B] active:translate-y-0"
                                >

                                    <Send
                                        size={18}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />

                                    {isEditing
                                        ? "Update EOD"
                                        : "Submit EOD"}

                                </button>

                            </div>

                        </div>

                    </motion.section>

                </form>

                {/* ==========================================
                    EMAIL
                ========================================== */}

                <AnimatePresence>

                    {emailContent && (
                        <motion.section
                            initial={{
                                opacity: 0,
                                y: 25,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: 15,
                            }}
                            transition={{
                                duration: 0.5,
                            }}
                            className="mt-6 overflow-hidden rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl"
                        >

                            <div className="border-b border-[#C8B1E4]/30 p-5 sm:p-6">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                            <Mail size={19} />
                                        </div>

                                        <div>

                                            <div className="flex items-center gap-2">

                                                <h2 className="text-lg font-bold text-[#2F184B]">
                                                    EOD Email
                                                </h2>

                                                <span className="rounded-full bg-[#532B88]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#532B88]">
                                                    Ready
                                                </span>

                                            </div>

                                            <p className="mt-1 text-sm text-[#806F8F]">
                                                Your report has been formatted
                                                and is ready to send.
                                            </p>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            handleCopyEmail
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#532B88]/20 transition hover:bg-[#2F184B] sm:w-auto"
                                    >

                                        {emailCopied ? (
                                            <>
                                                <CheckCircle2
                                                    size={17}
                                                />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={17} />
                                                Copy Email
                                            </>
                                        )}

                                    </button>

                                </div>

                            </div>

                            <div className="p-5 sm:p-6">

                                <div className="overflow-hidden rounded-2xl border border-[#C8B1E4]/40 bg-[#F4EFFA]/60">

                                    <div className="flex items-center gap-2 border-b border-[#C8B1E4]/30 px-4 py-3">

                                        <div className="h-2.5 w-2.5 rounded-full bg-[#C8B1E4]" />

                                        <div className="h-2.5 w-2.5 rounded-full bg-[#9B72CF]" />

                                        <div className="h-2.5 w-2.5 rounded-full bg-[#532B88]" />

                                        <span className="ml-2 text-xs font-medium text-[#806F8F]">
                                            EOD Report Preview
                                        </span>

                                    </div>

                                    <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words p-5 font-sans text-sm leading-7 text-[#2F184B]">
                                        {emailContent}
                                    </pre>

                                </div>

                            </div>

                        </motion.section>
                    )}

                </AnimatePresence>

                {/* ==========================================
                    HISTORY
                ========================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.4,
                    }}
                    className="mt-6"
                >
                    <EODHistory />
                </motion.div>

            </div>
        </main>
    );
}

export default MyEOD;