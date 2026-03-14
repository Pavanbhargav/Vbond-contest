"use client";
import { useState, useEffect } from "react";
import { databases, DB_ID, COL_TASKS, client } from "../../appwrite/appwrite";
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

  useEffect(() => {
    let unsubscribe: () => void; // Variable to hold the cleanup function

    const init = async () => {
      try {
        setLoading(true);
        if (!DB_ID || !COL_TASKS) {
          console.error("Appwrite configuration missing");
          return;
        }

        // 1. FETCH INITIAL DATA (You must do this to see existing tasks)
        const response = await databases.listDocuments(
          DB_ID,
          COL_TASKS,
          [Query.orderDesc("$createdAt")]
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
          fileId: doc.fileId,
          task_file_id: doc.task_file_id,
          task_code: doc.task_code,
        })) as Task[];

        setTasks(mappedTasks);

        // 2. SUBSCRIBE TO UPDATES (This handles future changes)
        const channel = `databases.${DB_ID}.collections.${COL_TASKS}.documents`;
        
        unsubscribe = client.subscribe(channel, (realtimeResponse) => {
          const event = realtimeResponse.events[0];
          const payload = realtimeResponse.payload as any;

          // Map the single new/updated payload to your Task format
          const newTask: Task = {
             $id: payload.$id,
             title: payload.title,
             description: payload.description,
             status: payload.status,
             level: payload.level,
             price: payload.price,
             task_type: payload.task_type,
             deadline: payload.deadline || undefined,
             fileId: payload.fileId,
             task_file_id: payload.task_file_id,
             task_code: payload.task_code,
          };

          setTasks((prev) => {
            if (event.includes(".create")) {
               // Check if already exists to prevent duplicates (e.g. from fast updates)
               if (prev.some(t => t.$id === newTask.$id)) {
                   return prev.map(t => t.$id === newTask.$id ? newTask : t); 
               }
               return [newTask, ...prev]; // Add to top
            }
            if (event.includes(".update")) {
              return prev.map((t) => (t.$id === newTask.$id ? newTask : t)); // Replace
            }
            if (event.includes(".delete")) {
              return prev.filter((t) => t.$id !== newTask.$id); // Remove
            }
            return prev;
          });

          // Sync selectedTask (Preview Modal)
          setSelectedTask((prevSelected) => {
            if (!prevSelected) return prevSelected;
            if (prevSelected.$id === newTask.$id) {
                if (event.includes(".update")) {
                    return newTask;
                }
                if (event.includes(".delete")) {
                    return null;
                }
            }
            return prevSelected;
          });

          // Sync submissionTask (Submission Modal)
          setSubmissionTask((prevSubmission) => {
            if (!prevSubmission) return prevSubmission;
            if (prevSubmission.$id === newTask.$id) {
                if (event.includes(".update")) {
                    return newTask;
                }
                if (event.includes(".delete")) {
                    return null;
                }
            }
            return prevSubmission;
          });
        });

      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleOpenSubmission = (task: Task) => {
    setSelectedTask(null); // Close preview
    setSubmissionTask(task); // Open submission
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "All" || task.task_type === selectedType;
    return matchesSearch && matchesType;
  });

  const taskTypes = [
    "All",
    "Graphic Design",
    "Audio Editing",
    "Content Writing",
    "Website Design/ Development",
    "Digital Marketing",
    "Video Editing",
    "Video Shoot",
    "AI Content Creation",
    "Research /Data Collection",
    "3D / VR Design",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-3">
          Available Tasks
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Explore tasks, find your next challenge, and earn rewards completely
          remote.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 z-10 bg-gray-100  dark:bg-zinc-800 backdrop-blur-sm py-2 px-2 rounded-2xl border border-gray-200 dark:border-zinc-700">
        <div className="relative flex-grow">
          <IoSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search for tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        <div className="relative md:w-64 shrink-0 ">
          <IoFilter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            size={20}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all appearance-none shadow-sm cursor-pointer hover:border-[var(--primary1)]/50"
          >
            {taskTypes.map((type) => (
              <option key={type} value={type}>
                {type === "All" ? "All Categories" : type}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
          {filteredTasks.map((task) => (
            <UserTaskCard
              key={task.$id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="mx-auto w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
            <IoSearch size={40} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            No tasks found
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            We couldn't find any tasks matching your search. Try different
            keywords or filters.
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
