"use client";
import React, { useState } from "react";
import { User, Save, Camera } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/userSlice";

interface ClientProfile {
  companyName?: string;
  companyDescription?: string;
  avatar?: string;
}

const CompleteClientAccount: React.FC = () => {
  const [profile, setProfile] = useState<ClientProfile>({
    companyName: "",
    companyDescription: "",
    avatar: "",
  });

  const [activeTab, setActiveTab] = useState<"basic" | "final">("basic");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const { user } = useAppSelector((state) => state.userAuth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleInputChange = (field: keyof ClientProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Image size should be less than 5MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      setProfile((prev) => ({ ...prev, avatar: result }));
      if (errors.avatar) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.avatar;
          return newErrors;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const validateCurrentTab = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (activeTab === "basic") {
      if (!profile.companyName?.trim())
        newErrors.companyName = "Company name is required";
      if (!profile.companyDescription?.trim())
        newErrors.companyDescription = "Company description is required";
      if (!profile.avatar?.trim() && !avatarPreview)
        newErrors.avatar = "Company avatar is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentTab()) setActiveTab("final");
  };

  const handlePrevious = () => {
    setActiveTab("basic");
    setErrors({});
  };

  const canProceedToFinal = (): boolean => {
    return !!(
      profile.companyName?.trim() &&
      profile.companyDescription?.trim() &&
      (profile.avatar?.trim() || avatarPreview)
    );
  };

  const handleSubmit = async () => {
    if (!canProceedToFinal()) {
      alert("Please complete all required sections first.");
      return;
    }

    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id, ...profile }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`❌ Failed to update profile: ${data?.error || "Unknown error"}`);
        return;
      }

      dispatch(updateUser(data.user));
      router.push("/");
    } catch (error) {
      console.error("Update failed:", error);
      alert("❌ Something went wrong while updating profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Company Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showcase your company and attract top talent by completing your
            profile
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
                    avatarPreview || profile.avatar
                      ? "bg-gray-200"
                      : "bg-white/20"
                  }`}
                >
                  {avatarPreview || profile.avatar ? (
                    <img
                      src={avatarPreview || profile.avatar}
                      alt="Company Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer">
                  <Camera size={16} className="text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                {errors.avatar && activeTab === "basic" && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <p className="text-red-200 text-xs bg-red-500/20 px-2 py-1 rounded backdrop-blur-sm">
                      Avatar required
                    </p>
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profile.companyName || "Company Name"}
                </h2>
                <p className="text-white/80">
                  {profile.companyDescription || "Describe your company"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "basic" && (
              <div className="space-y-6">
                {errors.avatar && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                        {errors.avatar}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.companyName || ""}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    placeholder="Enter your company name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                      errors.companyName
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 dark:text-red-400 text-sm">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Description
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={profile.companyDescription || ""}
                    onChange={(e) =>
                      handleInputChange("companyDescription", e.target.value)
                    }
                    placeholder="Describe your company, mission, and vision..."
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                      errors.companyDescription
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.companyDescription && (
                    <p className="text-red-500 dark:text-red-400 text-sm">
                      {errors.companyDescription}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "final" && (
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`px-6 py-2 flex items-center space-x-2 gap-1  rounded-lg transition-colors duration-200 shadow-md ${
                    canProceedToFinal()
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                  disabled={!canProceedToFinal()}
                >
                  <Save size={16} /> Complete Profile
                </button>
              </div>
            )}

            {activeTab === "basic" && (
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleNext}
                  className={`px-6 py-2 rounded-lg transition-colors duration-200 shadow-md ${
                    canProceedToFinal()
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                  disabled={!canProceedToFinal()}
                >
                  Next Step →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteClientAccount;
