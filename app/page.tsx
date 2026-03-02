"use client";

import { useEffect } from "react"; // 1. Import useEffect
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";



export default function Home() {
  // 2. Get 'loading' state if your AuthContext provides it (it should!)
  const { user, isAdmin, loading } = useAuth(); 
  const router = useRouter();

  // 3. Move the Logic into useEffect
  useEffect(() => {
    // Only run this when loading is finished and we have a user
    if (!loading && user) {
      if (isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/user');
      }
    }
  }, [user, isAdmin, loading, router]);

  // 4. PREVENT FLASHING: 
  // If we are checking auth (loading) OR we found a user (redirecting),
  // show a spinner or nothing instead of the landing page.
  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        {/* Simple Spinner */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary1"></div>
      </div>
    );
  }

  // 5. Render Landing Page ONLY if no user is logged in
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}