"use client";
import { useAuth } from "../../context/AuthContext";
import { IoPeople, IoDocumentText, IoTime, IoCheckmarkCircle } from "react-icons/io5";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Static Data
  const stats = {
    users: 1250,
    submissions: 340,
    pending: 15,
    tasks: 8
  };

  const statCards = [
    { label: "Total Users", value: stats.users, icon: IoPeople, color: "bg-blue-500" },
    { label: "Total Submissions", value: stats.submissions, icon: IoDocumentText, color: "bg-purple-500" },
    { label: "Pending Reviews", value: stats.pending, icon: IoTime, color: "bg-orange-500" },
    { label: "Active Tasks", value: stats.tasks, icon: IoCheckmarkCircle, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
           <p className="text-zinc-500 dark:text-zinc-400">Welcome back, {user?.name || "Admin"}!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2 text-[var(--foreground)]">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white shadow-lg shadow-black/10`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
         <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Quick Actions</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <button onClick={() => window.location.href='/admin/review'} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition flex items-center gap-3 border border-zinc-200 dark:border-zinc-700">
                <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                    <IoTime size={20} />
                </div>
                <div className="text-left">
                    <span className="block font-medium text-[var(--foreground)]">Review Submissions</span>
                    <span className="text-xs text-zinc-500">Check pending work</span>
                </div>
             </button>
             {/* Add more actions as needed */}
         </div>
      </div>
    </div>
  );
}
