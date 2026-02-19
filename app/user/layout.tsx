"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { IoWallet, IoMenu, IoBriefcase, IoPerson, IoPieChart } from "react-icons/io5";
import { useState, useEffect } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else if (isAdmin) {
        router.replace("/admin/dashboard");
      }
    }
  }, [user, isAdmin, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary1 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading User Panel...</p>
        </div>
      </div>
    );
  }

  const userLinks = [
    { label: "Dashboard", href: "/user/dashboard", icon: IoPieChart },
    { label: "Tasks", href: "/user/tasks", icon: IoBriefcase },
    { label: "Wallet", href: "/user/wallet", icon: IoWallet },
    { label: "Profile", href: "/user/profile", icon: IoPerson },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar 
        links={userLinks} 
        logout={handleLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 z-30 shadow-sm">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
        >
          <IoMenu size={24} />
        </button>
        <span className="ml-3 font-bold text-lg text-[var(--foreground)]">User Panel</span>
      </div>

      <main className="flex-1 lg:ml-20 transition-all duration-300 ease-in-out p-4 pt-20 lg:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
