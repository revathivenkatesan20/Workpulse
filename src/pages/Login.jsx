import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    ArrowRight,
    BarChart3,
    CalendarCheck,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react";
import { loginEmployee } from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // ---------------------------------------
    // INPUT CHANGE
    // ---------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
            general: "",
        }));

        setSuccess("");
    };

    // ---------------------------------------
    // LOGIN
    // ---------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        setSuccess("");

        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        const newErrors = {};

        // ---------------------------------------
        // EMAIL VALIDATION
        // ---------------------------------------

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!email) {
            newErrors.email =
                "Please enter your email address.";
        } else if (!emailRegex.test(email)) {
            newErrors.email =
                "Please enter a valid email address.";
        }

        // ---------------------------------------
        // PASSWORD VALIDATION
        // ---------------------------------------

        if (!password) {
            newErrors.password =
                "Please enter your password.";
        }

        // ---------------------------------------
        // STOP IF VALIDATION ERRORS
        // ---------------------------------------

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // ---------------------------------------
            // LOGIN API
            // ---------------------------------------

            const result = await loginEmployee(
                email,
                password
            );

            // ---------------------------------------
            // GET EMPLOYEE FROM RESPONSE
            // ---------------------------------------

            const employee =
                result?.employee ||
                result?.user ||
                result;

            // ---------------------------------------
            // VALIDATE RESPONSE
            // ---------------------------------------

            if (
                !employee ||
                typeof employee !== "object"
            ) {
                throw new Error(
                    "Invalid employee information received from the server."
                );
            }

            // ---------------------------------------
            // EMPLOYEE CODE VALIDATION
            // ---------------------------------------

            if (
                !employee.employeeCode ||
                !employee.employeeCode.trim()
            ) {
                throw new Error(
                    "Your employee record is incomplete. Please contact HR/Admin."
                );
            }

            // ---------------------------------------
            // ACTIVE STATUS VALIDATION
            // ---------------------------------------

            if (employee.active === false) {
                throw new Error(
                    "Your account is currently inactive. Please contact HR/Admin."
                );
            }

            // ---------------------------------------
            // CREATE CLEAN EMPLOYEE OBJECT
            // ---------------------------------------

            const currentEmployee = {
                id: employee.id,

                employeeCode:
                    employee.employeeCode,

                name:
                    employee.name || "",

                email:
                    employee.email || email,

                department:
                    employee.department || "",

                designation:
                    employee.designation ||
                    employee.role ||
                    "",

                role:
                    employee.role || "",

                phone:
                    employee.phone || "",

                active:
                    employee.active !== false,

                status:
                    employee.active === false
                        ? "Inactive"
                        : "Active",

                accountRole:
                    employee.accountRole ||
                    "EMPLOYEE",
            };

            // ---------------------------------------
            // SAVE CURRENT EMPLOYEE
            // ---------------------------------------

            localStorage.setItem(
                "workpulse_current_employee",
                JSON.stringify(currentEmployee)
            );

            localStorage.setItem(
                "workpulse_current_employee_code",
                currentEmployee.employeeCode
            );

            // ---------------------------------------
            // SAVE JWT
            // ---------------------------------------

            if (result?.token) {
                localStorage.setItem(
                    "workpulse_token",
                    result.token
                );
            }

            // ---------------------------------------
            // REMEMBER ME
            // ---------------------------------------

            if (rememberMe) {
                localStorage.setItem(
                    "workpulse_remember_me",
                    "true"
                );
            } else {
                localStorage.removeItem(
                    "workpulse_remember_me"
                );
            }

            // ---------------------------------------
            // SUCCESS
            // ---------------------------------------

            setSuccess(
                `Welcome back, ${employee.name}!`
            );

            // ---------------------------------------
            // NAVIGATE
            // ---------------------------------------

            setTimeout(() => {
                navigate("/");
            }, 900);

        } catch (error) {
            if (error?.status === 403) {
                setErrors({
                    general:
                        "Your account is currently inactive. Please contact HR/Admin.",
                });
            } else if (error?.status === 401) {
                setErrors({
                    general:
                        "Invalid email or password.",
                });
            } else {
                setErrors({
                    general:
                        "Unable to sign in. Please try again.",
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
                            backgroundSize: "42px 42px",
                        }}
                    />
                </div>

                {/* =====================================================
                GOLDEN-RATIO FLOATING WIDGETS
            ====================================================== */}

                {/* Productivity */}

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
                        delay: 0.25,
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
                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B72CF]">
                                    Productivity
                                </p>

                                <p className="mt-1 text-[25px] font-black text-[#2F184B]">
                                    +18.6%
                                </p>
                            </div>

                            <div className="rounded-xl bg-[#F4EFFA] p-2.5 text-[#532B88]">
                                <TrendingUp size={18} />
                            </div>
                        </div>

                        <div className="mt-5 flex h-12 items-end gap-1.5">

                            {[
                                32,
                                45,
                                38,
                                56,
                                49,
                                68,
                                58,
                                78,
                                72,
                                92,
                            ].map((height, index) => (
                                <motion.div
                                    key={index}
                                    initial={{
                                        height: 0,
                                    }}
                                    animate={{
                                        height: `${height}%`,
                                    }}
                                    transition={{
                                        delay:
                                            0.6 +
                                            index * 0.05,
                                        duration: 0.6,
                                    }}
                                    className="flex-1 rounded-t-md bg-gradient-to-t from-[#532B88] to-[#C8B1E4]"
                                />
                            ))}

                        </div>
                    </motion.div>
                </motion.div>

                {/* Focus Time */}

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
                    className="absolute right-[5%] top-[19%] hidden xl:block"
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

                            <div className="rounded-xl bg-[#F4EFFA] p-2.5 text-[#532B88]">
                                <Clock3 size={18} />
                            </div>

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B72CF]">
                                    Focus Time
                                </p>

                                <p className="text-[19px] font-black text-[#2F184B]">
                                    7h 42m
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#C8B1E4]/40">

                            <motion.div
                                initial={{
                                    width: 0,
                                }}
                                animate={{
                                    width: "78%",
                                }}
                                transition={{
                                    duration: 1.3,
                                    delay: 0.7,
                                }}
                                className="h-full rounded-full bg-gradient-to-r from-[#532B88] to-[#9B72CF]"
                            />
                        </div>

                        <div className="mt-2 flex justify-between text-[9px] text-[#9B72CF]">
                            <span>Daily target</span>
                            <span>78%</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Tasks */}

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
                            ease: "easeInOut",
                        }}
                        className="flex w-[215px] items-center gap-3 rounded-[20px] border border-white/80 bg-white/55 p-4 shadow-[0_24px_60px_rgba(47,24,75,0.09)] backdrop-blur-2xl"
                    >
                        <div className="rounded-xl bg-[#F4EFFA] p-2.5 text-[#532B88]">
                            <ClipboardCheck size={18} />
                        </div>

                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B72CF]">
                                Tasks Done
                            </p>

                            <p className="text-lg font-black text-[#2F184B]">
                                12 / 15
                            </p>
                        </div>

                        <CheckCircle2
                            size={17}
                            className="ml-auto text-[#9B72CF]"
                        />
                    </motion.div>
                </motion.div>

                {/* Daily Goal */}

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
                            ease: "easeInOut",
                        }}
                        className="flex w-[215px] items-center gap-3 rounded-[20px] border border-white/80 bg-white/55 p-4 shadow-[0_24px_60px_rgba(47,24,75,0.09)] backdrop-blur-2xl"
                    >
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F4EFFA]">

                            <Target
                                size={18}
                                className="text-[#532B88]"
                            />

                            <motion.div
                                animate={{
                                    rotate: 360,
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="absolute inset-0 rounded-full border border-dashed border-[#9B72CF]/60"
                            />
                        </div>

                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B72CF]">
                                Daily Goal
                            </p>

                            <p className="text-lg font-black text-[#2F184B]">
                                92%
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Small Widgets */}

                <motion.div
                    animate={{
                        y: [0, -8, 0],
                        rotate: [0, 3, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                    }}
                    className="absolute left-[19%] top-[47%] hidden lg:block"
                >
                    <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/55 px-3 py-2.5 shadow-lg backdrop-blur-xl">

                        <CalendarCheck
                            size={15}
                            className="text-[#532B88]"
                        />

                        <span className="text-[10px] font-semibold text-[#69577A]">
                            EOD Submitted
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, 8, 0],
                        rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                    }}
                    className="absolute right-[19%] top-[50%] hidden lg:block"
                >
                    <div className="rounded-xl border border-white/80 bg-white/55 p-3 text-[#532B88] shadow-lg backdrop-blur-xl">
                        <BarChart3 size={17} />
                    </div>
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, -10, 0],
                        rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                    }}
                    className="absolute bottom-[39%] right-[22%] hidden lg:block"
                >
                    <div className="rounded-xl border border-white/80 bg-white/55 p-2.5 text-[#9B72CF] shadow-lg backdrop-blur-xl">
                        <Sparkles size={15} />
                    </div>
                </motion.div>

                {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

                <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">

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
                            className="mb-7 text-center"
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
                                    <Activity size={21} />
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
                                Your work. Your progress. Your pulse.
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

                            <div className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/65 p-7 shadow-[0_35px_100px_rgba(47,24,75,0.14)] backdrop-blur-2xl sm:p-10">

                                <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/70 to-transparent" />

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
                                    className="relative mb-8"
                                >
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C8B1E4]/70 bg-[#F4EFFA]/80 px-3 py-1.5">

                                        <span className="h-1.5 w-1.5 rounded-full bg-[#532B88]" />

                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#532B88]">
                                            Employee Portal
                                        </span>
                                    </div>

                                    <h2 className="text-[32px] font-bold tracking-tight text-[#2F184B]">
                                        Welcome back
                                    </h2>

                                    <p className="mt-2 max-w-[382px] text-sm leading-6 text-[#806F8F]">
                                        Sign in to manage your daily work,
                                        tasks and productivity.
                                    </p>
                                </motion.div>

                                {/* GENERAL MESSAGES */}

                                <AnimatePresence mode="wait">

                                    {errors.general && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                height: 0,
                                                y: -8,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            className="mb-5 overflow-hidden"
                                        >
                                            <motion.div
                                                animate={{
                                                    x: [
                                                        0,
                                                        -4,
                                                        4,
                                                        -3,
                                                        3,
                                                        0,
                                                    ],
                                                }}
                                                transition={{
                                                    duration: 0.35,
                                                }}
                                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                                            >
                                                {errors.general}
                                            </motion.div>
                                        </motion.div>
                                    )}

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
                                            <CheckCircle2 size={18} />
                                            {success}
                                        </motion.div>
                                    )}

                                </AnimatePresence>

                                {/* FORM */}

                                <form
                                    onSubmit={handleSubmit}
                                    className="relative space-y-5"
                                >

                                    {/* EMAIL */}

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 12,
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
                                            Work Email
                                        </label>

                                        <div className="group relative">

                                            <Mail
                                                size={17}
                                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                            />

                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="you@company.com"
                                                autoComplete="email"
                                                disabled={isLoading}
                                                className={`h-[52px] w-full rounded-xl border bg-white/55 pl-11 pr-4 text-sm text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 disabled:cursor-not-allowed disabled:opacity-70 ${errors.email
                                                    ? "border-red-400 focus:border-red-500"
                                                    : "border-[#C8B1E4]/65 focus:border-[#9B72CF] focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10),0_10px_30px_rgba(83,43,136,0.08)]"
                                                    }`}
                                            />
                                        </div>

                                        {errors.email && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* PASSWORD */}

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 12,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            delay: 0.52,
                                        }}
                                    >
                                        <div className="mb-2 flex items-center justify-between">

                                            <label className="text-xs font-semibold text-[#69577A]">
                                                Password
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        "/forgot-password"
                                                    )
                                                }
                                                className="text-xs font-semibold text-[#532B88] transition-colors hover:text-[#2F184B]"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>

                                        <div className="group relative">

                                            <LockKeyhole
                                                size={17}
                                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#B39BC8] transition-colors group-focus-within:text-[#532B88]"
                                            />

                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                disabled={isLoading}
                                                className={`h-[52px] w-full rounded-xl border bg-white/55 pl-11 pr-12 text-sm text-[#2F184B] outline-none transition-all duration-300 placeholder:text-[#B0A2B9] focus:bg-white/80 disabled:cursor-not-allowed disabled:opacity-70 ${errors.password
                                                    ? "border-red-400 focus:border-red-500"
                                                    : "border-[#C8B1E4]/65 focus:border-[#9B72CF] focus:shadow-[0_0_0_4px_rgba(155,114,207,0.10),0_10px_30px_rgba(83,43,136,0.08)]"
                                                    }`}
                                            />

                                            <motion.button
                                                type="button"
                                                whileTap={{
                                                    scale: 0.85,
                                                }}
                                                onClick={() =>
                                                    setShowPassword(
                                                        (previous) =>
                                                            !previous
                                                    )
                                                }
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#B39BC8] transition hover:bg-[#F4EFFA] hover:text-[#532B88]"
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                <AnimatePresence mode="wait">

                                                    {showPassword ? (
                                                        <motion.div
                                                            key="off"
                                                            initial={{
                                                                opacity: 0,
                                                                scale: 0.7,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: 1,
                                                            }}
                                                        >
                                                            <EyeOff size={17} />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="on"
                                                            initial={{
                                                                opacity: 0,
                                                                scale: 0.7,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: 1,
                                                            }}
                                                        >
                                                            <Eye size={17} />
                                                        </motion.div>
                                                    )}

                                                </AnimatePresence>
                                            </motion.button>
                                        </div>

                                        {errors.password && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {errors.password}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* REMEMBER ME */}

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                        }}
                                        animate={{
                                            opacity: 1,
                                        }}
                                        transition={{
                                            delay: 0.6,
                                        }}
                                        className="flex items-center"
                                    >
                                        <label className="flex cursor-pointer items-center gap-2.5">

                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) =>
                                                    setRememberMe(
                                                        e.target.checked
                                                    )
                                                }
                                                disabled={isLoading}
                                                className="h-4 w-4 cursor-pointer appearance-none rounded border border-[#C8B1E4] bg-white checked:border-[#532B88] checked:bg-[#532B88] disabled:cursor-not-allowed"
                                            />

                                            <span className="text-xs text-[#806F8F]">
                                                Remember me
                                            </span>
                                        </label>
                                    </motion.div>

                                    {/* BUTTON */}

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
                                            delay: 0.68,
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
                                        className="group relative mt-2 flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#532B88] via-[#68429C] to-[#9B72CF] font-semibold text-white shadow-[0_14px_32px_rgba(83,43,136,0.23)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(83,43,136,0.30)] disabled:cursor-not-allowed disabled:opacity-70"
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

                                                Signing in...
                                            </>
                                        ) : success ? (
                                            <>
                                                <CheckCircle2 size={18} />
                                                Signed in
                                            </>
                                        ) : (
                                            <>
                                                <span className="relative">
                                                    Sign In
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
                                        delay: 0.8,
                                    }}
                                    className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-widest text-[#A892BA]"
                                >
                                    <LockKeyhole size={12} />
                                    Private · Secure · WorkPulse
                                </motion.div>

                                {/* DIVIDER */}

                                <div className="my-6 flex items-center gap-3">

                                    <div className="h-px flex-1 bg-[#C8B1E4]/60" />

                                    <span className="text-[10px] font-medium uppercase tracking-widest text-[#A892BA]">
                                        New here?
                                    </span>

                                    <div className="h-px flex-1 bg-[#C8B1E4]/60" />
                                </div>

                                {/* REGISTER */}

                                <Link
                                    to="/register"
                                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#C8B1E4]/70 bg-white/45 text-sm font-semibold text-[#69577A] transition-all duration-300 hover:border-[#9B72CF] hover:bg-[#F4EFFA]/80 hover:text-[#532B88]"
                                >
                                    <Sparkles
                                        size={15}
                                        className="text-[#9B72CF] transition-transform duration-300 group-hover:rotate-12"
                                    />

                                    Create an account

                                    <ArrowRight
                                        size={15}
                                        className="transition-transform duration-300 group-hover:translate-x-1"
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
                            className="mt-5 text-center text-[10px] text-[#9B8AAA]"
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


    export default Login;