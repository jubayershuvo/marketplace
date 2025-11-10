"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Save,
  Activity,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { adminLogin, adminLogout } from "@/lib/adminSlice";

// Type definitions
interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "moderator";
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  lastLoginIp: string | null;
  loginAttempts: number;
  lockUntil: string | null;
}

interface UpdateData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function AdminProfile() {
  const [editing, setEditing] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<UpdateData>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const { admin } = useAppSelector((state) => state.adminAuth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleInputChange = (field: keyof UpdateData, value: string): void => {
    setUpdateData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async (): Promise<void> => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/logout");

      if (response.ok) {
        dispatch(adminLogout());
        router.push("/login");
      } else {
        setMessage({ type: "error", text: "Failed to logout" });
      }
    } catch (error) {
      console.error("Error logging out:", error);
      setMessage({
        type: "error",
        text: "An error occurred while logging out",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!admin) return;

    // Validation
    if (
      updateData.newPassword &&
      updateData.newPassword !== updateData.confirmPassword
    ) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (updateData.newPassword && updateData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update Redux store with new admin data
        dispatch(
          adminLogin({
            admin: data.admin,
            token: data.token, // Keep existing token if not provided
            refreshToken: data.refreshToken, // Keep existing if not provided
          })
        );

        setMessage({
          type: "success",
          text: data.message || "Profile updated successfully",
        });
        setEditing(false);
        setUpdateData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "An error occurred while updating profile",
      });
    } finally {
      setSaving(false);
    }
  };
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Admin Profile
            </h1>
            <p className="text-purple-300">
              Manage your account settings and security
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-500/20 border-green-400/30 text-green-400"
                : "bg-red-500/20 border-red-400/30 text-red-400"
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <p>{message.text}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{admin.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Shield
                  className={`w-4 h-4 ${
                    admin.role === "admin" ? "text-yellow-400" : "text-blue-400"
                  }`}
                />
                <span
                  className={`text-sm font-semibold uppercase ${
                    admin.role === "admin" ? "text-yellow-400" : "text-blue-400"
                  }`}
                >
                  {admin.role}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={
                    updateData.name !== undefined ? updateData.name : admin.name
                  }
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                />
              ) : (
                <p className="text-white text-lg">{admin.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              {editing ? (
                <input
                  type="email"
                  value={
                    updateData.email !== undefined
                      ? updateData.email
                      : admin.email
                  }
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                />
              ) : (
                <p className="text-white text-lg">{admin.email}</p>
              )}
            </div>

            {/* Password Fields - Only in Edit Mode */}
            {editing && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2">
                    <Lock className="w-4 h-4" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={updateData.currentPassword || ""}
                      onChange={(e) =>
                        handleInputChange("currentPassword", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                      placeholder="Enter current password to change"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2">
                    <Lock className="w-4 h-4" />
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={updateData.newPassword || ""}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2">
                    <Lock className="w-4 h-4" />
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={updateData.confirmPassword || ""}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setUpdateData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setMessage(null);
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditing(true);
                  setUpdateData({
                    name: admin.name,
                    email: admin.email,
                  });
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Account Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">
            Account Activity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">Member Since</p>
                <p className="text-white font-semibold">
                  {formatDate(admin.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">Last Login</p>
                <p className="text-white font-semibold">
                  {formatDate(admin.lastLogin)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">Last Login IP</p>
                <p className="text-white font-semibold">
                  {admin.lastLoginIp || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">Login Attempts</p>
                <p className="text-white font-semibold">
                  {admin.loginAttempts}
                </p>
              </div>
            </div>
          </div>

          {admin.lockUntil && new Date(admin.lockUntil) > new Date() && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-semibold">Account Locked</p>
                  <p className="text-red-300 text-sm">
                    Until: {formatDate(admin.lockUntil)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
