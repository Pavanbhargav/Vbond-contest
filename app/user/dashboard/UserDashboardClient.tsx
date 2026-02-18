"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed
import {
  databases,
  storage,
  DB_ID,
  COL_USERS,
  COL_SUBMISSIONS,
  COL_TASKS,
  BUCKET_ID,
  client,
} from "../../appwrite/appwrite";
import { Query } from "appwrite";
import { 
  IoWallet, 
  IoCloudUpload, 
  IoTime, 
  IoCheckmarkCircle,
  IoCloudDownloadOutline, 
  IoEyeOutline, 
  IoClose 
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

interface Submission {
  $id: string;
  taskId: string;
  fileId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  taskTitle?: string; // Enriched field
  taskType?: string; // Enriched field
}

export default function UserDashboardClient() {
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    balance: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0
  });
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null);

  useEffect(() => {
    let unsubscribeUsers: () => void;
    let unsubscribeSubmissions: () => void;

    if (user && !authLoading) {
      fetchUserData();

      // 1. Subscribe to User Profile Updates (Balance)
      // We need to fetch the user document ID first, but for now we can subscribe to the collection 
      // and filter by userId if we don't have the doc ID handy in user object. 
      // However, fetchUserData fetches the doc.
      // Optimization: We can just subscribe to the collection and filter events.
      
      const userChannel = `databases.${DB_ID}.collections.${COL_USERS}.documents`;
      unsubscribeUsers = client.subscribe(userChannel, (response) => {
         const payload = response.payload as any;
         if (payload.userId === user.$id) {
             setStats(prev => ({
                 ...prev,
                 balance: payload.balance
             }));
         }
      });

      // 2. Subscribe to Submission Updates
      const submissionChannel = `databases.${DB_ID}.collections.${COL_SUBMISSIONS}.documents`;
      unsubscribeSubmissions = client.subscribe(submissionChannel, (response) => {
          const payload = response.payload as any;
          if (payload.userId === user.$id) {
              // Simpler to just refetch to ensure all stats/lists are in sync 
              // instead of complex local state management for all counts
              fetchUserData(); 
          }
      });
    }

    return () => {
        if (unsubscribeUsers) unsubscribeUsers();
        if (unsubscribeSubmissions) unsubscribeSubmissions();
    };
  }, [user, authLoading]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (!user?.$id) return;

      const [userDocsRes, totalSubRes, pendingSubRes, approvedSubRes, mySubmissionsRes, tasksRes] = await Promise.all([
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
        // Fetch actual submissions list
        databases.listDocuments(DB_ID, COL_SUBMISSIONS, [
            Query.equal("userId", user.$id),
            Query.orderDesc("$createdAt")
        ]),
        // Fetch tasks for enriching title (optimistic: fetch 100 recent tasks)
        databases.listDocuments(DB_ID, COL_TASKS, [
            Query.limit(100)
        ])
      ]);

      // Set Stats
      const userDoc = userDocsRes.documents[0];
      setStats({
          balance: userDoc ? userDoc.balance : 0,
          totalSubmissions: totalSubRes.total,
          pendingSubmissions: pendingSubRes.total,
          approvedSubmissions: approvedSubRes.total,
      });

      // Process Submissions
      const taskMap = new Map(tasksRes.documents.map((t: any) => [t.$id, t]));
      const merged = mySubmissionsRes.documents.map((doc: any) => {
        const task = taskMap.get(doc.taskId);
        return {
            $id: doc.$id,
            taskId: doc.taskId,
            fileId: doc.fileId,
            status: doc.status,
            submittedAt: doc.submittedAt,
            taskTitle: task ? task.title : "Unknown Task",
            taskType: task ? task.task_type : "Unknown",
        };
      }) as Submission[];

      setSubmissions(merged);

    } catch (error) {
      console.error("Error fetching user dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'approved':
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 uppercase tracking-wide">Approved</span>;
        case 'rejected':
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 uppercase tracking-wide">Rejected</span>;
        default:
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 uppercase tracking-wide">Pending</span>;
    }
  };

  const openPreview = (sub: Submission) => {
     const url = storage.getFileView(BUCKET_ID, sub.fileId).toString();
     const type = sub.taskType === 'Video' ? 'video' : 'image';
     setPreviewFile({ url, type });
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
         {/* Submissions List (Replaces Payment Settings) */}
         <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Recent Submissions</h2>
            </div>
            
            {submissions.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                        <IoCloudUpload size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">No submissions yet</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Start working on tasks to see your submissions here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Task</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {submissions.map((sub) => (
                                <tr key={sub.$id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-zinc-900 dark:text-white">{sub.taskTitle}</div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sub.taskType}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                        {new Date(sub.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(sub.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openPreview(sub)} 
                                                className="p-2 text-zinc-500 hover:text-[var(--primary1)] hover:bg-[var(--primary1)]/10 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <IoEyeOutline size={18} />
                                            </button>
                                            <a 
                                                href={storage.getFileDownload(BUCKET_ID, sub.fileId).toString()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-zinc-500 hover:text-[var(--primary1)] hover:bg-[var(--primary1)]/10 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <IoCloudDownloadOutline size={18} />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
         </div>

         {/* Quick Links */}
         <div className="bg-gradient-to-br from-[var(--primary1)] to-[var(--primary2)] p-6 rounded-xl text-white flex flex-col justify-between shadow-lg h-fit sticky top-24">
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
            </div>
         </div>
      </div>

       {/* PREVIEW MODAL */}
       <AnimatePresence>
        {previewFile && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewFile(null)}
            >
            <button
                className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(null);
                }}
            >
                <IoClose size={32} />
            </button>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {previewFile.type === 'video' ? (
                <video
                    src={previewFile.url}
                    controls
                    autoPlay
                    className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
                />
                ) : (
                <img
                    src={previewFile.url}
                    alt="preview"
                    className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
                />
                )}
            </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
