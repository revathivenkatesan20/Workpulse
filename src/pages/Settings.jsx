import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Building2,
    Bell,
    Lock,
    Eye,
    EyeOff,
    Save,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ShieldCheck,
} from "lucide-react";

import {
    apiGet,
    apiPut,
} from "../services/api";

const DEFAULT_PREFERENCES = {
    eodReminders: true,
    eodUpdates: true,
    systemNotifications: true,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SPECIAL_CHARACTER_REGEX =
    /[!@#$%^&*(),.?":{}|<>_\-\\[\]`~+=;' ]/;

const getStoredEmployee = () => {
    try {
        const storedEmployee =
            localStorage.getItem("workpulse_current_employee");

        if (!storedEmployee) {
            return null;
        }

        return JSON.parse(storedEmployee);
    } catch (error) {
        return null;
    }
};

const getEmployeeCode = employee => {
    return (
        employee?.employeeCode ||
        localStorage.getItem(
            "workpulse_current_employee_code"
        ) ||
        ""
    ).trim();
};

const normalizePreferences = data => {
    return {
        eodReminders:
            data?.eodReminders !== undefined
                ? Boolean(data.eodReminders)
                : true,

        eodUpdates:
            data?.eodUpdates !== undefined
                ? Boolean(data.eodUpdates)
                : true,

        systemNotifications:
            data?.systemNotifications !== undefined
                ? Boolean(data.systemNotifications)
                : true,
    };
};

const Settings = () => {
    const [currentEmployee, setCurrentEmployee] =
        useState(() => getStoredEmployee());

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
    });

    const [preferences, setPreferences] = useState(
        DEFAULT_PREFERENCES
    );

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] =
        useState(false);

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] =
        useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    // =========================================================
    // LOAD EMPLOYEE + NOTIFICATION PREFERENCES
    // =========================================================

    useEffect(() => {
        const employee = getStoredEmployee();

        setCurrentEmployee(employee);

        if (!employee) {
            setIsLoading(false);
            setErrorMessage(
                "Unable to find your employee information. Please log in again."
            );
            return;
        }

        setFormData({
            name: employee.name || "",
            email: employee.email || "",
            phone: employee.phone || "",
            department: employee.department || "",
        });

        const employeeCode = getEmployeeCode(employee);

        if (!employeeCode) {
            setIsLoading(false);
            setErrorMessage(
                "Employee code is missing. Please contact HR/Admin."
            );
            return;
        }

        const loadPreferences = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const data = await apiGet(
                    `/notification-preferences/${encodeURIComponent(
                        employeeCode
                    )}`
                );

                const normalized =
                    normalizePreferences(data);

                setPreferences(normalized);

                // Keep localStorage as a fallback/cache.
                localStorage.setItem(
                    "workpulse_notification_preferences",
                    JSON.stringify(normalized)
                );
            } catch (error) {

                /*
                 * Backend is the primary source.
                 * If it is temporarily unavailable, use
                 * previously stored preferences as fallback.
                 */

                try {
                    const stored =
                        localStorage.getItem(
                            "workpulse_notification_preferences"
                        );

                    if (stored) {
                        const parsed = JSON.parse(stored);

                        setPreferences(
                            normalizePreferences(parsed)
                        );
                    }
                } catch (storageError) {
                }

                setErrorMessage(
                    "Unable to load notification preferences. Please try again."
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, []);

    // =========================================================
    // FORM HANDLERS
    // =========================================================

    const handleInputChange = event => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value,
        }));

        setErrors(previous => ({
            ...previous,
            [name]: "",
        }));

        setSuccessMessage("");
        setErrorMessage("");
    };

    const handlePreferenceChange = preferenceName => {
        setPreferences(previous => ({
            ...previous,
            [preferenceName]:
                !previous[preferenceName],
        }));

        setSuccessMessage("");
        setErrorMessage("");
    };

    // =========================================================
    // PROFILE VALIDATION
    // =========================================================

    const validateProfile = () => {
        const newErrors = {};

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const phone = formData.phone.trim();

        if (!name) {
            newErrors.name =
                "Please enter your name.";
        } else if (name.length < 2) {
            newErrors.name =
                "Name must contain at least 2 characters.";
        }

        if (!email) {
            newErrors.email =
                "Please enter your email address.";
        } else if (!EMAIL_REGEX.test(email)) {
            newErrors.email =
                "Please enter a valid email address.";
        }

        if (phone) {
            const cleanedPhone =
                phone.replace(/[\s()-]/g, "");

            if (!/^\+?\d{10,15}$/.test(cleanedPhone)) {
                newErrors.phone =
                    "Please enter a valid phone number.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =========================================================
    // SAVE PROFILE + NOTIFICATION PREFERENCES
    // =========================================================

    const handleSave = async event => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!currentEmployee) {
            setErrorMessage(
                "Employee information is unavailable. Please log in again."
            );
            return;
        }

        if (!validateProfile()) {
            return;
        }

        const employeeCode =
            getEmployeeCode(currentEmployee);

        if (!employeeCode) {
            setErrorMessage(
                "Employee code is missing. Please contact HR/Admin."
            );
            return;
        }

        if (!currentEmployee.id) {
            setErrorMessage(
                "Employee ID is missing. Please log in again."
            );
            return;
        }

        setIsSaving(true);

        try {
            // -------------------------------------------------
            // UPDATE EMPLOYEE PROFILE
            // -------------------------------------------------

            const profilePayload = {
                name: formData.name.trim(),
                email: formData.email
                    .trim()
                    .toLowerCase(),
                phone: formData.phone.trim(),
                department:
                    formData.department.trim(),
            };

            const updatedEmployee =
                await apiPut(
                    `/employees/${currentEmployee.id}`,
                    profilePayload
                );

            // -------------------------------------------------
            // UPDATE NOTIFICATION PREFERENCES
            // -------------------------------------------------

            const updatedPreferences =
                await apiPut(
                    `/notification-preferences/${encodeURIComponent(
                        employeeCode
                    )}`,
                    {
                        eodReminders:
                            preferences.eodReminders,

                        eodUpdates:
                            preferences.eodUpdates,

                        systemNotifications:
                            preferences.systemNotifications,
                    }
                );

            const normalizedPreferences =
                normalizePreferences(
                    updatedPreferences
                );

            // -------------------------------------------------
            // UPDATE LOCAL STORAGE
            // -------------------------------------------------

            const employeeToStore = {
                ...currentEmployee,
                ...(updatedEmployee || {}),
                name: updatedEmployee?.name ||
                    profilePayload.name,

                email: updatedEmployee?.email ||
                    profilePayload.email,

                phone: updatedEmployee?.phone ??
                    profilePayload.phone,

                department:
                    updatedEmployee?.department ??
                    profilePayload.department,
            };

            localStorage.setItem(
                "workpulse_current_employee",
                JSON.stringify(employeeToStore)
            );

            localStorage.setItem(
                "workpulse_current_employee_code",
                employeeToStore.employeeCode ||
                employeeCode
            );

            localStorage.setItem(
                "workpulse_notification_preferences",
                JSON.stringify(
                    normalizedPreferences
                )
            );

            setCurrentEmployee(employeeToStore);
            setPreferences(
                normalizedPreferences
            );

            setFormData({
                name: employeeToStore.name || "",
                email: employeeToStore.email || "",
                phone: employeeToStore.phone || "",
                department:
                    employeeToStore.department || "",
            });

            setSuccessMessage(
                "Your settings have been saved successfully."
            );
        } catch (error) {
           setErrorMessage(
                "Unable to save your settings. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    // =========================================================
    // PASSWORD VALIDATION
    // =========================================================

    const validatePassword = () => {
        const newErrors = {};

        const currentPassword =
            passwordData.currentPassword;

        const newPassword =
            passwordData.newPassword;

        const confirmPassword =
            passwordData.confirmPassword;

        if (!currentPassword) {
            newErrors.currentPassword =
                "Please enter your current password.";
        }

        if (!newPassword) {
            newErrors.newPassword =
                "Please enter a new password.";
        } else if (newPassword.length < 8) {
            newErrors.newPassword =
                "Password must contain at least 8 characters.";
        } else if (
            !/[A-Z]/.test(newPassword)
        ) {
            newErrors.newPassword =
                "Password must contain at least one uppercase letter.";
        } else if (
            !/[a-z]/.test(newPassword)
        ) {
            newErrors.newPassword =
                "Password must contain at least one lowercase letter.";
        } else if (
            !/\d/.test(newPassword)
        ) {
            newErrors.newPassword =
                "Password must contain at least one number.";
        } else if (
            !SPECIAL_CHARACTER_REGEX.test(
                newPassword
            )
        ) {
            newErrors.newPassword =
                "Password must contain at least one special character.";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your new password.";
        } else if (
            newPassword !== confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match.";
        }

        if (
            currentPassword &&
            newPassword &&
            currentPassword === newPassword
        ) {
            newErrors.newPassword =
                "New password must be different from your current password.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =========================================================
    // PASSWORD INPUT
    // =========================================================

    const handlePasswordChange = event => {
        const { name, value } = event.target;

        setPasswordData(previous => ({
            ...previous,
            [name]: value,
        }));

        setErrors(previous => ({
            ...previous,
            [name]: "",
        }));

        setErrorMessage("");
        setSuccessMessage("");
    };

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    const handleChangePassword = async event => {
        event.preventDefault();

        setErrors({});
        setErrorMessage("");
        setSuccessMessage("");

        if (!currentEmployee?.id) {
            setErrorMessage(
                "Employee information is unavailable. Please log in again."
            );
            return;
        }

        if (!validatePassword()) {
            return;
        }

        setIsChangingPassword(true);

        try {
            await apiPut(
                `/employees/${currentEmployee.id}/change-password`,
                {
                    currentPassword:
                        passwordData.currentPassword,

                    newPassword:
                        passwordData.newPassword,
                }
            );

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setShowPasswordModal(false);

            setSuccessMessage(
                "Your password has been changed successfully."
            );
        } catch (error) {
            setErrorMessage(
                "Unable to change your password. Please try again."
            );
        } finally {
            setIsChangingPassword(false);
        }
    };

    // =========================================================
    // CLOSE PASSWORD MODAL
    // =========================================================

    const closePasswordModal = () => {
        if (isChangingPassword) {
            return;
        }

        setShowPasswordModal(false);

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setErrors({});
    };

    // =========================================================
    // PASSWORD STRENGTH
    // =========================================================

    const passwordRequirements = [
        {
            label: "At least 8 characters",
            valid:
                passwordData.newPassword.length >= 8,
        },
        {
            label: "One uppercase letter",
            valid:
                /[A-Z]/.test(
                    passwordData.newPassword
                ),
        },
        {
            label: "One lowercase letter",
            valid:
                /[a-z]/.test(
                    passwordData.newPassword
                ),
        },
        {
            label: "One number",
            valid:
                /\d/.test(
                    passwordData.newPassword
                ),
        },
        {
            label: "One special character",
            valid:
                SPECIAL_CHARACTER_REGEX.test(
                    passwordData.newPassword
                ),
        },
    ];

    // =========================================================
    // LOADING STATE
    // =========================================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F4EFFA] flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4 text-[#2F184B]">
                    <Loader2
                        size={36}
                        className="animate-spin"
                    />

                    <p className="text-sm font-medium">
                        Loading your settings...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="min-h-screen bg-[#F4EFFA] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 15,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                    >
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#2F184B]">
                            Settings
                        </h1>

                        <p className="mt-2 text-sm sm:text-base text-[#532B88]/70">
                            Manage your profile,
                            notification preferences
                            and account security.
                        </p>
                    </motion.div>
                </div>

                {/* =================================================
                    ALERTS
                ================================================= */}

                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                            }}
                            className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700"
                        >
                            <CheckCircle2
                                size={20}
                                className="mt-0.5 shrink-0"
                            />

                            <p className="text-sm font-medium">
                                {successMessage}
                            </p>
                        </motion.div>
                    )}

                    {errorMessage && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                            }}
                            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
                        >
                            <AlertCircle
                                size={20}
                                className="mt-0.5 shrink-0"
                            />

                            <p className="text-sm font-medium">
                                {errorMessage}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* =================================================
                        PROFILE
                    ================================================= */}

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
                            delay: 0.05,
                        }}
                        className="lg:col-span-2"
                    >
                        <form
                            onSubmit={handleSave}
                            className="rounded-3xl border border-[#C8B1E4]/60 bg-white p-5 shadow-sm sm:p-7"
                        >
                            <div className="mb-7 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#532B88]">
                                    <User size={23} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        Profile Information
                                    </h2>

                                    <p className="text-sm text-[#532B88]/60">
                                        Update your personal
                                        information.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                {/* NAME */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Full Name
                                    </label>

                                    <div className="relative">
                                        <User
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                formData.name
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter your name"
                                            className={`w-full rounded-xl border ${errors.name
                                                    ? "border-red-400"
                                                    : "border-[#C8B1E4]"
                                                } bg-white py-3 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40`}
                                        />
                                    </div>

                                    {errors.name && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* EMAIL */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Email Address
                                    </label>

                                    <div className="relative">
                                        <Mail
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter your email"
                                            className={`w-full rounded-xl border ${errors.email
                                                    ? "border-red-400"
                                                    : "border-[#C8B1E4]"
                                                } bg-white py-3 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40`}
                                        />
                                    </div>

                                    {errors.email && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* PHONE */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Phone Number
                                    </label>

                                    <div className="relative">
                                        <Phone
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter your phone number"
                                            className={`w-full rounded-xl border ${errors.phone
                                                    ? "border-red-400"
                                                    : "border-[#C8B1E4]"
                                                } bg-white py-3 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40`}
                                        />
                                    </div>

                                    {errors.phone && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* DEPARTMENT */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Department
                                    </label>

                                    <div className="relative">
                                        <Building2
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="text"
                                            name="department"
                                            value={
                                                formData.department
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter your department"
                                            className="w-full rounded-xl border border-[#C8B1E4] bg-white py-3 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* EMPLOYEE CODE */}

                            <div className="mt-5 rounded-2xl bg-[#F4EFFA] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-[#532B88]/60">
                                            Employee Code
                                        </p>

                                        <p className="mt-1 font-bold text-[#2F184B]">
                                            {getEmployeeCode(
                                                currentEmployee
                                            ) ||
                                                "Not available"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#532B88]">
                                        <ShieldCheck
                                            size={15}
                                        />

                                        {currentEmployee?.accountRole ||
                                            "EMPLOYEE"}
                                    </div>
                                </div>
                            </div>

                            {/* SAVE */}

                            <div className="mt-7 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F184B] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save
                                                size={18}
                                            />

                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* =================================================
                        SECURITY
                    ================================================= */}

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
                            delay: 0.1,
                        }}
                        className="space-y-6"
                    >
                        <div className="rounded-3xl border border-[#C8B1E4]/60 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#532B88]">
                                    <Lock size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        Security
                                    </h2>

                                    <p className="text-sm text-[#532B88]/60">
                                        Protect your account.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-[#F4EFFA] p-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck
                                        size={20}
                                        className="mt-0.5 text-[#532B88]"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-[#2F184B]">
                                            Password Security
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[#532B88]/65">
                                            Use a strong password
                                            containing uppercase,
                                            lowercase, numbers and
                                            special characters.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPasswordModal(
                                        true
                                    )
                                }
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#C8B1E4] px-4 py-3 text-sm font-semibold text-[#532B88] transition hover:bg-[#F4EFFA]"
                            >
                                <Lock size={17} />

                                Change Password
                            </button>
                        </div>

                        {/* =================================================
                            NOTIFICATIONS
                        ================================================= */}

                        <div className="rounded-3xl border border-[#C8B1E4]/60 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4EFFA] text-[#532B88]">
                                    <Bell size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-[#2F184B]">
                                        Notifications
                                    </h2>

                                    <p className="text-sm text-[#532B88]/60">
                                        Choose what you receive.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">

                                {/* EOD REMINDERS */}

                                <label className="flex cursor-pointer items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2F184B]">
                                            EOD Reminders
                                        </p>

                                        <p className="mt-0.5 text-xs text-[#532B88]/60">
                                            Reminders to submit
                                            your EOD report.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                            preferences.eodReminders
                                        }
                                        onClick={() =>
                                            handlePreferenceChange(
                                                "eodReminders"
                                            )
                                        }
                                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${preferences.eodReminders
                                                ? "bg-[#532B88]"
                                                : "bg-[#C8B1E4]"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${preferences.eodReminders
                                                    ? "left-6"
                                                    : "left-1"
                                                }`}
                                        />
                                    </button>
                                </label>

                                {/* EOD UPDATES */}

                                <label className="flex cursor-pointer items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2F184B]">
                                            EOD Updates
                                        </p>

                                        <p className="mt-0.5 text-xs text-[#532B88]/60">
                                            Updates related to
                                            your EOD reports.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                            preferences.eodUpdates
                                        }
                                        onClick={() =>
                                            handlePreferenceChange(
                                                "eodUpdates"
                                            )
                                        }
                                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${preferences.eodUpdates
                                                ? "bg-[#532B88]"
                                                : "bg-[#C8B1E4]"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${preferences.eodUpdates
                                                    ? "left-6"
                                                    : "left-1"
                                                }`}
                                        />
                                    </button>
                                </label>

                                {/* SYSTEM NOTIFICATIONS */}

                                <label className="flex cursor-pointer items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2F184B]">
                                            System Notifications
                                        </p>

                                        <p className="mt-0.5 text-xs text-[#532B88]/60">
                                            Important WorkPulse
                                            system notifications.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                            preferences.systemNotifications
                                        }
                                        onClick={() =>
                                            handlePreferenceChange(
                                                "systemNotifications"
                                            )
                                        }
                                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${preferences.systemNotifications
                                                ? "bg-[#532B88]"
                                                : "bg-[#C8B1E4]"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${preferences.systemNotifications
                                                    ? "left-6"
                                                    : "left-1"
                                                }`}
                                        />
                                    </button>
                                </label>
                            </div>

                            <div className="mt-5 rounded-xl border border-[#C8B1E4]/50 bg-[#F4EFFA]/60 px-3 py-2.5">
                                <p className="text-xs leading-5 text-[#532B88]/70">
                                    Notification preferences are
                                    saved when you click{" "}
                                    <span className="font-semibold">
                                        Save Changes
                                    </span>
                                    .
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* =========================================================
                CHANGE PASSWORD MODAL
            ========================================================= */}

            <AnimatePresence>
                {showPasswordModal && (
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F184B]/50 p-4 backdrop-blur-sm"
                        onMouseDown={event => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closePasswordModal();
                            }
                        }}
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: 15,
                            }}
                            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
                        >
                            {/* MODAL HEADER */}

                            <div className="flex items-center justify-between border-b border-[#C8B1E4]/50 px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                        <Lock
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-[#2F184B]">
                                            Change Password
                                        </h2>

                                        <p className="text-xs text-[#532B88]/60">
                                            Keep your account
                                            secure.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closePasswordModal
                                    }
                                    disabled={
                                        isChangingPassword
                                    }
                                    className="rounded-lg p-2 text-[#532B88]/60 transition hover:bg-[#F4EFFA] hover:text-[#2F184B] disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* MODAL BODY */}

                            <form
                                onSubmit={
                                    handleChangePassword
                                }
                                className="space-y-5 p-5 sm:p-6"
                            >
                                {/* CURRENT PASSWORD */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Current Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={
                                                showCurrentPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="currentPassword"
                                            value={
                                                passwordData.currentPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            autoComplete="current-password"
                                            placeholder="Enter current password"
                                            className={`w-full rounded-xl border ${errors.currentPassword
                                                    ? "border-red-400"
                                                    : "border-[#C8B1E4]"
                                                } bg-white py-3 pl-4 pr-11 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCurrentPassword(
                                                    previous =>
                                                        !previous
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff
                                                    size={18}
                                                />
                                            ) : (
                                                <Eye
                                                    size={18}
                                                />
                                            )}
                                        </button>
                                    </div>

                                    {errors.currentPassword && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {
                                                errors.currentPassword
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* NEW PASSWORD */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        New Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="newPassword"
                                            value={
                                                passwordData.newPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                            className={`w-full rounded-xl border ${errors.newPassword
                                                    ? "border-red-400"
                                                    : "border-[#C8B1E4]"
                                                } bg-white py-3 pl-4 pr-11 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    previous =>
                                                        !previous
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff
                                                    size={18}
                                                />
                                            ) : (
                                                <Eye
                                                    size={18}
                                                />
                                            )}
                                        </button>
                                    </div>

                                    {errors.newPassword && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {
                                                errors.newPassword
                                            }
                                        </p>
                                    )}

                                    {/* PASSWORD REQUIREMENTS */}

                                    <div className="mt-3 rounded-xl bg-[#F4EFFA] p-3">
                                        <p className="mb-2 text-xs font-semibold text-[#2F184B]">
                                            Password requirements
                                        </p>

                                        <div className="grid grid-cols-1 gap-1">
                                            {passwordRequirements.map(
                                                requirement => (
                                                    <div
                                                        key={
                                                            requirement.label
                                                        }
                                                        className="flex items-center gap-2"
                                                    >
                                                        <CheckCircle2
                                                            size={
                                                                14
                                                            }
                                                            className={
                                                                requirement.valid
                                                                    ? "text-green-600"
                                                                    : "text-[#C8B1E4]"
                                                            }
                                                        />

                                                        <span
                                                            className={`text-xs ${requirement.valid
                                                                    ? "text-green-700"
                                                                    : "text-[#532B88]/60"
                                                                }`}
                                                        >
                                                            {
                                                                requirement.label
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* CONFIRM PASSWORD */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2F184B]">
                                        Confirm New Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            value={
                                                passwordData.confirmPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            autoComplete="new-password"
                                            placeholder="Confirm new password"
                                            className={`w-full rounded-xl border ${errors.confirmPassword
                                                    ? "border-red-400"
                                                    : "border-[#C8B1E4]"
                                                } bg-white py-3 pl-4 pr-11 text-sm text-[#2F184B] outline-none transition focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    previous =>
                                                        !previous
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff
                                                    size={18}
                                                />
                                            ) : (
                                                <Eye
                                                    size={18}
                                                />
                                            )}
                                        </button>
                                    </div>

                                    {errors.confirmPassword && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {
                                                errors.confirmPassword
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* MODAL ACTIONS */}

                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={
                                            closePasswordModal
                                        }
                                        disabled={
                                            isChangingPassword
                                        }
                                        className="rounded-xl border border-[#C8B1E4] px-5 py-3 text-sm font-semibold text-[#532B88] transition hover:bg-[#F4EFFA] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            isChangingPassword
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2F184B] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isChangingPassword ? (
                                            <>
                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />

                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck
                                                    size={18}
                                                />

                                                Update Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
