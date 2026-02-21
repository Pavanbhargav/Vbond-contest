"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { databases, DB_ID, COL_USERS } from "../../appwrite/appwrite";
import {
  IoEye,
  IoEyeOff,
  IoLockClosedOutline,
  IoMailOutline,
} from "react-icons/io5";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.labels?.includes("admin")) {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);

      if (!user) throw new Error("Login failed. No user returned.");
      try {
        await databases.getDocument(DB_ID, COL_USERS, user.$id);
      } catch {
        // simplified catch
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
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      onSubmit={handleSubmit}
      className="w-full space-y-5"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 bg-red-50/50 border border-red-200 text-red-600 text-sm rounded-xl backdrop-blur-sm dark:bg-red-900/20 dark:border-red-900/20 "
        >
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </motion.div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block ml-1">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoMailOutline
              size={20}
              className="text-zinc-400 group-focus-within:text-primary1 transition-colors"
            />
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
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoLockClosedOutline
              size={20}
              className="text-zinc-400 group-focus-within:text-primary1 transition-colors"
            />
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

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-primary1/20 transition-all duration-300 transform ${
          loading ? "bg-zinc-400 cursor-not-allowed" : "bg-primary1"
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
      </motion.button>
    </motion.form>
  );
}
