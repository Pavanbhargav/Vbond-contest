"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation"; 

export default function AdminDashboard() {
    const { logout } = useAuth();
    const router = useRouter();
    const handleLogout = async () => {
    await logout();
   router.replace("/login")
  };
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <button
          onClick={handleLogout}
        className="bg-red-400 text-gray-200 px-4 py-2 rounded-3xl shadow hover:bg-red-600 hover:text-white transition"
      >
        Logout
      </button>
      <h1> This is admin Dashboard</h1>
    </div>
  );
};

