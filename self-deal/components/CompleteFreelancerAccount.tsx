import React, { useState, useCallback, useRef } from "react";
import {
  User,
  BookOpen,
  Award,
  Globe,
  Briefcase,
  Plus,
  X,
  Save,
  Camera,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/userSlice";

interface FreelancerProfile {
  displayName?: string;
  description?: string;
  skills?: string[];
  languages?: string[];
  education?: string[];
  certifications?: string[];
  avatar?: string;
}

// Isolated TagInput component that maintains its own state
const IsolatedTagInput: React.FC<{
  label: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  error?: string;
  required?: boolean;
}> = ({
  label,
  items,
  onAdd,
  onRemove,
  placeholder,
  error,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
            error
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600"
          }`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-1"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-green-600 dark:text-green-300 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

const CompleteFreelancerAccount: React.FC = () => {
  const [profile, setProfile] = useState<FreelancerProfile>({
    displayName: "",
    description: "",
    skills: [],
    languages: [],
    education: [],
    certifications: [],
    avatar: "",
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const { user } = useAppSelector((state) => state.userAuth);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleInputChange = (field: keyof FreelancerProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));

    // Clear error if exists
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
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Image size should be less than 5MB",
        }));
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setProfile((prev) => ({ ...prev, avatar: result }));

        // Clear any avatar errors
        if (errors.avatar) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.avatar;
            return newErrors;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateCurrentTab = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (activeTab === "basic") {
      if (!profile.displayName?.trim()) {
        newErrors.displayName = "Display name is required";
      }
      if (!profile.description?.trim()) {
        newErrors.description = "Professional description is required";
      }
      if (!profile.avatar?.trim() && !avatarPreview) {
        newErrors.avatar = "Profile avatar is required";
      }
    } else if (activeTab === "skills") {
      if (!profile.skills || profile.skills.length === 0) {
        newErrors.skills = "At least one skill is required";
      }
    } else if (activeTab === "languages") {
      if (!profile.languages || profile.languages.length === 0) {
        newErrors.languages = "At least one language is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getNextTab = (currentTab: string): string | null => {
    const tabs = [
      "basic",
      "skills",
      "languages",
      "education",
      "certifications",
    ];
    const currentIndex = tabs.indexOf(currentTab);
    return currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : null;
  };

  const getPrevTab = (currentTab: string): string | null => {
    const tabs = [
      "basic",
      "skills",
      "languages",
      "education",
      "certifications",
    ];
    const currentIndex = tabs.indexOf(currentTab);
    return currentIndex > 0 ? tabs[currentIndex - 1] : null;
  };

  const handleNext = () => {
    if (validateCurrentTab()) {
      const nextTab = getNextTab(activeTab);
      if (nextTab) {
        setActiveTab(nextTab);
      }
    }
  };

  const handlePrevious = () => {
    const prevTab = getPrevTab(activeTab);
    if (prevTab) {
      setActiveTab(prevTab);
      setErrors({});
    }
  };

  const isRequiredTab = (tab: string): boolean => {
    return ["basic", "skills", "languages"].includes(tab);
  };

  const isTabCompleted = (tab: string): boolean => {
    switch (tab) {
      case "basic":
        return !!(
          profile.displayName?.trim() &&
          profile.description?.trim() &&
          (profile.avatar?.trim() || avatarPreview)
        );
      case "skills":
        return !!(profile.skills && profile.skills.length > 0);
      case "languages":
        return !!(profile.languages && profile.languages.length > 0);
      case "education":
        return !!(profile.education && profile.education.length > 0);
      case "certifications":
        return !!(profile.certifications && profile.certifications.length > 0);
      default:
        return false;
    }
  };

  const canProceedToFinal = (): boolean => {
    return (
      isTabCompleted("basic") &&
      isTabCompleted("skills") &&
      isTabCompleted("languages")
    );
  };

  const addSkill = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), value],
    }));

    // Clear skills error
    if (errors.skills) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.skills;
        return newErrors;
      });
    }
  };

  const addLanguage = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      languages: [...(prev.languages || []), value],
    }));

    // Clear languages error
    if (errors.languages) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.languages;
        return newErrors;
      });
    }
  };

  const addEducation = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      education: [...(prev.education || []), value],
    }));
  };

  const addCertification = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), value],
    }));
  };

  const removeSkill = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || [],
    }));
  };

  const removeLanguage = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages?.filter((_, i) => i !== index) || [],
    }));
  };

  const removeEducation = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index) || [],
    }));
  };

  const removeCertification = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async () => {
    if (canProceedToFinal()) {
      try {
        const res = await fetch("/api/users/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?._id, // replace with actual userId (from auth/session)
            ...profile,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(
            `❌ Failed to update profile: ${data?.error || "Unknown error"}`
          );
          return;
        }
        dispatch(updateUser(data.user));

        router.push("/");
      } catch (error) {
        console.error("Update failed:", error);
        alert("❌ Something went wrong while updating profile");
      }
    } else {
      alert(
        "Please complete all required sections (Avatar, Basic Info, Skills, and Languages) first."
      );
    }
  };

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }> = ({ id, label, icon }) => {
    const isCompleted = isTabCompleted(id);
    const isRequired = isRequiredTab(id);

    return (
      <button
        type="button"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 relative ${
          activeTab === id
            ? "bg-green-500 text-white shadow-md"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
        {isRequired && <span className="text-red-500 text-xs ml-1">*</span>}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Freelancer Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stand out from the crowd with a compelling profile that showcases
            your expertise
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
                      alt="Profile Avatar"
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
                  {profile.displayName || "Your Name"}
                </h2>
                <p className="text-white/80">Professional Freelancer</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <TabButton
                id="basic"
                label="Basic Info"
                icon={<User size={16} />}
              />
              <TabButton
                id="skills"
                label="Skills"
                icon={<Briefcase size={16} />}
              />
              <TabButton
                id="languages"
                label="Languages"
                icon={<Globe size={16} />}
              />
              <TabButton
                id="education"
                label="Education"
                icon={<BookOpen size={16} />}
              />
              <TabButton
                id="certifications"
                label="Certifications"
                icon={<Award size={16} />}
              />
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
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                      Click the camera icon above to upload your profile picture
                      (JPG, PNG, max 5MB)
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.displayName || ""}
                    onChange={(e) =>
                      handleInputChange("displayName", e.target.value)
                    }
                    placeholder="Enter your professional name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                      errors.displayName
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.displayName && (
                    <p className="text-red-500 dark:text-red-400 text-sm">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Professional Description
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={profile.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your expertise and what makes you unique..."
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                      errors.description
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 dark:text-red-400 text-sm">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <IsolatedTagInput
                label="Skills & Expertise"
                items={profile.skills || []}
                onAdd={addSkill}
                onRemove={removeSkill}
                placeholder="e.g., React, Node.js, UI/UX Design"
                error={errors.skills}
                required
              />
            )}

            {activeTab === "languages" && (
              <IsolatedTagInput
                label="Languages"
                items={profile.languages || []}
                onAdd={addLanguage}
                onRemove={removeLanguage}
                placeholder="e.g., English (Native), Spanish (Fluent)"
                error={errors.languages}
                required
              />
            )}

            {activeTab === "education" && (
              <IsolatedTagInput
                label="Education"
                items={profile.education || []}
                onAdd={addEducation}
                onRemove={removeEducation}
                placeholder="e.g., Bachelor's in Computer Science - MIT (2020)"
              />
            )}

            {activeTab === "certifications" && (
              <IsolatedTagInput
                label="Certifications"
                items={profile.certifications || []}
                onAdd={addCertification}
                onRemove={removeCertification}
                placeholder="e.g., AWS Certified Developer, Google Analytics Certified"
              />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isRequiredTab(activeTab) ? (
                  <span className="flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    Required section - complete to continue
                  </span>
                ) : (
                  "Optional section - you can skip this"
                )}
              </div>
              <div className="flex space-x-3">
                {getPrevTab(activeTab) && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Previous
                  </button>
                )}
                {getNextTab(activeTab) ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg ${
                      isRequiredTab(activeTab) && !isTabCompleted(activeTab)
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    disabled={
                      isRequiredTab(activeTab) && !isTabCompleted(activeTab)
                    }
                  >
                    <span>Next Step</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className={`px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg ${
                      canProceedToFinal()
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                    disabled={!canProceedToFinal()}
                  >
                    <Save size={16} />
                    <span>Complete Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Completion
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(
                (Object.values(profile).filter((value) =>
                  typeof value === "string"
                    ? value.length > 0
                    : Array.isArray(value) && value.length > 0
                ).length /
                  Object.keys(profile).length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(
                  (Object.values(profile).filter((value) =>
                    typeof value === "string"
                      ? value.length > 0
                      : Array.isArray(value) && value.length > 0
                  ).length /
                    Object.keys(profile).length) *
                    100
                )}%`,
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Required sections: Profile Photo, Basic Info, Skills, Languages
            {!canProceedToFinal() && (
              <span className="text-red-500 ml-2">
                (Complete required sections to finish)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteFreelancerAccount;
