"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  databases,
  storage,
  DB_ID,
  COL_SUBMISSIONS,
  COL_TASKS,
  COL_USERS,
  BUCKET_ID,
} from "@/app/appwrite/appwrite";
import { Query } from "appwrite";
import { IoArrowBack, IoCheckmark, IoClose, IoEye, IoCloudDownloadOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

interface Submission {
  $id: string;
  taskId: string;
  userId: string;
  fileId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  username?: string;
}

interface Task {
  $id: string;
  title: string;
  task_type: string;
  task_status:string;
}

export default function ReviewClient() {
  const params = useParams();
  const taskId = Array.isArray(params.taskId)
    ? params.taskId[0]
    : params.taskId;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    type: string;
  } | null>(null);
  const router = useRouter();

  const modalRef = useRef<HTMLDivElement>(null);

  // Auto focus modal when opened
  useEffect(() => {
    if (previewFile && modalRef.current) {
      modalRef.current.focus();
    }
  }, [previewFile]);

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!DB_ID || !COL_TASKS || !COL_SUBMISSIONS) {
        throw new Error("Appwrite configuration missing");
      }
      if (!taskId) return;

      const taskDoc = await databases.getDocument(DB_ID, COL_TASKS, taskId);
      setTask({
        $id: taskDoc.$id,
        title: taskDoc.title,
        task_type: taskDoc.task_type,
        task_status:taskDoc.status
      });

      const response = await databases.listDocuments(DB_ID, COL_SUBMISSIONS, [
        Query.equal("taskId", taskId),
        Query.orderDesc("$createdAt"),
      ]);

      // Fetch Users for these submissions
      const distinctUserIds = [...new Set(response.documents.map(d => d.userId))];
      // Note: fetching all individually or list query. For simplicity and small scale, Promise.all get or list is fine.
      // Better: list users where userId is in ... (not supported easily).
      // We will perform limited concurrent requests to fetch user details.
      
      const userMap = new Map<string, string>();
      
      if(distinctUserIds.length > 0) {
          // If less than say 10, fetch individually. Or fetch all users if not too many?
          // Let's iterate and fetch.
           const userPromises = distinctUserIds.map(id => 
               databases.listDocuments(DB_ID, COL_USERS, [Query.equal("userId", id)]).catch(()=>null)
           );
           const usersRes = await Promise.all(userPromises);
           usersRes.forEach(u => {
             if(u && u.documents.length > 0) {
                 userMap.set(u.documents[0].userId, u.documents[0].name);
             }
           });
      }

      const mappedSubmissions = response.documents.map((doc: any) => ({
        $id: doc.$id,
        taskId: doc.taskId,
        userId: doc.userId,
        fileId: doc.fileId,
        status: doc.status,
        submittedAt: doc.submittedAt,
        username: userMap.get(doc.userId) || "Unknown User",
      })) as Submission[];

      setSubmissions(mappedSubmissions);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    subId: string,
    status: "approved" | "rejected" | "pending",
  ) => {
    try {
      await databases.updateDocument(DB_ID, COL_SUBMISSIONS, subId, { status });

      setSubmissions((prev) =>
        prev.map((s) => (s.$id === subId ? { ...s, status } : s)),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getFileView = (fileId: string) => {
    return storage.getFileView(BUCKET_ID, fileId);
  };

  const openPreview = (fileId: string) => {
    const url = getFileView(fileId).toString();
    setPreviewFile({
      url,
      type: task?.task_type === "Video" ? "video" : "image",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <IoArrowBack size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            Review Submissions
            {task && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {task.task_type}
              </span>
            )}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            For Task:{" "}
            <span className="font-semibold">{task?.title || "Loading..."}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex flex-col gap-2">
          <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2">
            <IoClose className="text-xl" /> Error Loading Submissions
          </h3>
          <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          {error.includes("Index not found") && (
            <p className="text-red-600 dark:text-red-300 text-xs mt-1 font-mono bg-white/50 dark:bg-black/20 p-2 rounded">
              <strong>Tip:</strong> You need to create an index in Appwrite
              Database for the "submissions" collection. <br />
              Key: <code>taskId</code> <br />
              Type: <code>key</code>
            </p>
          )}
        </div>
      )}

      {/* Submissions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            No submissions received for this task yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <div
              key={sub.$id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Preview Box */}
              <div
                className="group relative mb-4 h-56 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                onClick={() => openPreview(sub.fileId)}
              >
                {task?.task_type === "Video" ? (
                  <video
                    src={getFileView(sub.fileId).toString()}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={getFileView(sub.fileId).toString()}
                    alt="submission"
                    className="w-full h-full object-contain"
                  />
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-3">
                  <div className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                    <IoEye /> Preview
                  </div>
                  <a
                    href={storage.getFileDownload(BUCKET_ID, sub.fileId).toString()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-black/80 backdrop-blur-sm p-2 rounded-full text-zinc-900 dark:text-white hover:text-[var(--primary1)] transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg"
                    title="Download"
                  >
                    <IoCloudDownloadOutline size={20} />
                  </a>
                </div>
              </div>

              {/* User + Status */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold mb-1">
                    Submitted By
                  </p>
                  <p
                    className="font-medium text-zinc-900 dark:text-white truncate max-w-[150px]"
                    title={sub.username || sub.userId}
                  >
                    {sub.username || "Unknown User"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[120px]">
                      {sub.userId}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    sub.status === "approved"
                      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                      : sub.status === "rejected"
                        ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
                Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              {task?.task_status === "open" && <div className="grid grid-cols-2 gap-3 mt-auto">
                {sub.status === "pending" ? (
                  <>
                    <button
                      onClick={() => updateStatus(sub.$id, "rejected")}
                      className="bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 py-2 rounded-xl transition font-medium flex items-center justify-center gap-2"
                    >
                      <IoClose /> Reject
                    </button>
                    <button
                      onClick={() => updateStatus(sub.$id, "approved")}
                      className="bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 py-2 rounded-xl transition font-medium flex items-center justify-center gap-2"
                    >
                      <IoCheckmark /> Approve
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updateStatus(sub.$id, "pending")}
                    className="col-span-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 py-2 rounded-xl transition font-medium text-sm"
                  >
                    Reset Status
                  </button>
                )}
              </div>}
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN MODAL */}
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
              className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50"
              onClick={() => setPreviewFile(null)}
            >
              <IoClose size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {previewFile.type === "video" ? (
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
