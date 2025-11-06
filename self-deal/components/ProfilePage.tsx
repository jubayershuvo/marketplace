"use client";
import { useEffect, useState } from "react";
import { MapPin, Star, Edit2, Save, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import Loading from "./Loading";
import axios from "axios";

// Type definitions based on your User interface
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  companyName: string;
  username: string;
  email: string;
  userType: "guest" | "client" | "freelancer";
  avatar: string;
  level: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBanned: boolean;
  isActive: boolean;
  loginAttempts: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  certifications: string[];
  completedOrders: number;
  earnings: number;
  education: string[];
  languages: string[];
  lastLogin: string;
  lastSeen: string;
  lastLoginIp: string;
  location: string;
  memberSince: string;
  ordersCount: number;
  pendingBalance: number;
  pendingOrders: number;
  responseTime: string;
  reviewsCount: number;
  rating: number;
  skills: string[];
  spent: number;
}

// Type guards
function isFreelancer(user: User): boolean {
  return user.userType === "freelancer";
}

function isClient(user: User): boolean {
  return user.userType === "client";
}

// Helper type for array fields
type ArrayField<T> = {
  [K in keyof T]: T[K] extends string[] ? K : never;
}[keyof T];

type UserArrayField = ArrayField<User>;

// Editable fields (excluding non-editable fields)
type ExcludedFields =
  | "_id"
  | "username"
  | "email"
  | "userType"
  | "level"
  | "isEmailVerified"
  | "isPhoneVerified"
  | "isBanned"
  | "isActive"
  | "loginAttempts"
  | "createdAt"
  | "updatedAt"
  | "__v"
  | "completedOrders"
  | "earnings"
  | "lastLogin"
  | "lastSeen"
  | "lastLoginIp"
  | "memberSince"
  | "ordersCount"
  | "pendingBalance"
  | "pendingOrders"
  | "responseTime"
  | "reviewsCount"
  | "rating"
  | "spent";

type AllowedEditableField = Exclude<keyof User, ExcludedFields>;

export default function Profile({ id }: { id?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User>({
    _id: "",
    firstName: "",
    lastName: "",
    displayName: "",
    companyName: "",
    username: "",
    email: "",
    userType: "guest",
    avatar: "",
    level: "",
    isEmailVerified: false,
    isPhoneVerified: false,
    isBanned: false,
    isActive: false,
    loginAttempts: 0,
    createdAt: "",
    updatedAt: "",
    __v: 0,
    certifications: [],
    completedOrders: 0,
    earnings: 0,
    education: [],
    languages: [],
    lastLogin: "",
    lastSeen: "",
    lastLoginIp: "",
    location: "",
    memberSince: "",
    ordersCount: 0,
    pendingBalance: 0,
    pendingOrders: 0,
    responseTime: "",
    reviewsCount: 0,
    rating: 0,
    skills: [],
    spent: 0,
  });
  const [editForm, setEditForm] = useState<User>(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newEducation, setNewEducation] = useState("");
  const [newCertification, setNewCertification] = useState("");

  // Hooks
  const { user: currentUser } = useAppSelector((state) => state.userAuth);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (currentUser?._id === id || currentUser?.username === id) {
      router.push("/profile");
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          id ? `/api/get-profile?id=${id}` : "/api/get-profile",
          { withCredentials: true }
        );
        const data = response.data;
        const userData = data.user;
        setUser(userData);
        setEditForm(userData);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);

        if (error && typeof error === "object" && "response" in error) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 401) {
            router.push("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, currentUser?._id, currentUser?.username]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  const getYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data with only allowed editable fields
      const updateData: Partial<User> = {
        _id: editForm._id,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        avatar: editForm.avatar,
        location: editForm.location,
      };

      // Add user type specific fields
      if (isFreelancer(editForm)) {
        updateData.displayName = editForm.displayName;
        updateData.skills = editForm.skills || [];
        updateData.languages = editForm.languages || [];
        updateData.education = editForm.education || [];
        updateData.certifications = editForm.certifications || [];
      } else if (isClient(editForm)) {
        updateData.companyName = editForm.companyName;
      }

      const response = await axios.put("/api/users/post-update", updateData, {
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error("Failed to update profile");
      }

      const result = response.data;

      if (result.success) {
        setUser(response.data.user);
        setIsEditing(false);
        console.log("Profile updated successfully");
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
    setNewSkill("");
    setNewLanguage("");
    setNewEducation("");
    setNewCertification("");
  };

  const handleArrayAdd = (field: UserArrayField, value: string) => {
    if (value.trim()) {
      setEditForm((prev) => {
        const currentArray = (prev[field] as string[]) || [];
        return {
          ...prev,
          [field]: [...currentArray, value.trim()],
        };
      });
    }
  };

  const handleArrayRemove = (field: UserArrayField, index: number) => {
    setEditForm((prev) => {
      const currentArray = (prev[field] as string[]) || [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index),
      };
    });
  };

  const handleInputChange = (field: AllowedEditableField, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      
      const response = await axios.post("/api/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setEditForm(prev => ({
          ...prev,
          avatar: response.data.avatarUrl
        }));
        console.log("Avatar updated successfully");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    }
  };

  const canEdit = currentUser && user._id === currentUser._id;

  // Render freelancer-specific editing fields
  const renderFreelancerEditingFields = () => {
    if (!isFreelancer(editForm)) return null;

    return (
      <div>
        <label className="block text-sm font-medium mb-1">Professional Title</label>
        <input
          type="text"
          value={editForm.displayName || ""}
          onChange={(e) =>
            handleInputChange("displayName", e.target.value)
          }
          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          placeholder="e.g., Senior Web Developer"
        />
      </div>
    );
  };

  // Render client-specific editing fields
  const renderClientEditingFields = () => {
    if (!isClient(editForm)) return null;

    return (
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <input
          type="text"
          value={editForm.companyName || ""}
          onChange={(e) =>
            handleInputChange("companyName", e.target.value)
          }
          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          placeholder="Enter your company name"
        />
      </div>
    );
  };

  // Render array editing section for freelancers
  const renderFreelancerArraySections = () => {
    if (!isFreelancer(editForm)) return null;

    return (
      <>
        {/* Skills Section */}
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Skills</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {editForm.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => handleArrayRemove("skills", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleArrayAdd("skills", newSkill);
                    setNewSkill("");
                  }
                }}
              />
              <button
                onClick={() => {
                  handleArrayAdd("skills", newSkill);
                  setNewSkill("");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Languages Section */}
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Languages</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {editForm.languages?.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm flex items-center gap-2"
                >
                  {language}
                  <button
                    onClick={() => handleArrayRemove("languages", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add a language"
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleArrayAdd("languages", newLanguage);
                    setNewLanguage("");
                  }
                }}
              />
              <button
                onClick={() => {
                  handleArrayAdd("languages", newLanguage);
                  setNewLanguage("");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Education</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              {editForm.education?.map((edu, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span>{edu}</span>
                  <button
                    onClick={() => handleArrayRemove("education", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEducation}
                onChange={(e) => setNewEducation(e.target.value)}
                placeholder="Add education (e.g., Bachelor's in Computer Science)"
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleArrayAdd("education", newEducation);
                    setNewEducation("");
                  }
                }}
              />
              <button
                onClick={() => {
                  handleArrayAdd("education", newEducation);
                  setNewEducation("");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Certifications</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              {editForm.certifications?.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span>{cert}</span>
                  <button
                    onClick={() => handleArrayRemove("certifications", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add certification (e.g., AWS Certified Solutions Architect)"
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleArrayAdd("certifications", newCertification);
                    setNewCertification("");
                  }
                }}
              />
              <button
                onClick={() => {
                  handleArrayAdd("certifications", newCertification);
                  setNewCertification("");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      {/* Profile Header */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative">
            <img
              src={editForm.avatar || "/api/placeholder/128/128"}
              alt={`${editForm.firstName} ${editForm.lastName}`}
              className="w-32 h-32 rounded-full border-4 border-green-600 object-cover"
            />
            {isEditing && (
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleAvatarChange(file);
                    }
                  };
                  input.click();
                }}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
              >
                <Upload size={16} />
              </button>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                {/* User Type Specific Fields */}
                {isFreelancer(editForm) && renderFreelancerEditingFields()}
                {isClient(editForm) && renderClientEditingFields()}

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Location"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 disabled:opacity-50"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-green-600 font-semibold text-lg mt-1">
                  {isFreelancer(user)
                    ? user.displayName || `${user.firstName} ${user.lastName}`
                    : isClient(user)
                    ? user.companyName || `${user.firstName} ${user.lastName}`
                    : `${user.firstName} ${user.lastName}`}
                </p>

                {isFreelancer(user) && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <Star className="text-yellow-500 fill-yellow-500" size={18} />
                    <span>
                      {user.rating?.toFixed(1) || "0.0"} ({user.reviewsCount || 0}{" "}
                      reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600 dark:text-gray-400">
                  <MapPin size={16} /> {user.location}
                </div>
                
                {isClient(user) && user.companyName && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600 dark:text-gray-400">
                    <span>Company: {user.companyName}</span>
                  </div>
                )}

                {canEdit && (
                  <div className="flex justify-center md:justify-start">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center border-t dark:border-gray-800">
        {isFreelancer(user) ? (
          <>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {user.completedOrders || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                completed
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {user.pendingOrders || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                pending
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {user.ordersCount || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                total orders
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                ৳ {(user.earnings || 0).toLocaleString()}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                earnings
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {user.responseTime || "N/A"}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                response time
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {getYear(user.createdAt)}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                member since
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                ৳ {(user.spent || 0).toLocaleString()}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                total spent
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {user.ordersCount || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                total orders
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {user.completedOrders || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                completed
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {user.pendingOrders || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                pending
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {getYear(user.createdAt)}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                member since
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {user.reviewsCount || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                reviews given
              </p>
            </div>
          </>
        )}
      </section>

      {/* Skills - Only for Freelancers */}
      {isFreelancer(user) && (
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Skills</h3>
          {isEditing ? (
            renderFreelancerArraySections()
          ) : (
            <div className="flex flex-wrap gap-3">
              {user.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  {skill}
                </span>
              ))}
              {(!user.skills || user.skills.length === 0) && (
                <p className="text-gray-600 dark:text-gray-400">
                  No skills added yet.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Languages - Only for Freelancers */}
      {isFreelancer(user) && user.languages && user.languages.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Languages</h3>
          <div className="flex flex-wrap gap-3">
            {user.languages.map((language, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full border dark:border-gray-700 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm"
              >
                {language}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education - Only for Freelancers */}
      {isFreelancer(user) && user.education && user.education.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Education</h3>
          <div className="space-y-3">
            {user.education.map((edu, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {edu}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications - Only for Freelancers */}
      {isFreelancer(user) && user.certifications && user.certifications.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Certifications</h3>
          <div className="space-y-3">
            {user.certifications.map((cert, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {cert}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}