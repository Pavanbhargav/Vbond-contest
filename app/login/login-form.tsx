"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { useAuth } from "../context/AuthContext"; 
import { databases, DB_ID, COL_USERS } from "../appwrite/appwrite"; 


export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(""); 

  const { login } = useAuth();
  const router = useRouter();
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);

      if (!user) throw new Error("Login failed. No user returned.");
      try {
        await databases.getDocument(DB_ID, COL_USERS, user.$id);
      } catch (docError) {
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
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-white rounded shadow-md w-full"
    >
      <h2 className="text-2xl mb-4 font-bold text-gray-800">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full text-white p-2 rounded transition font-bold ${
          loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="mt-4 text-center text-sm">
        Need an account?{" "}
        <Link href="/signup" className="text-blue-500 hover:text-blue-700 font-medium">
          Sign Up
        </Link>
      </div>
    </form>
  );
}