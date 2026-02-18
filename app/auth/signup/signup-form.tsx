"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { databases, DB_ID, COL_USERS, account } from "../../appwrite/appwrite";
import { ID } from "appwrite";
import { IoEye, IoEyeOff, IoLockClosedOutline, IoMailOutline, IoPersonOutline, IoPhonePortraitOutline } from "react-icons/io5";
import { motion } from "framer-motion";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [error, setError] = useState<string>("");
   const [showPassword,setShowPassword] = useState(false);
  const [showConfirmPassword,setShowConfirmPassword] = useState(false);
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
      const redirect_url = `${window.location.origin}/verify`;
      await account.createVerification(redirect_url);
      router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      if (error.code === 409 || error.type === "user_already_exists") {
        setError(
          "This email or phone number is already registered. Please login.",
        );
      } else {
        setError(error.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      onSubmit={handleSubmit} 
      className="w-full space-y-4"
    >
      {error && (
         <motion.div 
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: "auto" }}
           className="p-4 bg-red-50/50 border border-red-200 text-red-600 text-sm rounded-xl backdrop-blur-sm"
         >
           <p className="font-semibold">Error</p>
           <p>{error}</p>
         </motion.div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block ml-1">
          Full Name
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoPersonOutline size={20} className="text-zinc-400 group-focus-within:text-primary1 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary1/50 focus:border-primary1 transition-all duration-200 dark:text-white placeholder-zinc-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block ml-1">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoMailOutline size={20} className="text-zinc-400 group-focus-within:text-primary1 transition-colors" />
          </div>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary1/50 focus:border-primary1 transition-all duration-200 dark:text-white placeholder-zinc-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block ml-1">
          Mobile Number
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoPhonePortraitOutline size={20} className="text-zinc-400 group-focus-within:text-primary1 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="+1 (555) 000-0000"
            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary1/50 focus:border-primary1 transition-all duration-200 dark:text-white placeholder-zinc-400"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block ml-1">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IoLockClosedOutline size={20} className="text-zinc-400 group-focus-within:text-primary1 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary1/50 focus:border-primary1 transition-all duration-200 dark:text-white placeholder-zinc-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-primary1 transition-colors focus:outline-none"
            >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block ml-1">
            Confirm
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IoLockClosedOutline size={20} className="text-zinc-400 group-focus-within:text-primary1 transition-colors" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary1/50 focus:border-primary1 transition-all duration-200 dark:text-white placeholder-zinc-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-primary1 transition-colors focus:outline-none"
            >
                {showConfirmPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className={`w-full py-2 px-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-primary1/20 transition-all duration-300 transform ${
          loading
            ? "bg-zinc-400 cursor-not-allowed"
            : "bg-primary1"
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
      </motion.button>
    </motion.form>
  );
}
