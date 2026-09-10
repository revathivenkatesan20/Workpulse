// src/pages/Register.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ClipboardCheck,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Phone,
    Sparkles,
    Target,
    User,
    Users,
} from "lucide-react";

import { apiPost } from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        employeeCode: "",
        department: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
            general: "",
        }));

        setSuccess("");
    };

    // =====================================================
    // VALIDATION
    // =====================================================

    const validateForm = () => {
        const fullName =
            formData.fullName.trim();

        const employeeCode =
            formData.employeeCode
                .trim()
                .toUpperCase();

        const department =
            formData.department.trim();

        const email =
            formData.email
                .trim()
                .toLowerCase();

        const phone =
            formData.phone.trim();

        const password =
            formData.password;

        const confirmPassword =
            formData.confirmPassword;

        const newErrors = {};

        // =================================================
        // REGEX
        // =================================================

        const nameRegex =
            /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/;

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        const phoneRegex =
            /^[6-9]\d{9}$/;

        const specialCharRegex =
            /[^A-Za-z0-9]/;

        // =================================================
        // FULL NAME
        // =================================================

        if (!fullName) {
            newErrors.fullName =
                "Please enter your full name.";
        } else if (fullName.length < 3) {
            newErrors.fullName =
                "Full name must contain at least 3 characters.";
        } else if (
            !nameRegex.test(fullName)
        ) {
            newErrors.fullName =
                "Use letters, spaces, hyphens or apostrophes only.";
        }

        // =================================================
        // EMPLOYEE CODE
        // =================================================

        if (!employeeCode) {
            newErrors.employeeCode =
                "Please enter your employee code.";
        } else if (
            !/^EMP\d{3,}$/.test(
                employeeCode
            )
        ) {
            newErrors.employeeCode =
                "Employee code must be in the format EMP001.";
        }

        // =================================================
        // DEPARTMENT
        // =================================================

        if (!department) {
            newErrors.department =
                "Please enter your department.";
        }

        // =================================================
        // EMAIL
        // =================================================

        if (!email) {
            newErrors.email =
                "Please enter your work email.";
        } else if (
            !emailRegex.test(email)
        ) {
            newErrors.email =
                "Please enter a valid email address.";
        }

        // =================================================
        // PHONE
        // =================================================

        if (!phone) {
            newErrors.phone =
                "Please enter your phone number.";
        } else if (
            !phoneRegex.test(phone)
        ) {
            newErrors.phone =
                "Please enter a valid 10-digit Indian mobile number.";
        }

        // =================================================
        // PASSWORD
        // =================================================

        if (!password) {
            newErrors.password =
                "Please enter a password.";
        } else if (
            password.length < 8
        ) {
            newErrors.password =
                "Password must contain at least 8 characters.";
        } else if (
            !/[A-Z]/.test(password)
        ) {
            newErrors.password =
                "Password must contain at least one uppercase letter.";
        } else if (
            !/[a-z]/.test(password)
        ) {
            newErrors.password =
                "Password must contain at least one lowercase letter.";
        } else if (
            !/\d/.test(password)
        ) {
            newErrors.password =
                "Password must contain at least one number.";
        } else if (
            !specialCharRegex.test(
                password
            )
        ) {
            newErrors.password =
                "Password must contain at least one special character.";
        }

        // =================================================
        // CONFIRM PASSWORD
        // =================================================

        if (!confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your password.";
        } else if (
            password !== confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match.";
        }

        // =================================================
        // TERMS
        // =================================================

        if (!formData.terms) {
            newErrors.terms =
                "Please accept the terms and conditions.";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors)
                .length === 0
        );
    };

    // =====================================================
    // HANDLE SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        const fullName =
            formData.fullName.trim();

        const employeeCode =
            formData.employeeCode
                .trim()
                .toUpperCase();

        const department =
            formData.department.trim();

        const email =
            formData.email
                .trim()
                .toLowerCase();

        const phone =
            formData.phone.trim();

        const password =
            formData.password;

        setIsLoading(true);

        try {
            // =================================================
            // SEND REGISTRATION REQUEST
            // =================================================

            await apiPost(
                "/employees/register",
                {
                    employeeCode,
                    name: fullName,
                    department,
                    email,
                    phone,
                    password,
                }
            );

            // =================================================
            // SUCCESS
            // =================================================

            setSuccess(
                "Account created successfully!"
            );

            setFormData({
                fullName: "",
                employeeCode: "",
                department: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
                terms: false,
            });

            setErrors({});

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                });
            }, 1200);

        } catch (error) {
            const status =
                error?.status;

            if (status === 409) {
                setErrors({
                    general:
                        "An account with these details already exists.",
                });
            } else if (status === 400) {
                setErrors({
                    general:
                        "Please check your registration details and try again.",
                });
            } else if (status === 403) {
                setErrors({
                    general:
                        "Registration is currently not available.",
                });
            } else {
                setErrors({
                    general:
                        "Unable to create your account. Please try again.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] text-[#2F184B]">

            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            <div className="pointer-events-none absolute inset-0">

                <motion.div
                    animate={{
                        x: [0, 35, 0],
                        y: [0, 25, 0],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -left-48 -top-48 h-[620px] w-[620px] rounded-full bg-[#C8B1E4]/55 blur-[120px]"
                />

                <motion.div
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 35, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -right-48 -top-32 h-[580px] w-[580px] rounded-full bg-[#9B72CF]/25 blur-[120px]"
                />

                <motion.div
                    animate={{
                        x: [0, 40, 0],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: 11,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-[-300px] left-[25%] h-[600px] w-[700px] rounded-full bg-[#9B72CF]/20 blur-[130px]"
                />

                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                rgba(83,43,136,0.045) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                90deg,
                                rgba(83,43,136,0.045) 1px,
                                transparent 1px
                            )
                        `,
                        backgroundSize:
                            "42px 42px",
                    }}
                />
            </div>

            {/* =====================================================
                FLOATING WIDGETS
            ====================================================== */}

            <motion.div
                initial={{
                    opacity: 0,
                    x: -60,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.2,
                }}
                className="absolute left-[5%] top-[15%] hidden xl:block"
            >
                <motion.div
                    animate={{
                        y: [0, -12, 0],
                        rotate: [0, 1, 0],
                    }}
                    transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="w-[236px] rounded-[22px] border border-white/80 bg-white/55 p-5 shadow-[0_24px_60px_rgba(47,24,75,0.10)] backdrop-blur-2xl"
                >
                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-[#F4EFFA] p-3 text-[#532B88]">
                            <Users size={19} />
                        </div>

                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B72CF]">
                                Your Workspace
                            </p>

                            <p className="mt-1 text-lg font-black text-[#2F184B]">
                                Join the Team
                            </p>
                        </div>

                    </div>

                    <div className="mt-5 flex -space-x-2">

                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#C8B1E4] text-[9px] font-bold text-[#532B88]"
                                >
                                    {item}
                                </div>
                            )
                        )}

                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#532B88] text-[9px] font-bold text-white">
                            +
                        </div>

                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{
                    opacity: 0,
                    x: 60,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.35,
                }}
                className="absolute right-[5%] top-[18%] hidden xl:block"
            >
                <motion.div
                    animate={{
                        y: [0, 13, 0],
                        rotate: [0, -1, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="w-[236px] rounded-[22px] border border-white/80 bg-white/55 p-5 shadow-[0_24px_60px_rgba(47,24,75,0.10)] backdrop-blur-2xl"
                >
                    <div className="flex items-center gap-3">

                        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">

                            <Target size={19} />

                            <motion.div
                                animate={{
                                    rotate: 360,
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="absolute inset-0 rounded-xl border border-dashed border-[#9B72CF]/60"
                            />

                        </div>

                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B72CF]">
                                Get Started
                            </p>

                            <p className="mt-1 text-lg font-black text-[#2F184B]">
                                Set Your Goals
                            </p>
                        </div>

                    </div>

                    <div className="mt-5 flex items-center gap-2">

                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#C8B1E4]/40">

                            <motion.div
                                initial={{
                                    width: 0,
                                }}
                                animate={{
                                    width: "68%",
                                }}
                                transition={{
                                    duration: 1.2,
                                    delay: 0.7,
                                }}
                                className="h-full rounded-full bg-gradient-to-r from-[#532B88] to-[#9B72CF]"
                            />

                        </div>

                        <span className="text-[9px] font-bold text-[#532B88]">
                            68%
                        </span>

                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{
                    opacity: 0,
                    x: -50,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.45,
                }}
                className="absolute bottom-[17%] left-[7%] hidden xl:block"
            >
                <motion.div
                    animate={{
                        y: [0, 10, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                    }}
                    className="flex w-[215px] items-center gap-3 rounded-[20px] border border-white/80 bg-white/55 p-4 shadow-[0_24px_60px_rgba(47,24,75,0.09)] backdrop-blur-2xl"
                >

                    <div className="rounded-xl bg-[#F4EFFA] p-2.5 text-[#532B88]">
                        <ClipboardCheck
                            size={18}
                        />
                    </div>

                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B72CF]">
                            EOD Tracking
                        </p>

                        <p className="text-lg font-black text-[#2F184B]">
                            Made Simple
                        </p>
                    </div>

                </motion.div>
            </motion.div>

            <motion.div
                initial={{
                    opacity: 0,
                    x: 50,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.55,
                }}
                className="absolute bottom-[20%] right-[7%] hidden xl:block"
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 5.2,
                        repeat: Infinity,
                    }}
                    className="flex w-[215px] items-center gap-3 rounded-[20px] border border-white/80 bg-white/55 p-4 shadow-[0_24px_60px_rgba(47,24,75,0.09)] backdrop-blur-2xl"
                >

                    <div className="rounded-xl bg-[#F4EFFA] p-2.5 text-[#532B88]">
                        <BarChart3
                            size={18}
                        />
                    </div>

                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B72CF]">
                            Analytics
                        </p>

                        <p className="text-lg font-black text-[#2F184B]">
                            Track Progress
                        </p>
                    </div>

                </motion.div>
            </motion.div>

            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotate: [
                        0,
                        10,
                        -10,
                        0,
                    ],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                }}
                className="absolute right-[21%] bottom-[40%] hidden lg:block"
            >
                <div className="rounded-xl border border-white/80 bg-white/55 p-2.5 text-[#9B72CF] shadow-lg backdrop-blur-xl">
                    <Sparkles size={15} />
                </div>
            </motion.div>

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30,
                        scale: 0.97,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.8,
                        ease: [
                            0.22,
                            1,
                            0.36,
                            1,
                        ],
                    }}
                    className="w-full max-w-[618px]"
                >

                    {/* BRAND */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -12,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.2,
                        }}
                        className="mb-6 text-center"
                    >

                        <div className="mb-3 inline-flex items-center gap-3">

                            <motion.div
                                animate={{
                                    rotate: [
                                        0,
                                        4,
                                        -4,
                                        0,
                                    ],
                                    boxShadow: [
                                        "0 8px 25px rgba(83,43,136,0.10)",
                                        "0 8px 35px rgba(83,43,136,0.22)",
                                        "0 8px 25px rgba(83,43,136,0.10)",
                                    ],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                }}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#532B88] to-[#9B72CF] text-white"
                            >
                                <Activity
                                    size={21}
                                />
                            </motion.div>

                            <div className="text-left">

                                <h1 className="text-2xl font-black tracking-tight text-[#2F184B]">
                                    WorkPulse
                                </h1>

                                <p className="text-[9px] font-bold tracking-[0.32em] text-[#532B88]">
                                    EOD & ANALYTICS
                                </p>

                            </div>

                        </div>

                        <p className="text-sm text-[#8C789B]">
                            Create your workspace
                            account.
                        </p>

                    </motion.div>

                    {/* GLASS CARD */}

                    <div className="relative">

                        <motion.div
                            animate={{
                                opacity: [
                                    0.3,
                                    0.55,
                                    0.3,
                                ],
                                scale: [
                                    1,
                                    1.02,
                                    1,
                                ],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute -inset-5 rounded-[38px] bg-[#9B72CF]/15 blur-3xl"
                        />

                        <div className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/65 p-7 shadow-[0_35px_100px_rgba(47,24,75,0.14)] backdrop-blur-2xl sm:p-9">

                            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 to-transparent" />

                            <div className="absolute left-[19%] right-[19%] top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#532B88] to-transparent opacity-60" />

                            {/* HEADER */}

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
                                    delay: 0.35,
                                }}
                                className="relative mb-7"
                            >

                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C8B1E4]/70 bg-[#F4EFFA]/80 px-3 py-1.5">

                                    <span className="h-1.5 w-1.5 rounded-full bg-[#532B88]" />

                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#532B88]">
                                        New Employee
                                    </span>

                                </div>

                                <h2 className="text-[30px] font-bold tracking-tight text-[#2F184B]">
                                    Create your account
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[#806F8F]">
                                    Set up your profile
                                    to start tracking
                                    your work and
                                    productivity.
                                </p>

                            </motion.div>

                            {/* SUCCESS */}

                            <AnimatePresence mode="wait">

                                {success && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            scale: 0.96,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        className="mb-5 flex items-center gap-3 rounded-xl border border-[#C8B1E4] bg-[#F4EFFA] px-4 py-3 text-sm text-[#532B88]"
                                    >
                                        <CheckCircle2
                                            size={18}
                                        />

                                        {success}
                                    </motion.div>
                                )}

                            </AnimatePresence>

                            {/* GENERAL ERROR */}

                            <AnimatePresence mode="wait">

                                {errors.general && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            scale: 0.96,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-500"
                                    >
                                        {errors.general}
                                    </motion.div>
                                )}

                            </AnimatePresence>

                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="relative space-y-4"
                                noValidate
                            >

                                {/* ROW 1 */}

                                <div className="grid gap-4 sm:grid-cols-2">

                                    {/* FULL NAME */}

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
                                            delay: 0.4,
                                        }}
                                    >

                                        <label className="mb-2 block text-xs font-semibold text-[#69577A]">
                                            Full Name
                                        </label>

                                        <div className="group relative">

                                            <User
                                                size={16}
                                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                            />

                                            <input
                                                type="text"
                                                name="fullName"
                                                value={
                                                    formData.fullName
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Your full name"
                                                autoComplete="name"
                                                className={`h-[50px] w-full rounded-xl border bg-white/55 pl-11 pr-4 text-sm text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10)] ${
                                                    errors.fullName
                                                        ? "border-red-300 focus:border-red-400"
                                                        : "border-[#C8B1E4]/65 focus:border-[#9B72CF]"
                                                }`}
                                            />

                                        </div>

                                        {errors.fullName && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {
                                                    errors.fullName
                                                }
                                            </p>
                                        )}

                                    </motion.div>

                                    {/* EMPLOYEE CODE */}

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
                                            delay: 0.45,
                                        }}
                                    >

                                        <label className="mb-2 block text-xs font-semibold text-[#69577A]">
                                            Employee Code
                                        </label>

                                        <div className="group relative">

                                            <ClipboardCheck
                                                size={16}
                                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                            />

                                            <input
                                                type="text"
                                                name="employeeCode"
                                                value={
                                                    formData.employeeCode
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="EMP001"
                                                autoComplete="off"
                                                className={`h-[50px] w-full rounded-xl border bg-white/55 pl-11 pr-4 text-sm uppercase text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10)] ${
                                                    errors.employeeCode
                                                        ? "border-red-300 focus:border-red-400"
                                                        : "border-[#C8B1E4]/65 focus:border-[#9B72CF]"
                                                }`}
                                            />

                                        </div>

                                        {errors.employeeCode && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {
                                                    errors.employeeCode
                                                }
                                            </p>
                                        )}

                                    </motion.div>

                                </div>

                                {/* DEPARTMENT */}

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
                                        delay: 0.5,
                                    }}
                                >

                                    <label className="mb-2 block text-xs font-semibold text-[#69577A]">
                                        Department
                                    </label>

                                    <div className="group relative">

                                        <Activity
                                            size={16}
                                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                        />

                                        <input
                                            type="text"
                                            name="department"
                                            value={
                                                formData.department
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Software Development"
                                            className={`h-[50px] w-full rounded-xl border bg-white/55 pl-11 pr-4 text-sm text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10)] ${
                                                errors.department
                                                    ? "border-red-300 focus:border-red-400"
                                                    : "border-[#C8B1E4]/65 focus:border-[#9B72CF]"
                                            }`}
                                        />

                                    </div>

                                    {errors.department && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {
                                                errors.department
                                            }
                                        </p>
                                    )}

                                </motion.div>

                                {/* EMAIL */}

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
                                        delay: 0.55,
                                    }}
                                >

                                    <label className="mb-2 block text-xs font-semibold text-[#69577A]">
                                        Work Email
                                    </label>

                                    <div className="group relative">

                                        <Mail
                                            size={16}
                                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="you@company.com"
                                            autoComplete="email"
                                            className={`h-[50px] w-full rounded-xl border bg-white/55 pl-11 pr-4 text-sm text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10)] ${
                                                errors.email
                                                    ? "border-red-300 focus:border-red-400"
                                                    : "border-[#C8B1E4]/65 focus:border-[#9B72CF]"
                                            }`}
                                        />

                                    </div>

                                    {errors.email && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {errors.email}
                                        </p>
                                    )}

                                </motion.div>

                                {/* PHONE */}

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
                                        delay: 0.6,
                                    }}
                                >

                                    <label className="mb-2 block text-xs font-semibold text-[#69577A]">
                                        Phone Number
                                    </label>

                                    <div className="group relative">

                                        <Phone
                                            size={16}
                                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                        />

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="10 digit phone number"
                                            maxLength={10}
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            className={`h-[50px] w-full rounded-xl border bg-white/55 pl-11 pr-4 text-sm text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10)] ${
                                                errors.phone
                                                    ? "border-red-300 focus:border-red-400"
                                                    : "border-[#C8B1E4]/65 focus:border-[#9B72CF]"
                                            }`}
                                        />

                                    </div>

                                    {errors.phone && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {errors.phone}
                                        </p>
                                    )}

                                </motion.div>

                                {/* PASSWORD ROW */}

                                <div className="grid gap-4 sm:grid-cols-2">

                                    {/* PASSWORD */}

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
                                            delay: 0.65,
                                        }}
                                    >

                                        <label className="mb-2 block text-xs font-semibold text-[#69577A]">
                                            Password
                                        </label>

                                        <div className="group relative">

                                            <LockKeyhole
                                                size={16}
                                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                            />

                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={
                                                    formData.password
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Minimum 8 characters"
                                                autoComplete="new-password"
                                                className={`h-[50px] w-full rounded-xl border bg-white/55 pl-11 pr-11 text-sm text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10)] ${
                                                    errors.password
                                                        ? "border-red-300 focus:border-red-400"
                                                        : "border-[#C8B1E4]/65 focus:border-[#9B72CF]"
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (previous) =>
                                                            !previous
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#B39BC8] transition hover:bg-[#F4EFFA] hover:text-[#532B88]"
                                            >
                                                {showPassword ? (
                                                    <EyeOff
                                                        size={16}
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={16}
                                                    />
                                                )}
                                            </button>

                                        </div>

                                        {errors.password && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {
                                                    errors.password
                                                }
                                            </p>
                                        )}

                                    </motion.div>

                                    {/* CONFIRM PASSWORD */}

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
                                            delay: 0.7,
                                        }}
                                    >

                                        <label className="mb-2 block text-xs font-semibold text-[#69577A]">
                                            Confirm Password
                                        </label>

                                        <div className="group relative">

                                            <LockKeyhole
                                                size={16}
                                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                            />

                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="confirmPassword"
                                                value={
                                                    formData.confirmPassword
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Re-enter password"
                                                autoComplete="new-password"
                                                className={`h-[50px] w-full rounded-xl border bg-white/55 pl-11 pr-11 text-sm text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10)] ${
                                                    errors.confirmPassword
                                                        ? "border-red-300 focus:border-red-400"
                                                        : "border-[#C8B1E4]/65 focus:border-[#9B72CF]"
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (previous) =>
                                                            !previous
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#B39BC8] transition hover:bg-[#F4EFFA] hover:text-[#532B88]"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff
                                                        size={16}
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={16}
                                                    />
                                                )}
                                            </button>

                                        </div>

                                        {errors.confirmPassword && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {
                                                    errors.confirmPassword
                                                }
                                            </p>
                                        )}

                                    </motion.div>

                                </div>

                                {/* TERMS */}

                                <div>

                                    <motion.label
                                        initial={{
                                            opacity: 0,
                                        }}
                                        animate={{
                                            opacity: 1,
                                        }}
                                        transition={{
                                            delay: 0.75,
                                        }}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white/30 p-3.5 ${
                                            errors.terms
                                                ? "border-red-300"
                                                : "border-[#C8B1E4]/50"
                                        }`}
                                    >

                                        <input
                                            type="checkbox"
                                            name="terms"
                                            checked={
                                                formData.terms
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="mt-0.5 h-4 w-4 cursor-pointer appearance-none rounded border border-[#C8B1E4] bg-white checked:border-[#532B88] checked:bg-[#532B88]"
                                        />

                                        <span className="text-xs leading-5 text-[#806F8F]">
                                            I agree to the WorkPulse
                                            terms and understand
                                            that my account
                                            information will be
                                            used for workplace
                                            tracking and
                                            analytics.
                                        </span>

                                    </motion.label>

                                    {errors.terms && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {errors.terms}
                                        </p>
                                    )}

                                </div>

                                {/* SUBMIT */}

                                <motion.button
                                    initial={{
                                        opacity: 0,
                                        y: 12,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        delay: 0.8,
                                    }}
                                    whileHover={{
                                        y: -2,
                                        scale: 1.01,
                                    }}
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    type="submit"
                                    disabled={
                                        isLoading ||
                                        !!success
                                    }
                                    className="group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#532B88] via-[#68429C] to-[#9B72CF] font-semibold text-white shadow-[0_14px_32px_rgba(83,43,136,0.23)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(83,43,136,0.30)] disabled:cursor-not-allowed disabled:opacity-70"
                                >

                                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

                                    <motion.span
                                        animate={{
                                            x: [
                                                "-150%",
                                                "180%",
                                            ],
                                        }}
                                        transition={{
                                            duration: 2.8,
                                            repeat: Infinity,
                                            repeatDelay: 2,
                                            ease: "linear",
                                        }}
                                        className="pointer-events-none absolute inset-y-0 w-20 skew-x-[-20deg] bg-white/20"
                                    />

                                    {isLoading ? (
                                        <>
                                            <motion.span
                                                animate={{
                                                    rotate: 360,
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                            />

                                            Creating account...
                                        </>
                                    ) : success ? (
                                        <>
                                            <CheckCircle2
                                                size={18}
                                            />

                                            Account created
                                        </>
                                    ) : (
                                        <>
                                            <span className="relative">
                                                Create Account
                                            </span>

                                            <ArrowRight
                                                size={18}
                                                className="relative transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </>
                                    )}

                                </motion.button>

                            </form>

                            {/* SECURITY */}

                            <motion.div
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                }}
                                transition={{
                                    delay: 0.9,
                                }}
                                className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-widest text-[#A892BA]"
                            >
                                <LockKeyhole
                                    size={12}
                                />

                                Private · Secure ·
                                WorkPulse
                            </motion.div>

                            {/* LOGIN LINK */}

                            <div className="my-6 flex items-center gap-3">

                                <div className="h-px flex-1 bg-[#C8B1E4]/60" />

                                <span className="text-[10px] font-medium uppercase tracking-widest text-[#A892BA]">
                                    Already registered?
                                </span>

                                <div className="h-px flex-1 bg-[#C8B1E4]/60" />

                            </div>

                            <Link
                                to="/login"
                                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#C8B1E4]/70 bg-white/45 text-sm font-semibold text-[#69577A] transition-all duration-300 hover:border-[#9B72CF] hover:bg-[#F4EFFA]/80 hover:text-[#532B88]"
                            >

                                <Sparkles
                                    size={15}
                                    className="text-[#9B72CF] transition-transform duration-300 group-hover:rotate-12"
                                />

                                Back to Sign In

                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-300 group-hover:-translate-x-1"
                                />

                            </Link>

                        </div>
                    </div>

                    {/* FOOTER */}

                    <motion.p
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        transition={{
                            delay: 1,
                        }}
                        className="mt-4 text-center text-[10px] text-[#9B8AAA]"
                    >
                        ©{" "}
                        {new Date().getFullYear()}{" "}
                        WorkPulse · EOD &
                        Productivity Platform
                    </motion.p>

                </motion.div>
            </div>
        </main>
    );
}

export default Register;
