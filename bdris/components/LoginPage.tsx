"use client";
import axios from "axios";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

function LoginPage() {
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    e.preventDefault();
    try {
      const res = await axios.post(`${serverUrl}/bdris/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="bg-gradient-to-br from-pink-200 via-white to-pink-300 min-h-screen flex items-center justify-center p-4">
      {/* Spinning Gradient Outline */}
      <div className="relative w-full max-w-md">
        {/* Outline Layer */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-spin-slow"></div>

        {/* Form Card */}
        <div className="relative bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Login
          </h2>
          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Email
              </label>
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                id="email"
                className="w-full px-4 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="w-full text-gray-700 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              onClick={handleLogin}
              className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold shadow-md hover:scale-105 transition-transform duration-300"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-300">
            Don’t have an account?{" "}
            <Link
              href="#"
              className="text-pink-500 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Custom Animation */}
      <style jsx>{`
        .animate-spin-slow {
          background-size: 300% 300%;
          animation: spinGradient 6s linear infinite;
        }
        @keyframes spinGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
