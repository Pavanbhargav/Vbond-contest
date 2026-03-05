import { BUCKET_ID, storage } from "@/app/appwrite/appwrite";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  IoCalendar,
  IoCashOutline,
  IoLayersOutline,
  IoArrowForward,
} from "react-icons/io5";

export interface Task {
  $id: string;
  title: string;
  description: string;
  status: "open" | "closed";
  level?: "Easy" | "Medium" | "Hard";
  task_type: "Video" | "Photo" | "UI" | "GraphicDesign" | "VectorDesign";
  price: number;
  deadline?: string;
  fileId?: string;
  task_file_id?: string;
  task_code?: string;
}

interface UserTaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export default function UserTaskCard({ task, onClick }: UserTaskCardProps) {
  const levelColors = {
    Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500",
    Medium:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  };

  const isClosed = task.status === "closed";

  // Make sure to cast as string or handle the null gracefully
  const imageUrl = task.task_file_id
    ? storage.getFileView(BUCKET_ID, task.task_file_id).toString()
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(task)}
      className={`group relative dark:bg-zinc-900 rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer ${
        isClosed
          ? "bg-gray-100 border-red-300 dark:border-red-900/60 border-dashed hover:border-red-400 dark:hover:border-red-800"
          : "bg-white border-zinc-200 dark:border-zinc-800 hover:border-[var(--primary1)]/30"
      }`}
    >
      {/* FIX: Added 'relative' to the parent div */}
      {imageUrl && (
        <div className="w-full rounded-xl overflow-hidden mb-4 shrink-0">
          {/* Removed 'relative' and 'h-40' from the wrapper */}
          <Image
            src={imageUrl}
            alt={task.title}
            width={0} // Tell Next.js we will handle the sizing
            height={0} // Tell Next.js we will handle the sizing
            sizes="100vw"
            priority
            className="w-full h-auto" // <-- CSS handles the responsive aspect ratio
          />
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          {isClosed && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
              Closed
            </span>
          )}
          {task.task_code && (
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
                  {task.task_code}
              </span>
          )}
          {task.level && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${levelColors[task.level] || levelColors.Easy}`}
            >
              {task.level}
            </span>
          )}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            <IoLayersOutline />
            <span>{task.task_type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--primary1)] flex items-center gap-1">
            <IoCashOutline /> ₹{task.price}
          </span>
        </div>
      </div>

      <h3
        className={`text-xl font-bold line-clamp-2 mb-2 transition-colors ${
          isClosed
            ? "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white"
            : "text-zinc-900 dark:text-white group-hover:text-[var(--primary1)]"
        }`}
        title={task.title}
      >
        {task.title}
      </h3>

      <p
        className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 line-clamp-3 flex-grow"
        title={task.description}
      >
        {task.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 mt-auto">
        {task.deadline ? (
          <div className="flex items-center gap-2">
            <IoCalendar className="text-[var(--primary1)]" />
            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        ) : (
          <span>No Deadline</span>
        )}

        <div
          className={`flex items-center gap-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300 ${
            isClosed
              ? "text-zinc-600 dark:text-zinc-400"
              : "text-[var(--primary1)]"
          }`}
        >
          {isClosed ? "View Results" : "View Details"} <IoArrowForward />
        </div>
      </div>
    </motion.div>
  );
}
