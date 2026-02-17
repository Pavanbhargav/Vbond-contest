"use client"
import { useState, useEffect } from "react";
import { databases, DB_ID, COL_TASKS } from "../../appwrite/appwrite";
import { Query } from "appwrite";
import { useAuth } from "../../context/AuthContext";
import UserTaskCard, { Task } from "./UserTaskCard";
import TaskPreviewModal from "./TaskPreviewModal";
import SubmissionModal from "./SubmissionModal";
import { IoSearch, IoFilter } from "react-icons/io5";

export default function UserTasksClient() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionTask, setSubmissionTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      if (!DB_ID || !COL_TASKS) {
        console.error("Appwrite configuration missing");
        return;
      }
      
      const response = await databases.listDocuments(
        DB_ID,
        COL_TASKS,
        [
            Query.orderDesc("$createdAt")
        ]
      );
      
      const mappedTasks = response.documents.map((doc: any) => ({
        $id: doc.$id,
        title: doc.title,
        description: doc.description,
        status: doc.status,
        level: doc.level,
        price: doc.price,
        task_type: doc.task_type,
        deadline: doc.deadline || undefined,
      })) as Task[];

      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     fetchTasks();
  }, []); 

  const handleOpenSubmission = (task: Task) => {
    setSelectedTask(null); // Close preview
    setSubmissionTask(task); // Open submission
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || task.task_type === selectedType;
    return matchesSearch && matchesType;
  });

  const taskTypes = ["All", "Video", "Photo", "UI", "GraphicDesign", "VectorDesign"];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-3">
            Available Tasks
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Explore tasks, find your next challenge, and earn rewards completely remote.
          </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 z-10 bg-[var(--background)]/95 backdrop-blur-sm py-2">
        <div className="relative flex-grow">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
            type="text"
            placeholder="Search for tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all shadow-sm"
            />
        </div>
        
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar">
            {taskTypes.map((type) => (
                <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all ${
                        selectedType === type
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg"
                        : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl animate-pulse" />
            ))}
         </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredTasks.map((task) => (
            <UserTaskCard key={task.$id} task={task} onClick={() => setSelectedTask(task)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="mx-auto w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
            <IoSearch size={40} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            We couldn't find any tasks matching your search. Try different keywords or filters.
          </p>
        </div>
      )}

      <TaskPreviewModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onOpenSubmission={handleOpenSubmission}
      />
      
      <SubmissionModal
        isOpen={!!submissionTask}
        onClose={() => setSubmissionTask(null)}
        task={submissionTask}
        userId={user?.$id || ""}
      />
    </div>
  );
}
