"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  User,
  Settings,
  ArrowLeftToLine,
  ArrowRightToLine,
  Package,
  Users,
  BarChart3,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeMod";

const menuItems = [
  { label: "Dashboard", icon: <BarChart3 size={20} />, href: "/dashboard" },
  { label: "Users", icon: <Users size={20} />, href: "/users" },
  { label: "Categories", icon: <Package size={20} />, href: "/categories" },
  { label: "Withdrawals", icon: <Wallet size={20} />, href: "/withdrawals" },
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

      prevWidth = currentWidth;
    };

    window.addEventListener("resize", handleResize);
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
        className="w-full h-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
        flex items-center justify-between px-4 border-b border-purple-500/30 backdrop-blur-lg"
      >
        <div className="flex items-center">
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white md:hidden mr-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-2 rounded-lg hover:bg-white/10 transition-colors duration-300 mr-3 text-white"
          >
            {collapsed ? (
              <ArrowRightToLine size={20} />
            ) : (
              <ArrowLeftToLine size={20} />
            )}
          </button>

          <h1 className="text-xl font-bold text-white bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Admin Panel
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (desktop) */}
        <aside
          className={`hidden md:flex flex-col transition-all duration-300 ease-in-out 
            bg-white/10 backdrop-blur-lg border-r border-purple-500/30
            text-gray-100 shadow-lg
            ${collapsed ? "w-20" : "w-64"}`}
        >
          <div className="flex-1 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${
                  collapsed ? "justify-center px-2" : "justify-start px-4"
                } ${
                  pathname === item.href
                    ? "bg-purple-500/20 border-r-2 border-purple-400"
                    : "hover:bg-white/5"
                } py-3 mx-2 my-1 rounded-lg transition-all duration-300 ease-in-out group relative`}
              >
                <span className={`${pathname === item.href ? "text-purple-300" : "text-purple-200"}`}>
                  {item.icon}
                </span>
                <span
                  className={`ml-3 font-medium transition-all duration-300 ${
                    collapsed ? "opacity-0 absolute left-14" : "opacity-100"
                  } ${pathname === item.href ? "text-white" : "text-purple-200"}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          
          {/* Profile Section */}
          <div className="mt-auto mb-4 border-t border-purple-500/30 pt-4">
            <Link
              href="/profile"
              className={`flex items-center ${
                collapsed ? "justify-center px-2" : "justify-start px-4"
              } py-3 mx-2 rounded-lg hover:bg-white/5 transition-all duration-300 group relative`}
            >
              <User size={20} className="text-purple-200" />
              <span
                className={`ml-3 font-medium transition-all duration-300 ${
                  collapsed ? "opacity-0 absolute left-14" : "opacity-100"
                } text-purple-200`}
              >
                Profile
              </span>
            </Link>
          </div>
        </aside>

        {/* SIDEBAR (mobile) */}
        <div
          className={`md:hidden fixed top-16 left-0 h-[calc(100%-4rem)] w-64 
            bg-white/10 backdrop-blur-lg border-r border-purple-500/30
            text-gray-100 shadow-lg z-40 transform transition-transform duration-300 
            ${
              mobileOpen ? "translate-x-0" : "-translate-x-64"
            } flex flex-col`}
        >
          <div className="flex-1 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3 mx-2 my-1 rounded-lg transition-all ${
                  pathname === item.href
                    ? "bg-purple-500/20 border-r-2 border-purple-400"
                    : "hover:bg-white/5"
                }`}
              >
                <span className={`${pathname === item.href ? "text-purple-300" : "text-purple-200"}`}>
                  {item.icon}
                </span>
                <span className={`ml-3 font-medium ${pathname === item.href ? "text-white" : "text-purple-200"}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="mb-4 border-t border-purple-500/30 pt-4">
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-white/5 transition-all"
            >
              <User size={20} className="text-purple-200" />
              <span className="ml-3 font-medium text-purple-200">Profile</span>
            </Link>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main
          className="flex-1 overflow-auto p-6 
            text-gray-900 dark:text-gray-100 
            bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        >
          {children}
        </main>
      </div>
    </div>
  );
}