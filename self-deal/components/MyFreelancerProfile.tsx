"use client";
import { useState } from "react";
import { Edit, Save, Upload, PlusCircle } from "lucide-react";

export default function MyFreelancerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<string>(
    "https://i.pravatar.cc/150?img=12"
  );
  const [profile, setProfile] = useState({
    name: "John Doe",
    title: "Full Stack MERN Developer",
    bio: "Passionate developer with 3+ years of experience building scalable web apps using React, Node.js, MongoDB, and Express.",
    hourlyRate: 25,
    location: "Dhaka, Bangladesh",
    email: "john@example.com",
    phone: "+880 1712345678",
    skills: ["React", "Node.js", "MongoDB", "Next.js"],
    services: ["Web Development", "API Integration", "UI/UX Design"],
    experience: [
      {
        company: "TechHub Ltd.",
        role: "Frontend Developer",
        years: "2020 - 2022",
      },
    ],
    portfolio: [
      { title: "E-commerce Website", link: "https://myecommerce.com" },
      { title: "Chat App", link: "https://chatapp.com" },
    ],
    socials: {
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <div className="mx-auto px-6 py-10 dark:bg-gray-900 transition-colors duration-300 dark:text-gray-100 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          My Freelancer Profile
        </h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 transition"
        >
          {isEditing ? <Save size={18} /> : <Edit size={18} />}
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      {/* Avatar + Basic Info */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 transition-colors">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-green-500 object-cover"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-green-600 text-white p-1 rounded-full cursor-pointer shadow">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="text-2xl font-bold border-b dark:bg-gray-700 dark:text-gray-100 px-2"
                />
                <input
                  type="text"
                  name="title"
                  value={profile.title}
                  onChange={handleChange}
                  className="block text-gray-600 dark:text-gray-300 border-b mt-1 dark:bg-gray-700 px-2"
                />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {profile.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{profile.title}</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          About Me
        </h3>
        {isEditing ? (
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            className="w-full border rounded p-2 dark:bg-gray-700 dark:text-gray-100"
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
        )}
      </section>

      {/* Skills */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
          {isEditing && (
            <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full flex items-center gap-1 text-sm hover:bg-gray-300 dark:hover:bg-gray-600">
              <PlusCircle size={14} /> Add
            </button>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Services
        </h3>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
          {profile.services.map((srv, i) => (
            <li key={i}>{srv}</li>
          ))}
        </ul>
      </section>

      {/* Experience */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Experience
        </h3>
        {profile.experience.map((exp, i) => (
          <div key={i} className="mb-3">
            <p className="font-bold text-gray-800 dark:text-gray-100">{exp.role}</p>
            <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{exp.years}</p>
          </div>
        ))}
      </section>

      {/* Portfolio */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Portfolio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.portfolio.map((p, i) => (
            <a
              key={i}
              href={p.link}
              target="_blank"
              className="block border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <p className="font-bold text-gray-800 dark:text-gray-100">{p.title}</p>
              <p className="text-sm text-green-600 dark:text-green-300">{p.link}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Contact + Socials */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Contact & Socials
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Email: </span>
          {profile.email}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Phone: </span>
          {profile.phone}
        </p>
        <div className="flex gap-4 mt-3">
          <a
            href={profile.socials.linkedin}
            target="_blank"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            LinkedIn
          </a>
          <a
            href={profile.socials.github}
            target="_blank"
            className="text-gray-800 dark:text-gray-200 hover:underline"
          >
            GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
