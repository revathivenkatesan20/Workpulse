import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // ---------------------------------------
  // Email Validation
  // ---------------------------------------
  const handleEmailSubmit = (e) => {
    e.preventDefault();

    setErrors({});
    setSuccess("");

    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const newErrors = {};

    if (!trimmedEmail) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const employees = JSON.parse(
        localStorage.getItem("workpulse_employees") || "[]"
      );

      const employee = employees.find(
        (item) => item.email?.toLowerCase() === trimmedEmail
      );

      if (!employee) {
        setErrors({
          general: "No account was found with this email address.",
        });

        setIsLoading(false);
        return;
      }

      setEmail(trimmedEmail);
      setStep(2);
      setIsLoading(false);
    }, 700);
  };

  // ---------------------------------------
  // Password Validation
  // ---------------------------------------
  const handleResetPassword = (e) => {
    e.preventDefault();

    setErrors({});
    setSuccess("");

    const newErrors = {};

    if (!password) {
      newErrors.password = "Please enter a new password.";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter.";
    } else if (!/\d/.test(password)) {
      newErrors.password =
        "Password must contain at least one number.";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password =
        "Password must contain at least one special character.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const employees = JSON.parse(
        localStorage.getItem("workpulse_employees") || "[]"
      );

      const updatedEmployees = employees.map((employee) => {
        if (employee.email?.toLowerCase() === email.toLowerCase()) {
          return {
            ...employee,
            password,
          };
        }

        return employee;
      });

      localStorage.setItem(
        "workpulse_employees",
        JSON.stringify(updatedEmployees)
      );

      window.dispatchEvent(
        new Event("workpulse_employees_updated")
      );

      setIsLoading(false);
      setSuccess("Password reset successfully!");

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }, 700);
  };

  // ---------------------------------------
  // Input Change
  // ---------------------------------------
  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    setErrors((previous) => ({
      ...previous,
      email: "",
      general: "",
    }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    setErrors((previous) => ({
      ...previous,
      password: "",
      general: "",
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);

    setErrors((previous) => ({
      ...previous,
      confirmPassword: "",
      general: "",
    }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] text-[#2F184B]">

      {/* ---------------------------------------
          Background Decorative Elements
      --------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <motion.div
          className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#C8B1E4]/40 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#9B72CF]/30 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#2F184B 1px, transparent 1px), linear-gradient(90deg, #2F184B 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ---------------------------------------
          Main Content
      --------------------------------------- */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >

          {/* ---------------------------------------
              Back to Login
          --------------------------------------- */}
          <motion.button
            type="button"
            onClick={() => navigate("/login")}
            whileHover={{ x: -3 }}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-[#532B88] transition-colors hover:text-[#2F184B]"
          >
            <ArrowLeft size={17} />
            Back to Login
          </motion.button>

          {/* ---------------------------------------
              Branding
          --------------------------------------- */}
          <div className="mb-7 text-center">

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#532B88] to-[#9B72CF] shadow-lg shadow-[#532B88]/25"
            >
              {step === 1 ? (
                <Mail className="text-white" size={29} />
              ) : (
                <Lock className="text-white" size={29} />
              )}
            </motion.div>

            <div className="mb-1 flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold text-[#2F184B]">
                WorkPulse
              </h1>

              <Sparkles
                size={18}
                className="text-[#9B72CF]"
              />
            </div>

            <p className="text-sm text-[#532B88]/70">
              Employee Portal
            </p>
          </div>

          {/* ---------------------------------------
              Card
          --------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-[#532B88]/10 backdrop-blur-xl sm:p-8"
          >

            {/* ---------------------------------------
                STEP 1 - Email
            --------------------------------------- */}
            {step === 1 && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >

                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-[#2F184B]">
                    Forgot Password?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#532B88]/65">
                    Enter your registered email address and
                    we'll help you reset your password.
                  </p>
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{errors.general}</span>
                  </div>
                )}

                <form
                  onSubmit={handleEmailSubmit}
                  className="space-y-5"
                >

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-[#2F184B]"
                    >
                      Work Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your work email"
                        autoComplete="email"
                        className={`w-full rounded-xl border bg-white/80 py-3.5 pl-11 pr-4 text-sm text-[#2F184B] outline-none transition-all placeholder:text-[#532B88]/35 ${
                          errors.email
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                            : "border-[#C8B1E4]/60 focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                        }`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#532B88] to-[#9B72CF] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#532B88]/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Checking...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowLeft
                          size={17}
                          className="rotate-180"
                        />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ---------------------------------------
                STEP 2 - New Password
            --------------------------------------- */}
            {step === 2 && (
              <motion.div
                key="password-step"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >

                <div className="mb-7">
                  <div className="mb-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setErrors({});
                        setSuccess("");
                      }}
                      className="rounded-lg p-1.5 text-[#532B88] transition-colors hover:bg-[#F4EFFA]"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <span className="text-xs font-semibold uppercase tracking-wider text-[#9B72CF]">
                      Step 2 of 2
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#2F184B]">
                    Create New Password
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#532B88]/65">
                    Set a new password for{" "}
                    <span className="font-semibold text-[#532B88]">
                      {email}
                    </span>
                  </p>
                </div>

                {/* Success */}
                {success && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>
                  </div>
                )}

                {/* General Error */}
                {errors.general && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{errors.general}</span>
                  </div>
                )}

                <form
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >

                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-[#2F184B]"
                    >
                      New Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                      />

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className={`w-full rounded-xl border bg-white/80 py-3.5 pl-11 pr-12 text-sm text-[#2F184B] outline-none transition-all placeholder:text-[#532B88]/35 ${
                          errors.password
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                            : "border-[#C8B1E4]/60 focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B72CF] transition-colors hover:text-[#532B88]"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.password}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-[#532B88]/50">
                      Use 8+ characters with uppercase,
                      lowercase, number and special character.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-[#2F184B]"
                    >
                      Confirm New Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                      />

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={
                          handleConfirmPasswordChange
                        }
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className={`w-full rounded-xl border bg-white/80 py-3.5 pl-11 pr-12 text-sm text-[#2F184B] outline-none transition-all placeholder:text-[#532B88]/35 ${
                          errors.confirmPassword
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                            : "border-[#C8B1E4]/60 focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B72CF] transition-colors hover:text-[#532B88]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Reset Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !!success}
                    whileHover={{
                      scale:
                        isLoading || success ? 1 : 1.01,
                    }}
                    whileTap={{
                      scale:
                        isLoading || success ? 1 : 0.98,
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#532B88] to-[#9B72CF] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#532B88]/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Resetting Password...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 size={18} />
                        Password Reset
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Reset Password
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ---------------------------------------
                Security Footer
            --------------------------------------- */}
            <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#C8B1E4]/30 pt-5">
              <ShieldCheck
                size={15}
                className="text-[#9B72CF]"
              />

              <p className="text-xs text-[#532B88]/55">
                Your account information is protected
              </p>
            </div>
          </motion.div>

          {/* ---------------------------------------
              Footer
          --------------------------------------- */}
          <p className="mt-6 text-center text-xs text-[#532B88]/45">
            © {new Date().getFullYear()} WorkPulse. Employee
            productivity management.
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default ForgotPassword;
