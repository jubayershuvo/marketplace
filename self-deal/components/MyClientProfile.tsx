"use client";
import { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  Save,
  X,
  User,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Building,
  Upload,
} from "lucide-react";

export default function MyClientProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(
    "https://i.pravatar.cc/150?img=11"
  );
  const [profile, setProfile] = useState({
    name: "Md Jubayer",
    email: "mdjubayerislamshuvo34@gmail.com",
    phone: "+880 1700 000000",
    location: "Dhaka, Bangladesh",
    address: "House 10, Road 5, Dhanmondi",
    memberSince: "Jan 2023",
    website: "https://yourwebsite.com",
    company: "Jubayer Tech Ltd.",
    bio: "I am a client looking for talented freelancers to work on exciting projects.",
  });

  // handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // avatar upload
  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saved profile:", { ...profile, avatar: avatarPreview });
    // 👉 API call to MongoDB here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-6 mb-10"
        >
          <div className="relative">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-700 object-cover"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            )}
          </div>
          <div>
            {!isEditing ? (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h2>
            ) : (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-xl font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            )}
            <p className="text-gray-600 dark:text-gray-400">
              Member since {profile.memberSince}
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Contact Information
            </h3>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <span>{profile.email}</span>
                )}
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-500" />
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <span>{profile.phone}</span>
                )}
              </div>

              {/* Website */}
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-500" />
                {isEditing ? (
                  <input
                    type="text"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <a
                    href={profile.website}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {profile.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Address
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <span>{profile.location}</span>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {profile.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Company / Business Info
          </h3>
          <div className="flex items-center gap-2">
            <Building size={16} className="text-gray-500" />
            {isEditing ? (
              <input
                type="text"
                name="company"
                value={profile.company}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            ) : (
              <span>{profile.company}</span>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            About Me
          </h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
