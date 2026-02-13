"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { IoGrid, IoDocumentText, IoSwapHorizontal } from "react-icons/io5";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const adminLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: IoGrid },
    { label: "Review", href: "/admin/review", icon: IoDocumentText },
    { label: "Transactions", href: "/admin/transactions", icon: IoSwapHorizontal },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar links={adminLinks} logout={handleLogout} />
      <main className="flex-1 ml-20 transition-all duration-300 ease-in-out p-8">
        {children}
      </main>
    </div>
  );
}
