// src/pages/Settings.jsx

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Bell,
    Palette,
    ShieldCheck,
    Save,
    Mail,
    Phone,
    Briefcase,
    Lock,
    CheckCircle2,
} from "lucide-react";

function Settings() {
    const currentEmployee = JSON.parse(
        localStorage.getItem("workpulse_current_employee") || "null"
    );

    const [notifications, setNotifications] = useState({
        eodReminder: true,
        taskUpdates: true,
        systemNotifications: true,
    });

    const [theme, setTheme] = useState("light");

    const [showSuccess, setShowSuccess] = useState(false);

    const [profile, setProfile] = useState({
        name: currentEmployee?.name || "Revathi",
        email: currentEmployee?.email || "",
        phone: currentEmployee?.phone || "",
        department:
            currentEmployee?.department ||
            "Software Development Trainee",
    });

    const handleProfileChange = (field, value) => {
        setProfile((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSave = () => {
        if (!currentEmployee) {
            return;
        }

        /* --------------------------------
           UPDATED EMPLOYEE DETAILS
        --------------------------------- */

        const updatedEmployee = {
            ...currentEmployee,
            name: profile.name.trim(),
            email: profile.email.trim().toLowerCase(),
            phone: profile.phone.trim(),
            department: profile.department.trim(),
        };

        /* --------------------------------
           UPDATE CURRENT LOGGED-IN EMPLOYEE
        --------------------------------- */

        localStorage.setItem(
            "workpulse_current_employee",
            JSON.stringify(updatedEmployee)
        );

        /* --------------------------------
           UPDATE MASTER EMPLOYEE LIST
        --------------------------------- */

        try {
            const savedEmployees = JSON.parse(
                localStorage.getItem("workpulse_employees") || "[]"
            );

            if (Array.isArray(savedEmployees)) {
                const updatedEmployees = savedEmployees.map(
                    (employee) => {
                        const isCurrentEmployee =
                            employee.id === currentEmployee.id ||
                            employee.employeeCode?.toUpperCase() ===
                                currentEmployee.employeeCode?.toUpperCase() ||
                            employee.email?.toLowerCase() ===
                                currentEmployee.email?.toLowerCase();

                        if (!isCurrentEmployee) {
                            return employee;
                        }

                        return {
                            ...employee,
                            name: updatedEmployee.name,
                            email: updatedEmployee.email,
                            phone: updatedEmployee.phone,
                            department: updatedEmployee.department,
                        };
                    }
                );

                localStorage.setItem(
                    "workpulse_employees",
                    JSON.stringify(updatedEmployees)
                );

                /* --------------------------------
                   TELL EMPLOYEE CONTEXT TO REFRESH
                --------------------------------- */

                window.dispatchEvent(
                    new Event("workpulse_employees_updated")
                );
            }
        } catch (error) {
            console.error(
                "Failed to update employee list:",
                error
            );
        }

        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
        }, 2500);
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] p-4 sm:p-6 lg:p-8">
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
                    className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#C8B1E4]/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#9B72CF]/20 blur-3xl"
                />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 text-sm font-medium text-[#806F8F]">
                        <Palette size={16} />
                        Preferences
                    </div>

                    <h1 className="mt-1 text-3xl font-bold text-[#2F184B]">
                        Settings
                    </h1>

                    <p className="mt-2 text-sm text-[#806F8F]">
                        Manage your WorkPulse profile and preferences.
                    </p>
                </motion.div>

                {/* Success Message */}
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center gap-3 rounded-2xl border border-[#C8B1E4] bg-white/70 px-5 py-4 shadow-sm backdrop-blur-xl"
                    >
                        <CheckCircle2
                            size={20}
                            className="text-[#532B88]"
                        />

                        <p className="text-sm font-medium text-[#532B88]">
                            Settings saved successfully.
                        </p>
                    </motion.div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.618fr_1fr]">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Profile */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_20px_50px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#532B88] text-white">
                                    <User size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-[#2F184B]">
                                        Profile Information
                                    </h2>

                                    <p className="text-xs text-[#806F8F]">
                                        Update your employee details
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Full Name
                                    </label>

                                    <div className="relative">
                                        <User
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-[#C8B1E4]/70 bg-white/70 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Work Email
                                    </label>

                                    <div className="relative">
                                        <Mail
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-[#C8B1E4]/70 bg-white/70 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Phone Number
                                    </label>

                                    <div className="relative">
                                        <Phone
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="text"
                                            value={profile.phone}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-[#C8B1E4]/70 bg-white/70 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40"
                                        />
                                    </div>
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Department
                                    </label>

                                    <div className="relative">
                                        <Briefcase
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="text"
                                            value={profile.department}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "department",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-[#C8B1E4]/70 bg-white/70 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Notifications */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_20px_50px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C8B1E4]/50 text-[#532B88]">
                                    <Bell size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-[#2F184B]">
                                        Notifications
                                    </h2>

                                    <p className="text-xs text-[#806F8F]">
                                        Choose what notifications you receive
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <ToggleRow
                                    title="EOD Reminders"
                                    description="Receive reminders to submit your daily EOD."
                                    enabled={notifications.eodReminder}
                                    onChange={() =>
                                        setNotifications((previous) => ({
                                            ...previous,
                                            eodReminder:
                                                !previous.eodReminder,
                                        }))
                                    }
                                />

                                <ToggleRow
                                    title="Task Updates"
                                    description="Get notified about task and progress updates."
                                    enabled={notifications.taskUpdates}
                                    onChange={() =>
                                        setNotifications((previous) => ({
                                            ...previous,
                                            taskUpdates:
                                                !previous.taskUpdates,
                                        }))
                                    }
                                />

                                <ToggleRow
                                    title="System Notifications"
                                    description="Receive important WorkPulse updates."
                                    enabled={
                                        notifications.systemNotifications
                                    }
                                    onChange={() =>
                                        setNotifications((previous) => ({
                                            ...previous,
                                            systemNotifications:
                                                !previous.systemNotifications,
                                        }))
                                    }
                                />
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Account Card */}
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_20px_50px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#532B88] text-xl font-bold text-white">
                                    {profile.name
                                        ? profile.name
                                              .charAt(0)
                                              .toUpperCase()
                                        : "W"}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate font-bold text-[#2F184B]">
                                        {profile.name || "Employee"}
                                    </h3>

                                    <p className="truncate text-sm text-[#806F8F]">
                                        {profile.email ||
                                            "WorkPulse Employee"}
                                    </p>

                                    <span className="mt-2 inline-flex rounded-full bg-[#C8B1E4]/40 px-3 py-1 text-xs font-semibold text-[#532B88]">
                                        Active Employee
                                    </span>
                                </div>
                            </div>
                        </motion.section>

                        {/* Appearance */}
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_20px_50px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C8B1E4]/50 text-[#532B88]">
                                    <Palette size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-[#2F184B]">
                                        Appearance
                                    </h2>

                                    <p className="text-xs text-[#806F8F]">
                                        Customize your workspace
                                    </p>
                                </div>
                            </div>

                            <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                Theme
                            </label>

                            <select
                                value={theme}
                                onChange={(e) =>
                                    setTheme(e.target.value)
                                }
                                className="h-12 w-full rounded-xl border border-[#C8B1E4]/70 bg-white/70 px-4 text-sm font-medium text-[#2F184B] outline-none focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40"
                            >
                                <option value="light">
                                    Light
                                </option>
                                <option value="system">
                                    System Default
                                </option>
                            </select>
                        </motion.section>

                        {/* Security */}
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_20px_50px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C8B1E4]/50 text-[#532B88]">
                                    <ShieldCheck size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-[#2F184B]">
                                        Security
                                    </h2>

                                    <p className="text-xs text-[#806F8F]">
                                        Keep your account secure
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    alert(
                                        "Change password functionality will be available soon."
                                    )
                                }
                                className="flex w-full items-center justify-between rounded-xl border border-[#C8B1E4]/60 bg-white/60 px-4 py-3 text-left transition hover:border-[#9B72CF] hover:bg-[#F4EFFA]"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock
                                        size={18}
                                        className="text-[#532B88]"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-[#2F184B]">
                                            Change Password
                                        </p>

                                        <p className="text-xs text-[#806F8F]">
                                            Update your account password
                                        </p>
                                    </div>
                                </div>

                                <span className="text-[#9B72CF]">
                                    →
                                </span>
                            </button>
                        </motion.section>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleSave}
                            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#532B88] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#532B88]/20 transition hover:bg-[#2F184B]"
                        >
                            <Save size={19} />
                            Save Changes
                        </motion.button>
                    </div>
                </div>
            </div>
        </main>
    );
}

function ToggleRow({
    title,
    description,
    enabled,
    onChange,
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#C8B1E4]/50 bg-white/50 p-4">
            <div>
                <p className="text-sm font-semibold text-[#2F184B]">
                    {title}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#806F8F]">
                    {description}
                </p>
            </div>

            <button
                type="button"
                onClick={onChange}
                aria-label={`Toggle ${title}`}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled
                        ? "bg-[#532B88]"
                        : "bg-[#C8B1E4]"
                }`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        enabled
                            ? "left-6"
                            : "left-1"
                    }`}
                />
            </button>
        </div>
    );
}

export default Settings;