"use client";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
    const { user } = useAuth();
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-[var(--primary1)]">Admin Dashboard</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-700 dark:text-gray-300">Welcome back, {user?.name || 'Admin'}!</p>
                {/* Add more dashboard stats/content here */}
            </div>
        </div>
    );
}