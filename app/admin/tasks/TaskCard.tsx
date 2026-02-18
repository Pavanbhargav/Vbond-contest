import { motion } from "framer-motion";
import { IoCalendar, IoCreateOutline, IoCashOutline, IoRibbonOutline, IoLayersOutline, IoEyeOutline, IoWalletOutline } from "react-icons/io5";
import Link from 'next/link';

export interface Task {
  $id: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  level?: 'Easy' | 'Medium' | 'Hard';
  task_type: 'Video' | 'Photo' | 'UI' | 'GraphicDesign' | 'VectorDesign';
  price: number;
  deadline?: string;
  fileId?: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onClosePayout: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onClosePayout }: TaskCardProps) {
  const statusColors = {
    open: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    closed: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  };

  const levelColors = {
    Easy: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800",
    Medium: "text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800",
    Hard: "text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-xl hover:border-[var(--primary1)]/30 transition-all duration-300 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[task.status] || statusColors.open}`}>
            {task.status}
          </span>
          {task.level && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${levelColors[task.level] || levelColors.Easy}`}>
              {task.level}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-zinc-900 dark:text-white font-bold bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-700">
           <IoCashOutline className="text-[var(--primary1)]" size={18} />
           <span>₹{task.price}</span>
        </div>
      </div>

      {/* Body */}
      <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white line-clamp-1" title={task.title}>
                {task.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
             <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
                <IoLayersOutline />
                <span className="uppercase tracking-wide font-medium">{task.task_type}</span>
             </div>
             {task.deadline && (
                <div className="flex items-center gap-1.5">
                    <IoCalendar className="text-[var(--primary1)]" />
                    <span>{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
            )}
          </div>

          <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed h-[4.5em]" title={task.description}>
            {task.description || "No description provided."}
          </p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
         <div className="flex items-center gap-1">
            <Link
                href={`/admin/tasks/${task.$id}/review`}
                className="p-2.5 text-zinc-400 hover:text-[var(--primary1)] hover:bg-[var(--primary1)]/10 rounded-xl transition-all"
                title="Review Submissions"
            >
                <IoEyeOutline size={20} />
            </Link>
            <button
                onClick={() => onEdit(task)}
                className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                title="Edit Task"
            >
                <IoCreateOutline size={20} />
            </button>
         </div>

         {task.status === 'open' && (
            <button
                onClick={() => onClosePayout(task)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                title="Close and Payout"
            >
                <IoWalletOutline size={18} />
                <span>Close & Payout</span>
            </button>
         )}
         {task.status === 'closed' && (
             <span className="text-xs font-medium text-zinc-400 italic px-2">
                 Payout Completed
             </span>
         )}
      </div>
    </motion.div>
  );
}
