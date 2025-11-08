"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Clock,
  Shield,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

type VerificationStatus = "pending" | "verified" | "error";
type PasswordResetStatus = "idle" | "loading" | "success" | "error";

export default function ResetPasswordOTPVerify() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("pending");
  const [passwordResetStatus, setPasswordResetStatus] =
    useState<PasswordResetStatus>("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [token, setToken] = useState("");
  const [hasError, setHasError] = useState(false); // New state for tracking OTP error

  // Password fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();
  const maxAttempts = 3;

  // Refs for OTP inputs
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Initialize from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");

    if (!emailParam) {
      console.log("No email found, redirecting to forgot password...");
      setMessage("No email parameter found. Redirecting...");
      router.push("/forgot-password");
      return;
    }

    setEmail(decodeURIComponent(emailParam));
    // Remove the initial message to avoid showing it as error
    setMessage("");
  }, [router]);

  // Countdown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, canResend]);

  // Reset error state when OTP changes
  useEffect(() => {
    if (hasError && otp.some(digit => digit !== "")) {
      setHasError(false);
    }
  }, [otp, hasError]);

  // Auto-focus next input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      setTimeout(() => verifyOtpCode(newOtp.join("")), 100);
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      setHasError(false); // Reset error on paste
      inputRefs.current[5]?.focus();
      setTimeout(() => verifyOtpCode(pasteData), 100);
    }
  };

  // Verify OTP
  const verifyOtpCode = async (otpCode: string) => {
    if (otpCode.length !== 6 || attempts >= maxAttempts || !email) return;

    setIsLoading(true);
    setMessage("");
    setHasError(false); // Reset error state

    try {
      const response = await fetch("/api/resetPassword/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        setVerificationStatus("verified");
        setMessage(
          "OTP verified successfully! You can now reset your password."
        );
        setHasError(false);
      } else {
        setVerificationStatus("pending"); // Keep as pending to show OTP inputs
        setHasError(true); // Set error state
        setAttempts((prev) => prev + 1);

        if (response.status === 400) {
          setMessage(data.error || "Invalid or expired OTP.");
        } else if (response.status === 404) {
          setMessage("User not found. Please try again.");
        } else {
          const remainingAttempts = maxAttempts - attempts - 1;
          setMessage(
            data.error ||
              `Invalid OTP. ${remainingAttempts} attempts remaining.`
          );

          if (remainingAttempts <= 0) {
            setMessage("Maximum attempts reached. Please request a new OTP.");
          }
        }

        // Don't clear OTP inputs on error - let user see and correct
        // Focus on first input for easy re-entry
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setVerificationStatus("pending"); // Keep as pending to show OTP inputs
      setHasError(true);
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validate password
  const validatePassword = (pass: string): string => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pass)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  // Reset password
  const handleResetPassword = async () => {
    // Validate passwords
    const passError = validatePassword(password);
    if (passError) {
      setPasswordError(passError);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!token) {
      setPasswordError("Invalid token. Please verify OTP again.");
      return;
    }

    setPasswordResetStatus("loading");
    setPasswordError("");

    try {
      const response = await fetch("/api/resetPassword/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordResetStatus("success");
        setMessage("Password reset successfully! Redirecting to login...");

        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setPasswordResetStatus("error");
        setPasswordError(
          data.error || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      setPasswordResetStatus("error");
      setPasswordError("Network error. Please try again.");
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (!canResend || !email) return;

    setIsResending(true);
    setAttempts(0);
    setOtp(Array(6).fill(""));
    setMessage("");
    setVerificationStatus("pending");
    setHasError(false); // Reset error state

    try {
      const response = await fetch(`/api/resetPassword?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("New OTP sent! Please check your inbox and spam folder.");
        setCanResend(false);
        setCountdown(60);
        inputRefs.current[0]?.focus();
      } else {
        setMessage(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    if (passwordResetStatus === "success") {
      return <CheckCircle2 className="w-16 h-16 text-green-500" />;
    }

    if (verificationStatus === "verified") {
      return <Lock className="w-16 h-16 text-blue-500" />;
    }

    if (hasError) {
      return <XCircle className="w-16 h-16 text-red-500" />;
    }

    return isLoading ? (
      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
    ) : (
      <Shield className="w-16 h-16 text-blue-500" />
    );
  };

  const getStatusTitle = () => {
    if (passwordResetStatus === "success") {
      return "Password Reset Successfully!";
    }

    if (verificationStatus === "verified") {
      return "Create New Password";
    }

    if (hasError) {
      return "Verification Failed";
    }

    return isLoading ? "Verifying OTP..." : "Verify Your Identity";
  };

  const getStatusColor = () => {
    if (passwordResetStatus === "success") {
      return "text-green-600 dark:text-green-400";
    }

    if (hasError) {
      return "text-red-600 dark:text-red-400";
    }

    if (verificationStatus === "verified") {
      return "text-blue-600 dark:text-blue-400";
    }

    return "text-blue-600 dark:text-blue-400";
  };

  const isMaxAttemptsReached = attempts >= maxAttempts;

  // Show OTP inputs when verification is pending OR when there's an error
  const showOtpInputs = verificationStatus === "pending" || hasError;

  if (!email) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center max-w-md">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Invalid Access
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message || "No email parameter found. Redirecting..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.push("/forgot-password")}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="max-w-md w-full">
            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              {/* Status Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-700">
                  {getStatusIcon()}
                </div>
              </div>

              {/* Status Title */}
              <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                {getStatusTitle()}
              </h1>

              {/* Email Display */}
              {email && (
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Password reset for:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {email}
                  </p>
                </div>
              )}

              {/* Success State */}
              {passwordResetStatus === "success" && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      {message}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Redirecting to login...
                  </p>
                </div>
              )}

              {/* OTP Verification Step - Show when pending OR when there's error */}
              {showOtpInputs && passwordResetStatus === "idle" && (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {hasError 
                      ? "Please correct the OTP and try again" 
                      : "Enter the 6-digit verification code sent to your email"
                    }
                  </p>

                  {/* OTP Input Fields */}
                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          if (el) {
                            inputRefs.current[index] = el;
                          }
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={isLoading || isMaxAttemptsReached}
                        className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none ${
                          hasError
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : digit
                            ? "border-blue-500 focus:ring-blue-500"
                            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={() => verifyOtpCode(otp.join(""))}
                    disabled={
                      otp.some((digit) => !digit) ||
                      isLoading ||
                      isMaxAttemptsReached
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        {hasError ? "Try Again" : "Verify Code"}
                      </>
                    )}
                  </button>

                  {/* Message Display */}
                  {message && message.includes("Invalid") && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-400 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {message}
                      </p>
                    </div>
                  )}

                  {message && message.includes("sent") && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {message}
                      </p>
                    </div>
                  )}

                  {message && !message.includes("sent") && !message.includes("Invalid") && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {message}
                      </p>
                    </div>
                  )}

                  {/* Resend Button */}
                  <button
                    onClick={resendOtp}
                    disabled={isResending || !canResend}
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : !canResend ? (
                      <>
                        <Clock className="w-5 h-5 mr-2" />
                        Resend in {countdown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Resend Code
                      </>
                    )}
                  </button>

                  {/* Attempts Counter */}
                  {attempts > 0 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {maxAttempts - attempts} attempts remaining
                    </p>
                  )}
                </div>
              )}

              {/* Password Reset Step */}
              {verificationStatus === "verified" &&
                passwordResetStatus !== "success" && (
                  <div className="space-y-6">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                      <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Identity verified! Create your new password
                      </p>
                    </div>

                    {/* Password Input */}
                    <div className="text-left">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Enter new password"
                          className="w-full pl-10 pr-12 py-3 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="text-left">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Confirm new password"
                          className="w-full pl-10 pr-12 py-3 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        />
                        <button
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-left">
                      <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">
                        Password Requirements:
                      </p>
                      <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• One uppercase letter</li>
                        <li>• One lowercase letter</li>
                        <li>• One number</li>
                      </ul>
                    </div>

                    {/* Error Message */}
                    {passwordError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-400 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {passwordError}
                        </p>
                      </div>
                    )}

                    {/* Reset Password Button */}
                    <button
                      onClick={handleResetPassword}
                      disabled={
                        !password ||
                        !confirmPassword ||
                        passwordResetStatus === "loading"
                      }
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center"
                    >
                      {passwordResetStatus === "loading" ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          Reset Password
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>

            {/* Help Section */}
            <div className="mt-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                      {showOtpInputs
                        ? "Didn't receive the code?"
                        : "Password Tips"}
                    </h3>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      {showOtpInputs ? (
                        <>
                          <li>• Check your spam/junk folder</li>
                          <li>• The code expires in 10 minutes</li>
                          <li>• Click resend to get a new code</li>
                        </>
                      ) : (
                        <>
                          <li>• Use a unique password</li>
                          <li>• Avoid common words or patterns</li>
                          <li>• Consider using a passphrase</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
                    Secure Process
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your password reset is protected with OTP verification and
                    secure encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}