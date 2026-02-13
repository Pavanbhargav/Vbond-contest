"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { IoGrid, IoCloudUpload, IoWallet } from "react-icons/io5";

export default function UserLayout({
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

  const userLinks = [
    { label: "Dashboard", href: "/user/dashboard", icon: IoGrid },
    { label: "Submissions", href: "/user/submissions", icon: IoCloudUpload },
    { label: "Wallet", href: "/user/wallet", icon: IoWallet },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar links={userLinks} logout={handleLogout} />
      <main className="flex-1 ml-20 transition-all duration-300 ease-in-out p-8">
        {children}
      </main>
    </div>
  );
}
