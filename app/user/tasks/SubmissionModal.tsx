"use client"
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { IoClose, IoCloudUploadOutline, IoCheckmarkCircle, IoAlertCircle, IoTimeOutline } from "react-icons/io5";
import { Task } from "./UserTaskCard";
import { databases, storage, DB_ID, COL_SUBMISSIONS, BUCKET_ID } from "../../appwrite/appwrite";
import { ID, Query } from "appwrite";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  userId: string;
}

export default function SubmissionModal({ isOpen, onClose, task, userId }: SubmissionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkSubmission = async () => {
        if (!isOpen || !task || !userId) return;
        
        setCheckingStatus(true);
        try {
            const response = await databases.listDocuments(
                DB_ID,
                COL_SUBMISSIONS,
                [
                    Query.equal('taskId', task.$id),
                    Query.equal('userId', userId)
                ]
            );
            if (response.documents.length > 0) {
                setHasSubmitted(true);
            } else {
                setHasSubmitted(false);
            }
        } catch (err) {
            console.error("Error checking submission status:", err);
        } finally {
            setCheckingStatus(false);
        }
    };

    checkSubmission();
  }, [isOpen, task, userId]);


  if (!task || !isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // 1. Upload file to Storage
      const fileUpload = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file
      );

      // 2. Create Submission Record
      await databases.createDocument(
        DB_ID,
        COL_SUBMISSIONS,
        ID.unique(),
        {
          taskId: task.$id,
          userId: userId,
          fileId: fileUpload.$id,
          status: "pending",
          submittedAt: new Date().toISOString(),
          // Add other fields if required by your schema
        }
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFile(null);
        setHasSubmitted(true); // Mark as submitted so next time it shows the status
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-lg h-fit bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8"
          >
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Submit Work</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    For: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{task.title}</span>
                  </p>
               </div>
               <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <IoClose size={24} />
               </button>
            </div>

            {checkingStatus ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-8 h-8 border-4 border-[var(--primary1)] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-zinc-500 dark:text-zinc-400">Checking status...</p>
                </div>
            ) : hasSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-4">
                        <IoCheckmarkCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Already Submitted</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto mb-6">
                        You have already submitted your work for this task. You can only submit once.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            ) : success ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <IoCheckmarkCircle className="text-green-500 text-6xl mb-4" />
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Submission Successful!</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Your work has been submitted.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                            <IoAlertCircle className="text-lg" />
                            {error}
                        </div>
                    )}

                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-[var(--primary1)] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group cursor-pointer relative">
                        <input 
                            type="file" 
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-[var(--primary1)] mb-4 transition-colors">
                            <IoCloudUploadOutline size={32} />
                        </div>
                        {file ? (
                             <p className="font-medium text-zinc-900 dark:text-white truncate max-w-full px-4">
                                {file.name}
                             </p>
                        ) : (
                            <>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                    Click or Drag file to upload
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                                    Supports: Images, Videos, ZIP (Max 50MB)
                                </p>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--primary1)] to-[var(--primary2)] text-white font-bold shadow-lg hover:shadow-[var(--primary1)]/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                             <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                             </>
                        ) : (
                            "Submit Work"
                        )}
                    </button>
                </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
