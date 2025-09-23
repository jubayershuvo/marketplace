"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear auth (example: localStorage / cookie / context)
    localStorage.removeItem("token"); // replace with your auth logic
    router.push("/login"); // redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 rounded-md hover:bg-red-950/50 transition-colors duration-300"
      title="Logout"
    >
      <LogOut size={24} className="text-red-600 dark:text-red-400" />
    </button>
  );
}
