"use client";
import Link from "next/link";
import { IoMailOpenOutline } from "react-icons/io5";
import { useSearchParams } from "next/navigation";
import { account } from "../../appwrite/appwrite";
import { useState } from "react";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  const handleResend = async () => {
    setResending(true);
    setResendStatus("");
    try {
      const redirect_url = `${window.location.origin}/verify`;
      await account.createVerification(redirect_url);
      setResendStatus("Verification email resent!");
    } catch (error: any) {
      console.error(error);
      setResendStatus("Failed to resend email. Please try logging in again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary1/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary2/10 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl p-8 text-center transform transition-all hover:scale-[1.01]">
          <div className="mx-auto w-20 h-20 bg-primary1/10 rounded-full flex items-center justify-center mb-6">
            <IoMailOpenOutline className="text-primary1 w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Check your email</h2>
          
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            We've sent a verification link to {email ? <span className="font-semibold text-zinc-900 dark:text-white">{email}</span> : "your email address"}. <br/>
            Please click the link to activate your account.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="block w-full py-3.5 px-4 rounded-xl text-white font-bold text-lg bg-primary1 hover:bg-primary2 shadow-lg shadow-primary1/20 transition-all duration-300"
            >
              Back to Login
            </Link>
            
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              <p>
                Didn't receive the email?{" "}
                <button 
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary1 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? "Resending..." : "Click to resend"}
                </button>
              </p>
              {resendStatus && (
                <p className={`mt-2 ${resendStatus.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
                  {resendStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
