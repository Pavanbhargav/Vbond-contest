"use client";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { IoWallet, IoCloudUpload, IoTime, IoCheckmarkCircle } from "react-icons/io5";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [upi, setUpi] = useState("user@upi");
  const [isSaving, setIsSaving] = useState(false);
  
  // Static Mock Data
  const stats = {
    balance: 1250.00,
    totalSubmissions: 12,
    pendingSubmissions: 2,
    approvedSubmissions: 8
  };

  const updateUpi = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSaving(true);
    // Mock save
    setTimeout(() => {
        setIsSaving(false);
        alert("UPI ID Updated Successfully (Mock)!");
    }, 1000);
  };

  if (loading) return <div className="p-8"><div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"></div></div>;

  const statCards = [
    { label: "Wallet Balance", value: `$${stats.balance}`, icon: IoWallet, color: "bg-green-500" },
    { label: "Total Submissions", value: stats.totalSubmissions, icon: IoCloudUpload, color: "bg-blue-500" },
    { label: "Pending", value: stats.pendingSubmissions, icon: IoTime, color: "bg-orange-500" },
    { label: "Approved", value: stats.approvedSubmissions, icon: IoCheckmarkCircle, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">User Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Track your submissions and earnings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
             <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-2 text-[var(--foreground)]">{stat.value}</h3>
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
         <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">Payment Settings</h2>
            
            {!upi && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r dark:bg-orange-900/10">
                <div className="flex items-center gap-3">
                    <IoWallet className="text-orange-500" size={24}/>
                    <p className="text-orange-700 dark:text-orange-400 font-medium">
                    Link your UPI ID to receive payments.
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
                      className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)]"
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

         {/* Quick Links or Promo */}
         <div className="bg-gradient-to-br from-[var(--primary1)] to-[var(--primary2)] p-6 rounded-xl text-white flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold mb-2">Start Earning!</h3>
                <p className="text-white/80 text-sm">Submit your best work and win exciting prizes in our ongoing contests.</p>
            </div>
            <button 
                onClick={() => window.location.href='/user/submissions'}
                className="mt-6 bg-white text-[var(--primary2)] px-4 py-3 rounded-lg font-bold hover:bg-zinc-100 transition text-center"
            >
                View Contests
            </button>
         </div>
      </div>
    </div>
  );
}
