"use client";

import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isAdmin, loading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    // Only run routing logic once AuthContext finishes checking the session
    if (!loading) {
      if (user) {
        // Logged in: route based on role
        if (isAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/user');
        }
      } else {
        // Not logged in: route to login page
        router.replace('/login');
      }
    }
  }, [user, isAdmin, loading, router]);

  // Since this page is now just a redirect handler, 
  // it only ever needs to show a loading spinner while it decides where to send the user.
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
      {/* Simple Spinner */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary1)]"></div>
    </div>
  );
}