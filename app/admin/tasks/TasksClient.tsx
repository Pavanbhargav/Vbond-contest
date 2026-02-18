"use client";

import { useState, useEffect } from "react";
import {
  databases,
  DB_ID,
  COL_TASKS,
  COL_SUBMISSIONS,
  COL_USERS,
  COL_TRANSACTIONS,
  storage,
  BUCKET_ID,
  client,
} from "../../appwrite/appwrite";
import { ID, Query } from "appwrite";
import { useAuth } from "../../context/AuthContext";
import TaskCard, { Task } from "./TaskCard";
import TaskModal from "./TaskModal";
import { IoAdd, IoSearch } from "react-icons/io5";
import { motion } from "framer-motion";

export default function TasksClient() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      if (!DB_ID || !COL_TASKS) {
        console.error("Appwrite configuration missing");
        return;
      }

      const response = await databases.listDocuments(DB_ID, COL_TASKS, [
        Query.orderDesc("$createdAt"),
      ]);

      const mappedTasks = response.documents.map((doc: any) => ({
        $id: doc.$id,
        title: doc.title,
        description: doc.description,
        status: doc.status,
        level: doc.level,
        price: doc.price,
        task_type: doc.task_type,
        deadline: doc.deadline || undefined, // Handle possible null from Appwrite
        fileId: doc.fileId,
      })) as Task[];

      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe: () => void;

    if (!authLoading && isAdmin) {
      fetchTasks();
      
      // Realtime Subscription
      const channel = `databases.${DB_ID}.collections.${COL_TASKS}.documents`;
      unsubscribe = client.subscribe(channel, (response) => {
        const event = response.events[0];
        const payload = response.payload as any;

        const task: Task = {
            $id: payload.$id,
            title: payload.title,
            description: payload.description,
            status: payload.status,
            level: payload.level,
            price: payload.price,
            task_type: payload.task_type,
            deadline: payload.deadline || undefined,
            fileId: payload.fileId,
        };

        setTasks((prev) => {
            if (event.includes(".create")) {
                return [task, ...prev];
            }
            if (event.includes(".update")) {
                return prev.map((t) => (t.$id === task.$id ? task : t));
            }
            if (event.includes(".delete")) {
                return prev.filter((t) => t.$id !== task.$id);
            }
            return prev;
        });
      });
    }

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [authLoading, isAdmin]);

  const handleSaveTask = async (
    taskData: Omit<Task, "$id" | "$createdAt" | "$updatedAt">,
    file?: File | null
  ) => {
    setIsSaving(true);
    try {
      let fileId = selectedTask?.fileId;

      if (file) {
        // 1. Upload new file
        const uploadedFile = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
        );
        fileId = uploadedFile.$id;

        // 2. Delete old file if exists (cleanup)
        if (selectedTask?.fileId) {
            try {
                await storage.deleteFile(BUCKET_ID, selectedTask.fileId);
            } catch (e) {
                console.warn("Failed to delete old file:", e);
            }
        }
      }

      if (selectedTask) {
        // Update
        await databases.updateDocument(
          DB_ID,
          COL_TASKS,
          selectedTask.$id,
          {
            ...taskData,
            fileId: fileId,
          }
        );
      } else {
        // Create
        await databases.createDocument(DB_ID, COL_TASKS, ID.unique(), {
          ...taskData,
          fileId: fileId, // Add fileId to new task
          $createdAt: new Date().toISOString(),
        });
      }
      await fetchTasks();
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleClosePayout = async (task: Task) => {
    if (
      !confirm(
        `Are you sure you want to close "${task.title}" and process payouts? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // --- 1. Reject Pending Submissions ---
      const pendingSubmissions = await databases.listDocuments(
        DB_ID,
        COL_SUBMISSIONS,
        [
          Query.equal("taskId", task.$id),
          Query.equal("status", "pending"),
          Query.limit(100), // Adjust limit if needed
        ]
      );

      let rejectedCount = 0;
      for (const sub of pendingSubmissions.documents) {
        try {
          await databases.updateDocument(DB_ID, COL_SUBMISSIONS, sub.$id, {
            status: "rejected",
          });
          rejectedCount++;
        } catch (err) {
          console.error(`Failed to reject submission ${sub.$id}:`, err);
        }
      }

      // --- 2. Process Approved Submissions ---
      const approved = await databases.listDocuments(DB_ID, COL_SUBMISSIONS, [
        Query.equal("taskId", task.$id),
        Query.equal("status", "approved"),
        Query.limit(100),
      ]);

      if (approved.total === 0) {
        if (
          window.confirm(
            `No approved submissions found. ${rejectedCount} pending submissions were rejected. Close contest without payout?`
          )
        ) {
          await databases.updateDocument(DB_ID, COL_TASKS, task.$id, {
            status: "closed",
            total_approvals: 0,
          });
          fetchTasks();
        }
        return;
      }

      const payoutPerUser = Math.floor(task.price / approved.total);
      let successCount = 0;
      let failCount = 0;

      // --- 3. Distribute Payouts ---
      for (const sub of approved.documents) {
        try {
          const userDocs = await databases.listDocuments(DB_ID, COL_USERS, [
            Query.equal("userId", sub.userId),
          ]);

          if (userDocs.total > 0) {
            const userDoc = userDocs.documents[0];
            await databases.updateDocument(DB_ID, COL_USERS, userDoc.$id, {
              balance: userDoc.balance + payoutPerUser,
            });
            await databases.createDocument(
              DB_ID,
              COL_TRANSACTIONS,
              ID.unique(),
              {
                userId: sub.userId,
                transaction_amount: payoutPerUser,
                transaction_created: new Date().toISOString(),
              }
            );
            successCount++;
          } else {
            console.warn(`User document not found for userId: ${sub.userId}`);
            failCount++;
          }
        } catch (innerError) {
          console.error(`Failed to update user ${sub.userId}:`, innerError);
          failCount++;
        }
      }

      // --- 4. Close Task ---
      await databases.updateDocument(DB_ID, COL_TASKS, task.$id, {
        status: "closed",
        total_approvals: approved.total,
      });

      let message = `Successfully distributed ${task.price} among ${approved.total} users (${payoutPerUser} each).`;
      if (rejectedCount > 0) {
        message += `\nAlso rejected ${rejectedCount} pending submissions.`;
      }

      if (failCount > 0) {
        alert(
          `Distributed funds to ${successCount} users.\nWARNING: Failed to update ${failCount} users.\n${message}`
        );
      } else {
        alert(message);
      }

      fetchTasks();
    } catch (error: any) {
      console.error("Payout Failed:", error);
      alert(
        `Payout Failed: ${error.message}. Check your Collection Permissions.`
      );
    } finally {
        setLoading(false);
    }
  };

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary1)]"></div>
      </div>
    );
  if (!isAdmin)
    return <div className="p-8 text-center text-red-500">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Task Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Create, assign, and track team tasks
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--primary1)] to-[var(--primary2)] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-[var(--primary1)]/20 active:scale-95 transition-all font-medium"
        >
          <IoAdd size={20} />
          Create Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 relative">
        <IoSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-96 pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.$id}
              task={task}
              onEdit={openEditModal}
              onClosePayout={handleClosePayout}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
            <IoSearch size={32} />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">
            No tasks found
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by creating a new task"}
          </p>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={selectedTask}
        isLoading={isSaving}
      />
    </div>
  );
}
