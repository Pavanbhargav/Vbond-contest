"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed
import {
  databases,
  DB_ID,
  COL_USERS,
  COL_SUBMISSIONS,
} from "../../appwrite/appwrite";
import { Query } from "appwrite";
import { IoWallet, IoCloudUpload, IoTime, IoCheckmarkCircle } from "react-icons/io5";

interface Submission {
    $id: string;
    taskId: string;
    status: string;
    submittedAt: string;
    // We might not get full task details easily without mapping, 
    // but we can try to fetch them or just show status/date for "Right Now"
    // For a better "Recent Activity" we probably want Task Title.
    // Let's stick to basic info or fetch tasks if needed. 
    // For simplicity in this iteration: Status and Date. 
}

export default function UserDashboardClient() {
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    balance: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0
  });
  
  const [upi, setUpi] = useState(""); 
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (!user?.$id) return;

      // 1. Fetch User Doc (Balance & UPI)
      // Note: user.$id is the Auth ID. We assume a User Doc exists with same ID or we query by userId.
      // Based on previous code `databases.getDocument(DB_ID, COL_USERS, user.$id)` seems to be the pattern.
      // But let's be safe and use listDocuments if getDocument fails or just use getDocument if that's the established pattern.
      // Admin `TasksClient` used listDocuments by userId. Let's try getDocument first as it's cleaner if IDs match.
      // Actually, standard Appwrite pattern is often Document ID != User ID unless explicitly set.
      // Let's use listDocuments to be safe as per `TasksClient` logic `Query.equal("userId", sub.userId)`.
      
      const [userDocsRes, totalSubRes, pendingSubRes, approvedSubRes] = await Promise.all([
        databases.listDocuments(DB_ID, COL_USERS, [
            Query.equal("userId", user.$id),
            Query.limit(1)
        ]),
        databases.listDocuments(DB_ID, COL_SUBMISSIONS, [
             Query.equal("userId", user.$id),
             Query.limit(1) // Get total
        ]),
        databases.listDocuments(DB_ID, COL_SUBMISSIONS, [
             Query.equal("userId", user.$id),
             Query.equal("status", "pending"),
             Query.limit(1)
        ]),
        databases.listDocuments(DB_ID, COL_SUBMISSIONS, [
             Query.equal("userId", user.$id),
             Query.equal("status", "approved"),
             Query.limit(1)
        ]),
      ]);

      // Set Stats
      const userDoc = userDocsRes.documents[0];
      setStats({
          balance: userDoc ? userDoc.balance : 0,
          totalSubmissions: totalSubRes.total,
          pendingSubmissions: pendingSubRes.total,
          approvedSubmissions: approvedSubRes.total,
      });

      if (userDoc) {
          setUpi(userDoc.upi_id || "");
      }

    } catch (error) {
      console.error("Error fetching user dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUpi = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    if (!user) return alert("User not logged in!");
    
    setIsSaving(true);
    try {
      // We need to find the document ID first.
      const userDocs = await databases.listDocuments(DB_ID, COL_USERS, [
        Query.equal("userId", user.$id),
        Query.limit(1)
      ]);
      
      if (userDocs.total === 0) {
          throw new Error("User profile not found. Please contact support.");
      }

      await databases.updateDocument(
        DB_ID, 
        COL_USERS, 
        userDocs.documents[0].$id, 
        {
          upi_id: upi 
        }
      );
      alert("UPI ID Updated Successfully!");
    } catch (error: any) {
      console.error("Save Error:", error);
      alert("Failed to update: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || (loading && !stats.balance && !stats.totalSubmissions)) {
      return (
        <div className="p-8 space-y-4">
            <div className="h-8 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"></div>)}
            </div>
        </div>
      );
  }

  const statCards = [
    { label: "Wallet Balance", value: `₹${stats.balance}`, icon: IoWallet, color: "bg-green-500" },
    { label: "Total Submissions", value: stats.totalSubmissions, icon: IoCloudUpload, color: "bg-blue-500" },
    { label: "Pending Reviews", value: stats.pendingSubmissions, icon: IoTime, color: "bg-orange-500" },
    { label: "Approved Wins", value: stats.approvedSubmissions, icon: IoCheckmarkCircle, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">User Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Track your submissions and earnings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
             <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-2 text-zinc-900 dark:text-white">{stat.value}</h3>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white shadow-lg shadow-black/10`}>
                  <stat.icon size={20} />
                </div>
              </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Profile/UPI Settings */}
         <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Payment Settings</h2>
            
            {!upi && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r dark:bg-orange-900/10">
                <div className="flex items-center gap-3">
                    <IoWallet className="text-orange-500" size={24}/>
                    <p className="text-orange-700 dark:text-orange-400 font-medium">
                    Link your UPI ID to receive payments for approved tasks.
                    </p>
                </div>
              </div>
            )}

            <div className="max-w-md">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  UPI ID
                </label>
                <div className="flex gap-3">
                    <input
                      type="text"
                      value={upi}
                      placeholder="example@upi"
                      className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] text-zinc-900 dark:text-white"
                      onChange={(e) => setUpi(e.target.value)}
                    />
                    <button
                        onClick={updateUpi}
                        disabled={isSaving}
                        className="bg-[var(--primary1)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary1)]/90 transition-colors disabled:opacity-50 font-medium whitespace-nowrap"
                    >
                        {isSaving ? "Saving..." : "Save UPI"}
                    </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Used for all payouts via direct transfer.</p>
            </div>
         </div>

         {/* Quick Links */}
         <div className="bg-gradient-to-br from-[var(--primary1)] to-[var(--primary2)] p-6 rounded-xl text-white flex flex-col justify-between shadow-lg">
            <div>
                <h3 className="text-xl font-bold mb-2">Start Earning!</h3>
                <p className="text-white/90 text-sm">Submit your best work and win exciting prizes in our ongoing contests.</p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
                 <button 
                    onClick={() => window.location.href='/user/tasks'}
                    className="w-full bg-white text-[var(--primary2)] px-4 py-3 rounded-lg font-bold hover:bg-zinc-50 transition text-center"
                >
                    Browse Tasks
                </button>
                <button 
                    onClick={() => window.location.href='/user/submissions'}
                    className="w-full bg-black/20 text-white px-4 py-3 rounded-lg font-bold hover:bg-black/30 transition text-center border border-white/20"
                >
                    My Submissions
                </button>
            </div>
         </div>
      </div>
    </div>
  );
}
