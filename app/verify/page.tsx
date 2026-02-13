"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { account } from "../appwrite/appwrite"; 

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState("Verifying...");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const secret = searchParams.get("secret");
    const userId = searchParams.get("userId");

    if (secret && userId) {
      verifyEmail(userId, secret);
    } else {
      setStatus("Invalid verification link.");
    }
  }, []);

  const verifyEmail = async (userId: string, secret: string) => {
    try {
      await account.updateVerification(userId, secret);
      setStatus("Email verified successfully! Redirecting...");
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/user"); 
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setStatus("Verification failed: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

        <p className={`text-lg ${isSuccess ? "text-green-600" : "text-gray-700"}`}>
          {status}
        </p>

        {isSuccess && (
            <div className="mt-4 text-sm text-gray-500">
                You will be redirected shortly...
            </div>
        )}
        
        {!isSuccess && status.includes("failed") && (
             <button 
                onClick={() => router.push("/login")}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
             >
                Go to Login
             </button>
        )}
      </div>
    </div>
  );
}