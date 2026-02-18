import { motion } from "framer-motion";
import { IoCalendar, IoCashOutline, IoLayersOutline, IoArrowForward } from "react-icons/io5";

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

interface UserTaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export default function UserTaskCard({ task, onClick }: UserTaskCardProps) {
  const levelColors = {
    Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500",
    Medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  };

  const isClosed = task.status === 'closed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(task)}
      className={`group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-xl hover:border-[var(--primary1)]/30 transition-all duration-300 flex flex-col h-full cursor-pointer ${isClosed ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
            {isClosed && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Closed
                </span>
            )}
            {task.level && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${levelColors[task.level] || levelColors.Easy}`}>
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

       <h3 className="text-xl font-bold text-zinc-900 dark:text-white line-clamp-2 mb-2 group-hover:text-[var(--primary1)] transition-colors" title={task.title}>
        {task.title}
      </h3>
      
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 line-clamp-3 flex-grow" title={task.description}>
        {task.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 mt-auto">
         {task.deadline ? (
          <div className="flex items-center gap-2">
            <IoCalendar className="text-[var(--primary1)]" />
            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        ) : <span>No Deadline</span>}

        <div className="flex items-center gap-1 text-[var(--primary1)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            View Details <IoArrowForward />
        </div>
      </div>
    </motion.div>
  );
}
