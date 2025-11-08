"use client";
import React, { useState } from "react";
import {
  Mail,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Shield,
  Lock,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";

type RequestStatus = "idle" | "loading" | "success" | "error";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError("");
    setMessage("");
    
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/resetPassword?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          data.message || 
          "Password reset link has been sent to your email. Please check your inbox and spam folder."
        );
        router.push(`/forget-password/verify?email=${email}`);
      } else {
        setStatus("error");
        setMessage(
          data.message || 
          "Failed to send reset link. Please try again or contact support."
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-16 h-16 text-green-500" />;
      case "error":
        return <XCircle className="w-16 h-16 text-red-500" />;
      case "loading":
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      default:
        return <Lock className="w-16 h-16 text-blue-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "success":
        return "Reset Link Sent!";
      case "error":
        return "Request Failed";
      case "loading":
        return "Sending Reset Link...";
      default:
        return "Reset Your Password";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "loading":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-900 dark:text-white";
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Background with gradient */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="max-w-md w-full">
            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              {/* Status Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-700">
                  {getStatusIcon()}
                </div>
              </div>

              {/* Status Title */}
              <h1 className={`text-2xl font-bold mb-4 text-center ${getStatusColor()}`}>
                {getStatusTitle()}
              </h1>

              {/* Success State */}
              {status === "success" ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <p className="text-green-800 dark:text-green-300 text-center leading-relaxed">
                      {message}
                    </p>
                  </div>

                  {/* Email Display */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 text-center">
                      Reset link sent to:
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {email}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/login")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to Login
                    </button>

                    <button
                      onClick={() => {
                        setStatus("idle");
                        setEmail("");
                        setMessage("");
                      }}
                      className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Another Link
                    </button>
                  </div>
                </div>
              ) : (
                /* Form State */
                <div className="space-y-6">
                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>

                  {/* Form */}
                  <div className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && email && !emailError && status !== "loading") {
                              handleSubmit(e);
                            }
                          }}
                          placeholder="you@example.com"
                          disabled={status === "loading"}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-200 ${
                            emailError
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                          } ${status === "loading" ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                      </div>
                      {emailError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {emailError}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={status === "loading" || !email || !!emailError}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending Otp...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Otp
                        </>
                      )}
                    </button>

                    {/* Error Message */}
                    {message && status === "error" && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-400 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Back to Login Link */}
                  <div className="text-center">
                    <button
                      onClick={() => router.push("/login")}
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors inline-flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to Login
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help Section */}
            {status !== "success" && (
              <div className="mt-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                        Password Reset Instructions
                      </h3>
                      <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                        <li>• Enter your registered email address</li>
                        <li>• Check your inbox for the reset link</li>
                        <li>• The link expires in 1 hour</li>
                        <li>• Check spam folder if not received</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Need help?
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
                    Secure Password Reset
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your password reset link is unique and expires in 1 hour for your security.
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