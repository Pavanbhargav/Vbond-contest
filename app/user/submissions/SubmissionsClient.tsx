"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  databases,
  storage,
  DB_ID,
  COL_SUBMISSIONS,
  COL_TASKS,
  BUCKET_ID,
} from "../../appwrite/appwrite";
import { Query } from "appwrite";
import { IoCloudDownloadOutline, IoEyeOutline, IoSearch, IoClose } from "react-icons/io5";
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
export default function SubmissionClient(){
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // 1. Fetch User's Submissions containing userId
      const subResponse = await databases.listDocuments(
        DB_ID,
        COL_SUBMISSIONS,
        [
            Query.equal("userId", user!.$id),
            Query.orderDesc("$createdAt")
        ]
      );

      // 2. Fetch All Tasks (Optimization: In a real app with thousands of tasks, we'd fetch only needed IDs or use an Appwrite function lookup. For now, fetching all/active is okay or we can map efficiently)
      // Actually, let's fetch only the unique taskIds from submissions if possible, but listDocuments query logic for "in" array might be complex.
      // Easiest approach for now: Fetch all tasks (since tasks list isn't huge yet) or better:
      // Loop and fetch task details? No, that's N+1.
      // Let's fetch the tasks.
      const taskResponse = await databases.listDocuments(
        DB_ID,
        COL_TASKS,
        [Query.limit(100)] // Adjust limit as needed
      );
      
      const taskMap = new Map(taskResponse.documents.map((t: any) => [t.$id, t]));

      // 3. Merge Data
      const merged = subResponse.documents.map((doc: any) => {
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
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      setError(error.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const getFileView = (fileId: string) => {
    // Returns view URL (image preview)
    return storage.getFileView(BUCKET_ID, fileId);
  };

  const openPreview = (sub: Submission) => {
     const url = getFileView(sub.fileId).toString();
     // Simple type check based on task type or just generic
     const type = sub.taskType === 'Video' ? 'video' : 'image';
     setPreviewFile({ url, type });
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

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">My Submissions</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Track the status of your submitted work</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex flex-col gap-2">
            <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2">
                <IoClose className="text-xl" /> Error Loading Submissions
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">
                {error}
            </p>
            {error.includes("Index not found") && (
                <p className="text-red-600 dark:text-red-300 text-xs mt-1 font-mono bg-white/50 dark:bg-black/20 p-2 rounded">
                    <strong>Tip:</strong> You need to create an index in Appwrite Database for the "submissions" collection. <br/>
                    Key: <code>userId</code> <br/>
                    Type: <code>key</code>
                </p>
            )}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
             <div className="p-8 text-center text-zinc-500 animate-pulse">Loading submissions...</div>
        ) : submissions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                    <IoCloudDownloadOutline size={32} />
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
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Task Details</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Submitted On</th>
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
                                    {new Date(sub.submittedAt).toLocaleDateString()} <span className="text-zinc-400 text-xs ml-1">{new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(sub.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => openPreview(sub)} 
                                            className="p-2 text-zinc-500 hover:text-[var(--primary1)] hover:bg-[var(--primary1)]/10 rounded-lg transition-colors border border-transparent hover:border-[var(--primary1)]/20"
                                            title="View Submission"
                                        >
                                            <IoEyeOutline size={20} />
                                        </button>
                                        <a 
                                            href={storage.getFileDownload(BUCKET_ID, sub.fileId).toString()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-zinc-500 hover:text-[var(--primary1)] hover:bg-[var(--primary1)]/10 rounded-lg transition-colors border border-transparent hover:border-[var(--primary1)]/20"
                                            title="Download File"
                                        >
                                            <IoCloudDownloadOutline size={20} />
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
             {/* Close Button defined absolutely relative to viewport or container */}
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
