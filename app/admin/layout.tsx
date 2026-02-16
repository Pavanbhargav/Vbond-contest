"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { IoGrid, IoDocumentText, IoSwapHorizontal, IoMenu, IoBriefcase } from "react-icons/io5";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const adminLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: IoGrid },
    {label:'Tasks' ,href:'/admin/tasks',icon:IoBriefcase},
    // { label: "Review", href: "/admin/review", icon: IoDocumentText },
    {
      label: "Transactions",
      href: "/admin/transactions",
      icon: IoSwapHorizontal,
    },
    
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar 
        links={adminLinks} 
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
        <span className="ml-3 font-bold text-lg text-[var(--foreground)]">Admin Panel</span>
      </div>

      <main className="flex-1 lg:ml-20 transition-all duration-300 ease-in-out p-4 pt-20 lg:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
