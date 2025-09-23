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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { userLogin } from "@/lib/userSlice";
import axios from "axios";

type VerificationStatus = "pending" | "success" | "error";

export default function VerifyEmailOTP() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("pending");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [otpFromQuery, setOtpFromQuery] = useState("");
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const { isLoggedIn, user } = useAppSelector((state) => state.userAuth);
  const router = useRouter();
  const maxAttempts = 3;
  const dispatch = useAppDispatch();

  // Refs for OTP inputs
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isLoggedIn && user.isEmailVerified) {
      router.push("/");
    }
  }, []);

  // Initialize from URL parameters and handle different scenarios
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    const otpParam = urlParams.get("otp");

    // Scenario 1: No email - redirect to signup
    if (!emailParam) {
      console.log("No email found, redirecting to signup...");
      setMessage("No email parameter found. Redirecting to signup...");
      router.push("/");
      return;
    }

    // Set email
    setEmail(decodeURIComponent(emailParam));

    // Scenario 2: Both email and OTP in query - auto verify
    if (emailParam && otpParam) {
      setOtpFromQuery(otpParam);
      setIsAutoVerifying(true);
      autoVerifyWithEmailAndOtp(decodeURIComponent(emailParam), otpParam);
      return;
    }

    // Scenario 3: Only email - show OTP input form
    if (emailParam && !otpParam) {
      setMessage(
        "Please enter the 6-digit verification code sent to your email."
      );
    }
  }, []);

  useEffect(() => {
    if (user.isEmailVerified) {
      router.push("/complete-profile");
    }
  }, [user]);

  // Theme tog

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

  // Auto verify when both email and OTP are provided in URL
  const autoVerifyWithEmailAndOtp = async (
    emailParam: string,
    otpParam: string
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailParam,
          otp: otpParam,
        }),
      });

      const data: { message?: string } = await response.json();

      if (response.ok) {
        setVerificationStatus("success");
        setMessage(
          "Your email has been successfully verified! Redirecting to login..."
        );

        // Auto redirect to login after 3 seconds
        router.push("/complete-profile");
      } else {
        setVerificationStatus("error");
        setMessage(
          data.message ||
            "Verification failed. Please try manually entering the OTP."
        );
        setIsAutoVerifying(false);
      }
    } catch (error) {
      setVerificationStatus("error");
      setMessage("Network error. Please try manually entering the OTP.");
      setIsAutoVerifying(false);
    } finally {
      setIsLoading(false);
    }
  };

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
      setTimeout(() => verifyOtpWithEmail(newOtp.join("")), 100);
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
      inputRefs.current[5]?.focus();
      setTimeout(() => verifyOtpWithEmail(pasteData), 100);
    }
  };

  // Verify OTP with email
  const verifyOtpWithEmail = async (otpCode: string) => {
    if (otpCode.length !== 6 || attempts >= maxAttempts || !email) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post("/api/verify-otp", {
        email: email,
        otp: otpCode,
      }, {
        withCredentials: true,
      });

      const data = response.data;

      if (response.status === 200) {
        dispatch(userLogin(data));
        setVerificationStatus("success");
        setMessage(
          "Your email has been successfully verified! Redirecting to login..."
        );

        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/complete-profile");
        }, 3000);
      } else {
        setVerificationStatus("error");
        setAttempts((prev) => prev + 1);

        if (response.status === 410) {
          setMessage("OTP has expired. Please request a new one.");
        } else if (response.status === 429) {
          setMessage("Too many attempts. Please wait before trying again.");
        } else {
          const remainingAttempts =
            data.remainingAttempts ?? maxAttempts - attempts - 1;
          setMessage(
            data.message ||
              `Invalid OTP. ${remainingAttempts} attempts remaining.`
          );

          if (remainingAttempts <= 0) {
            setMessage("Maximum attempts reached. Please request a new OTP.");
          }
        }

        // Clear OTP inputs on error
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setVerificationStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (!canResend || !email) return;

    setIsResending(true);
    setAttempts(0); // Reset attempts on new OTP
    setOtp(Array(6).fill("")); // Clear current OTP
    setMessage("");
    setVerificationStatus("pending");

    try {
      const response = await fetch("/api/create-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data: { message?: string } = await response.json();

      if (response.ok) {
        setMessage("New OTP sent! Please check your inbox and spam folder.");
        setCanResend(false);
        setCountdown(60); // 60 seconds cooldown
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
    switch (verificationStatus) {
      case "success":
        return <CheckCircle2 className="w-16 h-16 text-green-500" />;
      case "error":
        return <XCircle className="w-16 h-16 text-red-500" />;
      case "pending":
      default:
        return isLoading ? (
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        ) : (
          <Shield className="w-16 h-16 text-blue-500" />
        );
    }
  };

  const getStatusTitle = () => {
    if (isAutoVerifying) {
      return "Auto-Verifying Email...";
    }

    switch (verificationStatus) {
      case "success":
        return "Email Verified Successfully!";
      case "error":
        return "Verification Failed";
      case "pending":
      default:
        return isLoading ? "Verifying OTP..." : "Enter Verification Code";
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "pending":
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const isMaxAttemptsReached = attempts >= maxAttempts;

  // Don't render the form if no email (will redirect)
  if (!email) {
    return (
      <div className={`min-h-screen transition-colors duration-300`}>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center max-w-md">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Invalid Access
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message ||
                "No email parameter found. You will be redirected to signup."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300`}>
      {/* Background with gradient */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => window.history.back()}
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

              {/* Auto-verifying state */}
              {isAutoVerifying && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Automatically verifying your email with the provided code...
                  </p>
                  <div className="flex justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                </div>
              )}

              {/* Description - only show if not auto-verifying and not success */}
              {!isAutoVerifying && verificationStatus === "pending" && (
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  We&apos;ve sent a 6-digit verification code to your email
                  address
                </p>
              )}

              {/* Email Display */}
              {email && (
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Verification code sent to:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {email}
                  </p>
                </div>
              )}

              {/* Success State */}
              {verificationStatus === "success" && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      {message}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Redirecting automatically...
                  </p>
                </div>
              )}

              {/* OTP Input - Only show if not success and not auto-verifying */}
              {verificationStatus !== "success" && !isAutoVerifying && (
                <div className="space-y-6">
                  {/* Show OTP from query if available */}
                  {otpFromQuery && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Using OTP from verification link:{" "}
                        <span className="font-mono font-bold">
                          {otpFromQuery}
                        </span>
                      </p>
                    </div>
                  )}

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
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={isLoading || isMaxAttemptsReached}
                        className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none ${
                          verificationStatus === "error"
                            ? "border-red-500 focus:ring-red-500"
                            : digit
                            ? "border-green-500 focus:ring-green-500"
                            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        } ${
                          isMaxAttemptsReached
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    ))}
                  </div>

                  {/* Manual Verify Button */}
                  <button
                    onClick={() => verifyOtpWithEmail(otp.join(""))}
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
                        Verify Code
                      </>
                    )}
                  </button>

                  {/* Error Message */}
                  {message && verificationStatus === "error" && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-400 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {message}
                      </p>
                    </div>
                  )}

                  {/* Success Message for Resend */}
                  {message &&
                    verificationStatus === "pending" &&
                    message.includes("sent") && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
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
            </div>

            {/* Help Section */}
            <div className="mt-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                      Didn&apos;t receive the code?
                    </h3>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Check your spam/junk folder</li>
                      <li>• Make sure the email address is correct</li>
                      <li>• Wait a few minutes for delivery</li>
                      <li>• The code expires in 10 minutes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Still having trouble?
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  FAQ
                </a>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
                    Secure Verification
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your verification code is unique and expires in 10 minutes
                    for your security.
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
