"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Wallet,
  Plus,
} from "lucide-react";

export default function ClientDashboard() {
  const [stats] = useState([
    { label: "Active Orders", value: 3, icon: ShoppingBag, color: "text-blue-600" },
    { label: "Completed Orders", value: 12, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending Orders", value: 2, icon: Clock, color: "text-yellow-600" },
    { label: "Canceled Orders", value: 1, icon: XCircle, color: "text-red-600" },
  ]);

  const [jobs] = useState([
    { id: 1, title: "MERN Developer for E-commerce", budget: 20000, proposals: 8, status: "Open" },
    { id: 2, title: "UI/UX Designer for App", budget: 12000, proposals: 15, status: "In Progress" },
    { id: 3, title: "WordPress Setup", budget: 8000, proposals: 5, status: "Completed" },
  ]);

  const [activities] = useState([
    { id: 1, text: "You posted a new job: MERN Developer", time: "2h ago" },
    { id: 2, text: "You received 3 new proposals", time: "4h ago" },
    { id: 3, text: "Order #112 marked as Completed", time: "1d ago" },
  ]);

  const [freelancers] = useState([
    { id: 1, name: "Rakib Hasan", skill: "Full Stack Developer", rate: 1200, rating: 4.9 },
    { id: 2, name: "Sara Akter", skill: "UI/UX Designer", rate: 1000, rating: 4.7 },
    { id: 3, name: "Mahmudul Islam", skill: "WordPress Expert", rate: 800, rating: 4.8 },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* LEFT SIDE - Profile & Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow"
          >
            <div className="flex items-center gap-4">
              <User className="w-12 h-12 text-gray-400" />
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Md Jubayer
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Client • Dhaka, Bangladesh
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Wallet className="w-5 h-5" />
                <span className="font-bold">৳15,500</span>
              </div>
              <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Add Funds
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow flex items-center gap-4"
              >
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {s.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MIDDLE - Job Posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                My Job Posts
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="w-4 h-4" /> Post New Job
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="py-2 px-4">Title</th>
                    <th className="py-2 px-4">Budget (৳)</th>
                    <th className="py-2 px-4">Proposals</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700"
                    >
                      <td className="py-2 px-4">{job.title}</td>
                      <td className="py-2 px-4">৳{job.budget.toLocaleString("en-BD")}</td>
                      <td className="py-2 px-4">{job.proposals}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.status === "Open"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100"
                              : job.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100"
                              : "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <ul className="space-y-3">
              {activities.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between text-sm text-gray-600 dark:text-gray-300"
                >
                  <span>{a.text}</span>
                  <span className="text-gray-400">{a.time}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Recommended Freelancers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Recommended Freelancers
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {freelancers.map((f) => (
                <div
                  key={f.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {f.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{f.skill}</p>
                  <p className="text-sm mt-1">
                    <span className="font-bold">৳{f.rate}/hr</span> • ⭐ {f.rating}
                  </p>
                  <button className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    Invite to Job
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
