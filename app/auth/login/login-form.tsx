"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { databases, DB_ID, COL_USERS } from "../../appwrite/appwrite";
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { login } = useAuth();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);

      if (!user) throw new Error("Login failed. No user returned.");
      try {
        await databases.getDocument(DB_ID, COL_USERS, user.$id);
      } catch { // simplified catch
        console.log("User document missing. Recreating...");
        await databases.createDocument(DB_ID, COL_USERS, user.$id, {
          userId: user.$id,
          email: email,
          balance: 0,
        });
      }
      if (user.labels?.includes("admin")) {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md animate-pulse">
           <p className="font-bold">Error</p>
           <p>{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">Email Address</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67817] focus:border-transparent transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700 block">Password</label>
            {/* <Link href="/auth/forgot-password" className="text-sm text-[#01458E] hover:underline font-medium">
                Forgot password?
            </Link> */}
        </div>
        <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
             className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67817] focus:border-transparent transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition duration-300 transform  ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#E67817] to-[#d6680a] hover:from-[#0a18d6] hover:to-[#6e75fc]"
        }`}
      >
        {loading ? (
             <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Signing in...
             </div>
        ) : (
             "Sign In"
        )}
      </button>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
           Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-[#01458E] font-bold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
