import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import { apiPost } from "../services/api";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [resetToken, setResetToken] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const validatePassword = (value) => {
        if (value.length < 8) {
            return "Password must be at least 8 characters.";
        }

        if (!/[A-Z]/.test(value)) {
            return "Password must contain at least one uppercase letter.";
        }

        if (!/[a-z]/.test(value)) {
            return "Password must contain at least one lowercase letter.";
        }

        if (!/[0-9]/.test(value)) {
            return "Password must contain at least one number.";
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=;'`~]/.test(value)) {
            return "Password must contain at least one special character.";
        }

        return "";
    };

    // STEP 1
    const handleEmailSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter your email address.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            const result = await apiPost(
                "/employees/forgot-password/request",
                {
                    email: trimmedEmail,
                }
            );

            if (!result?.resetToken) {
                throw new Error(
                    "Unable to generate password reset token."
                );
            }

            // Keep the token in memory only.
            setResetToken(result.resetToken);

            setStep(2);
            setSuccess("");
        } catch (err) {
            setError(
                    "Unable to process your request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 2
    const handlePasswordReset = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!resetToken) {
            setError(
                "Your reset session is invalid. Please request a new reset link."
            );
            setStep(1);
            return;
        }

        const passwordError = validatePassword(password);

        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const result = await apiPost(
                "/employees/forgot-password/reset",
                {
                    resetToken: resetToken,
                    newPassword: password,
                }
            );

            setSuccess(
                result?.message ||
                    "Password reset successfully."
            );

            setPassword("");
            setConfirmPassword("");
            setResetToken("");

            // Give the user a moment to see the success message.
            setTimeout(() => {
                navigate("/login");
            }, 1800);
        } catch {
            setError(
                    "Unable to reset your password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        if (loading) return;

        setError("");
        setSuccess("");

        if (step === 2) {
            setStep(1);
            setPassword("");
            setConfirmPassword("");
            return;
        }

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#F4EFFA] flex items-center justify-center px-4 py-8">

            <div className="w-full max-w-md">

                {/* Back Button */}
                <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="flex items-center gap-2 mb-6 text-[#532B88] hover:text-[#2F184B] transition disabled:opacity-50"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">
                        {step === 2 ? "Back" : "Back to Login"}
                    </span>
                </button>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-[#C8B1E4]/40 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#2F184B] via-[#532B88] to-[#9B72CF] px-8 py-8 text-white">

                        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                            {step === 1 ? (
                                <Mail size={28} />
                            ) : (
                                <LockKeyhole size={28} />
                            )}
                        </div>

                        <h1 className="text-2xl font-bold">
                            {step === 1
                                ? "Forgot Password?"
                                : "Create New Password"}
                        </h1>

                        <p className="text-white/80 mt-2 text-sm leading-6">
                            {step === 1
                                ? "Enter your registered email address to reset your password."
                                : "Create a strong new password for your WorkPulse account."}
                        </p>

                    </div>

                    {/* Progress */}
                    <div className="px-8 pt-7">

                        <div className="flex items-center gap-3">

                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                    step >= 1
                                        ? "bg-[#532B88] text-white"
                                        : "bg-[#C8B1E4]/40 text-[#532B88]"
                                }`}
                            >
                                {step > 1 ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    "1"
                                )}
                            </div>

                            <div className="h-1 flex-1 bg-[#C8B1E4]/40 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-[#532B88] rounded-full transition-all duration-500 ${
                                        step === 2
                                            ? "w-full"
                                            : "w-0"
                                    }`}
                                />
                            </div>

                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                    step === 2
                                        ? "bg-[#532B88] text-white"
                                        : "bg-[#C8B1E4]/40 text-[#532B88]"
                                }`}
                            >
                                2
                            </div>

                        </div>

                    </div>

                    {/* Content */}
                    <div className="p-8">

                        {/* Error */}
                        {error && (
                            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 flex-shrink-0"
                                />

                                <span>
                                    {success}
                                </span>
                            </div>
                        )}

                        {/* STEP 1 */}
                        {step === 1 && (
                            <form
                                onSubmit={handleEmailSubmit}
                                className="space-y-6"
                            >

                                <div>
                                    <label className="block text-sm font-semibold text-[#2F184B] mb-2">
                                        Registered Email
                                    </label>

                                    <div className="relative">

                                        <Mail
                                            size={19}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter your email address"
                                            disabled={loading}
                                            autoComplete="email"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#C8B1E4] bg-[#F4EFFA]/40 text-[#2F184B] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#9B72CF] focus:border-[#532B88] transition disabled:opacity-60"
                                        />

                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-[#532B88] hover:bg-[#2F184B] text-white font-semibold transition-all shadow-lg shadow-[#532B88]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? "Processing..."
                                        : "Continue"}
                                </button>

                            </form>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <form
                                onSubmit={handlePasswordReset}
                                className="space-y-5"
                            >

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#2F184B] mb-2">
                                        New Password
                                    </label>

                                    <div className="relative">

                                        <LockKeyhole
                                            size={19}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter new password"
                                            disabled={loading}
                                            autoComplete="new-password"
                                            className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[#C8B1E4] bg-[#F4EFFA]/40 text-[#2F184B] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#9B72CF] focus:border-[#532B88] transition disabled:opacity-60"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            disabled={loading}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#532B88]"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>

                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#2F184B] mb-2">
                                        Confirm Password
                                    </label>

                                    <div className="relative">

                                        <LockKeyhole
                                            size={19}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                        />

                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Confirm new password"
                                            disabled={loading}
                                            autoComplete="new-password"
                                            className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[#C8B1E4] bg-[#F4EFFA]/40 text-[#2F184B] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#9B72CF] focus:border-[#532B88] transition disabled:opacity-60"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            disabled={loading}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#532B88]"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>

                                    </div>
                                </div>

                                {/* Password Rules */}
                                <div className="rounded-xl bg-[#F4EFFA] border border-[#C8B1E4]/50 p-4">

                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldCheck
                                            size={18}
                                            className="text-[#532B88]"
                                        />

                                        <p className="text-sm font-semibold text-[#2F184B]">
                                            Password requirements
                                        </p>
                                    </div>

                                    <ul className="space-y-1.5 text-xs text-gray-600">
                                        <li>• At least 8 characters</li>
                                        <li>• At least one uppercase letter</li>
                                        <li>• At least one lowercase letter</li>
                                        <li>• At least one number</li>
                                        <li>• At least one special character</li>
                                    </ul>

                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-[#532B88] hover:bg-[#2F184B] text-white font-semibold transition-all shadow-lg shadow-[#532B88]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? "Resetting Password..."
                                        : "Reset Password"}
                                </button>

                            </form>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    WorkPulse • Secure Account Recovery
                </p>

            </div>
        </div>
    );
};

export default ForgotPassword;