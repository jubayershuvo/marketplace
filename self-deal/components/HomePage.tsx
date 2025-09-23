"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sun, Moon } from "lucide-react";

// JSON Data
const categories = [
  "Web Development",
  "Graphic Design",
  "Digital Marketing",
  "Video Editing",
  "Content Writing",
  "Mobile Apps",
  "SEO",
  "UI/UX Design",
];

const freelancers = [
  {
    id: 1,
    name: "John Doe",
    role: "Web Developer",
    img: "https://i.pravatar.cc/150?img=1",
    desc: "Experienced MERN Stack Developer with 5+ years of expertise. Specializing in React, Next.js, Node.js, and MongoDB.",
  },
  {
    id: 2,
    name: "Sarah Lee",
    role: "Graphic Designer",
    img: "https://i.pravatar.cc/150?img=2",
    desc: "Creative designer specializing in branding and UI assets.",
  },
  {
    id: 3,
    name: "Michael Brown",
    role: "SEO Specialist",
    img: "https://i.pravatar.cc/150?img=3",
    desc: "Helping businesses rank higher with proven SEO strategies.",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Jane Smith",
    role: "CEO, Startup Inc.",
    img: "https://i.pravatar.cc/100?img=5",
    text: "“Great experience, delivered high-quality work on time!”",
  },
  {
    id: 2,
    name: "David Wilson",
    role: "Founder, TechFlow",
    img: "https://i.pravatar.cc/100?img=6",
    text: "“Amazing freelancer! Exceeded expectations with every delivery.”",
  },
];

export default function HomePage() {
  return (
    <div>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Find the right <span className="text-green-600">talent</span> for
            your next project
          </motion.h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Connect with skilled freelancers across the globe.
          </p>
          <div className="mt-6 flex items-center max-w-xl mx-auto rounded-lg border dark:border-gray-700 overflow-hidden">
            <input
              type="text"
              placeholder="Try 'Web Developer'"
              className="flex-1 px-4 py-3 focus:outline-none dark:bg-gray-900"
            />
            <button className="px-5 py-3 bg-green-600 text-white flex items-center gap-2 hover:bg-green-700">
              <Search size={18} /> Search
            </button>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-bold mb-6">Popular Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border dark:border-gray-700 shadow hover:shadow-lg cursor-pointer text-center bg-white dark:bg-gray-800"
              >
                {cat}
              </div>
            ))}
          </div>
        </section>

        {/* Featured Freelancers */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-bold mb-6">Top Rated Freelancers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {freelancers.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border dark:border-gray-700 p-6 bg-white dark:bg-gray-800 shadow hover:shadow-lg flex flex-col"
              >
                {/* Freelancer Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={f.img}
                    alt={f.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold">{f.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {f.role}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-4 text-gray-600 dark:text-gray-400 mb-2">
                  {f.desc}
                </p>

                {/* Button aligned to bottom */}
                <button className="mt-auto w-full py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-bold mb-6 text-center">
              What Clients Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-700 shadow"
                >
                  <p className="text-gray-600 dark:text-gray-400">{t.text}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={t.img}
                      alt={t.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to get your project done?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join thousands of businesses hiring top talent today.
          </p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Get Started
          </button>
        </section>
      </div>
    </div>
  );
}
