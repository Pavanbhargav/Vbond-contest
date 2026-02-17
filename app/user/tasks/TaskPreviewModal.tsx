import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoCalendar,
  IoCheckmarkCircle,
  IoLayersOutline,
} from "react-icons/io5";
import { Task } from "./UserTaskCard";

interface TaskPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onOpenSubmission: (task: Task) => void;
}

export default function TaskPreviewModal({
  isOpen,
  onClose,
  task,
  onOpenSubmission,
}: TaskPreviewModalProps) {
  if (!task) return null;

  const levelColors = {
    Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500",
    Medium:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  };

  const isClosed = task.status === 'closed';

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
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="fixed inset-4 md:inset-10 m-auto z-50 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800 h-fit max-h-[90vh]"
          >
            {/* Close Button Mobile */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-md text-zinc-500 dark:text-zinc-400 hover:text-red-500 rounded-full md:hidden"
            >
              <IoClose size={24} />
            </button>

            {/* Left Content: Description & Title */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
              <div className="mb-6 flex items-center gap-3 md:hidden">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${levelColors[task.level || "Easy"]}`}
                >
                  {task.level || "Easy"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {task.task_type}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                 {isClosed && (
                    <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold uppercase tracking-wide">
                        Closed
                    </span>
                 )}
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-6 leading-tight">
                {task.title}
              </h2>

              <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
                <p className="whitespace-pre-wrap leading-relaxed text-lg">
                  {task.description}
                </p>
              </div>
            </div>

            {/* Right Sidebar: Meta Data & Action */}
            <div className="w-full md:w-96 bg-zinc-50 dark:bg-zinc-950/50 p-8 border-l border-zinc-200 dark:border-zinc-800 flex flex-col gap-6 shrink-0">
              <div className="hidden md:flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <IoClose size={28} />
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 font-medium">
                  Reward
                </div>
                <div className="text-4xl font-bold text-[var(--primary1)] flex items-center gap-1">
                  $ {task.price}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                    <IoLayersOutline size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                      Type
                    </div>
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {task.task_type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div
                    className={`p-3 rounded-full ${levelColors[task.level || "Easy"].replace("text-", "bg-opacity-20 text-")}`}
                  >
                    <IoCheckmarkCircle size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                      Level
                    </div>
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {task.level || "Easy"}
                    </div>
                  </div>
                </div>

                {task.deadline && (
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">
                      <IoCalendar size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                        Deadline
                      </div>
                      <div className="font-medium text-zinc-900 dark:text-white">
                        {new Date(task.deadline).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6">
                <button 
                  onClick={() => onOpenSubmission(task)}
                  disabled={isClosed}
                  className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all text-lg flex items-center justify-center gap-2
                    ${isClosed 
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                        : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:shadow-xl hover:scale-[1.02] active:scale-95"
                    }`}
                >
                  {isClosed ? "Task Closed" : "Submit Work"}
                </button>
                {isClosed && (
                    <p className="text-center text-xs text-zinc-400 mt-3">
                        This task is no longer accepting submissions.
                    </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
