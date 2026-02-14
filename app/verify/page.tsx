"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { account } from "../appwrite/appwrite";
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoHourglassOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState("Verifying your email...");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const secret = searchParams.get("secret");
    const userId = searchParams.get("userId");

    if (secret && userId) {
      verifyEmail(userId, secret);
    } else {
      setStatus("Invalid verification link.");
      setIsError(true);
    }
  }, []);

  const verifyEmail = async (userId: string, secret: string) => {
    try {
      await account.updateVerification(userId, secret);
      setStatus("Email verified successfully!");
      setIsSuccess(true);
      
      // Check if user has an active session
      try {
        await account.get();
        // If session exists, redirect to dashboard
        setTimeout(() => {
          router.push("/user"); 
        }, 2000);
      } catch (sessionError) {
        // If no session, redirect to login
        setStatus("Email verified! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login?verified=true");
        }, 2000);
      }
      
    } catch (error: any) {
      console.error(error);
      setStatus("Verification failed: " + error.message);
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary1/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary2/10 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl p-8 text-center">
          
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce-slow ${
            isSuccess ? "bg-green-100 text-green-600" : isError ? "bg-red-100 text-red-600" : "bg-primary1/10 text-primary1"
          }`}>
             {isSuccess ? (
                <IoCheckmarkCircleOutline size={40} />
             ) : isError ? (
                <IoCloseCircleOutline size={40} />
             ) : (
                <IoHourglassOutline size={40} className="animate-spin-slow" />
             )}
          </div>

          <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Email Verification</h1>

          <p className={`text-lg mb-6 ${isSuccess ? "text-green-600 font-medium" : isError ? "text-red-500 font-medium" : "text-zinc-600 dark:text-zinc-300"}`}>
            {status}
          </p>

          {isSuccess && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
                  Redirecting to dashboard...
              </div>
          )}
          
          {isError && (
               <Link 
                  href="/auth/login"
                  className="inline-block bg-primary1 hover:bg-primary2 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary1/20"
               >
                  Go to Login
               </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
