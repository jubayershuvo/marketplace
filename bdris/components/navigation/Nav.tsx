"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  User,
  Settings,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeMod";
import LogoutButton from "../Logout";

const menuItems = [
  { label: "Home", icon: <Home size={20} />, href: "/" },
  { label: "Profile", icon: <User size={20} />, href: "/profile" },
  { label: "Settings", icon: <Settings size={20} />, href: "/settings" },
];

export default function Nav({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let prevWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;

      if (currentWidth > prevWidth) {
        setCollapsed(false);
      } else if (currentWidth < prevWidth) {
        setCollapsed(true);
      }

      prevWidth = currentWidth; // update previous width
    };

    window.addEventListener("resize", handleResize);

    // run once to initialize
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

  if (pathname === "/login" || pathname === "/404") {
    return <>{children}</>;
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* HEADER */}
      <header
        className="w-full h-16 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 
        flex items-center justify-between px-4 shadow-md"
      >
        <div className="flex items-center">
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white md:hidden mr-3"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-2 rounded-md hover:bg-indigo-400/30 
              dark:hover:bg-teal-700/40 transition-colors duration-300 mr-3 text-white"
          >
            {collapsed ? (
              <ArrowRightToLine size={20} />
            ) : (
              <ArrowLeftToLine size={20} />
            )}
          </button>

          <h1 className="text-lg font-semibold text-white">My App</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (desktop) */}
        <aside
          className={`hidden md:flex flex-col transition-all duration-300 ease-in-out 
            bg-gradient-to-b from-slate-100 to-slate-50 
            dark:from-slate-900 dark:to-slate-800
            text-gray-900 dark:text-gray-100 shadow-lg
            ${collapsed ? "w-20" : "w-64"}`}
        >
          {menuItems.map((item) => (
            <Link
              key={item?.href}
              href={item?.href}
              className={`flex  ${
                collapsed ? "justify-center" : "justify-start"
              } ${
                pathname === item?.href
                  ? "bg-blue-200/70 dark:bg-blue-700/50"
                  : ""
              } p-4 mx-2 my-1 rounded-lg 
                hover:bg-indigo-200/70 dark:hover:bg-teal-700/50 group relative transition-all duration-300 ease-in-out`}
            >
              <span className="group-hover:block">{item?.icon}</span>
              <span
                className={`ml-3 font-medium transition-all duration-300 ${
                  collapsed ? "opacity-0 absolute left-14" : "opacity-100"
                }`}
              >
                {item?.label}
              </span>
            </Link>
          ))}
          <div className="mt-auto mb-4">
            <Link
              href="/profile"
              className={`flex  ${
                collapsed ? "justify-center" : "justify-start"
              }  p-4 mx-2 my-1 rounded-lg group relative transition-all duration-300 ease-in-out`}
            >
              <User size={20} />
              <span
                className={`ml-3 font-medium transition-all duration-300 ${
                  collapsed
                    ? "opacity-0 absolute left-14"
                    : "opacity-100"
                }`}
              >
                Profile
              </span>
              
            </Link>
          </div>
        </aside>

        {/* SIDEBAR (mobile) */}
        <div
          className={`md:hidden fixed top-16 left-0 h-[calc(100%-4rem)] w-64 
              bg-gradient-to-b from-slate-100 to-slate-50 
              dark:from-slate-900 dark:to-slate-800
              text-gray-900 dark:text-gray-100 shadow-lg z-40 transform transition-transform duration-300 
              ${
                mobileOpen ? "translate-x-0" : "-translate-x-64"
              } flex flex-col`}
        >
          <div className="flex-1">
            {menuItems.map((item) => (
              <Link
                key={item?.href}
                href={item?.href}
                onClick={() => setMobileOpen(false)}
                className={`
                flex items-center p-4 mb-2 rounded-lg transition-all
                ${
                  pathname === item?.href
                    ? "bg-indigo-300/80 dark:bg-blue-700/60 font-semibold"
                    : "hover:bg-indigo-200/70 dark:hover:bg-teal-700/50"
                }
      `}
              >
                {item?.icon}
                <span className="ml-3 font-medium">{item?.label}</span>
              </Link>
            ))}
          </div>

          <div className="mb-4">
            <Link
              href="/profile"
              className="flex items-center p-4 rounded-lg 
               hover:bg-indigo-200/70 dark:hover:bg-teal-700/50 transition-all"
            >
              <User size={20} />
              <span className="ml-3 font-medium">Profile</span>
            </Link>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main
          className="flex-1 overflow-auto p-4 
            text-gray-900 dark:text-gray-100 
            bg-gradient-to-b from-white to-slate-50 
            dark:from-slate-950 dark:to-slate-900"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
