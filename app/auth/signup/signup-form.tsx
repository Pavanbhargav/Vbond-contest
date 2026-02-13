"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { databases, DB_ID, COL_USERS, account } from "../../appwrite/appwrite";
import { ID } from "appwrite";
import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const userId = ID.unique();
      await account.create(userId, email, password, name);

      await login(email, password);
      await databases.createDocument(DB_ID, COL_USERS, userId, {
        userId: userId,
        email: email,
        phone: phone,
        name: name,
        balance: 0,
      });
      const redirect_url = "http://localhost:3000/verify";
      await account.createVerification(redirect_url);
      alert('Verification email sent! Check your inbox.');
    } catch (error: any) {
      if (error.code === 409 || error.type === "user_already_exists") {
        setError("This email or phone number is already registered. Please login.");
      } else {
        setError(error.message || "Signup failed");
      }
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
        {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md animate-pulse">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            </div>
        )}

        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Full Name</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                </div>
                <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67817] focus:border-transparent transition duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                />
            </div>
        </div>

        <div className="space-y-1">
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

        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Mobile Number</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                </div>
                <input
                type="text"
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67817] focus:border-transparent transition duration-200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Password</label>
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

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Confirm Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                    </div>
                    <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67817] focus:border-transparent transition duration-200"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    />
                </div>
            </div>
        </div>

      <button
        type="submit"
        className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition duration-300 transform ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#173ae6] to-[#0a14d6] hover:from-[#d6680a] hover:to-[#c55b00]"
          }`}
        disabled={loading}
      >
         {loading ? (
             <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Registering...
             </div>
        ) : (
             "Create Account"
        )}
      </button>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#01458E] font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </form>
  );
}
