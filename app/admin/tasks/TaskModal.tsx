import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { IoClose, IoSave, IoAlertCircle, IoCashOutline, IoLayersOutline, IoOptionsOutline } from "react-icons/io5";
import { Task } from "./TaskCard";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, '$id' | '$createdAt' | '$updatedAt'>) => Promise<void>;
  initialData?: Task | null;
  isLoading: boolean;
}

export default function TaskModal({ isOpen, onClose, onSave, initialData, isLoading }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "open" as Task['status'],
    level: "Easy" as Task['level'],
    task_type: "Video" as Task['task_type'],
    price: 0,
    deadline: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        status: initialData.status,
        level: initialData.level || "Easy",
        task_type: initialData.task_type,
        price: initialData.price,
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "open",
        level: "Easy",
        task_type: "Video",
        price: 0,
        deadline: "",
      });
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return setError("Title is required");
    if (!formData.description) return setError("Description is required");
    if (formData.price < 0) return setError("Price cannot be negative");
    
    try {
      await onSave({
        ...formData,
        price: Math.round(formData.price), // Ensure integer as requested
        level: formData.level || undefined, // Send undefined if empty (though we interpret "Easy" as default)
        deadline: formData.deadline || undefined, // Send undefined if empty
      } as any);
    } catch (err) {
      console.error(err);
      setError("Failed to save task. Please try again.");
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-6xl h-fit max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col"
          >
            <div className="flex items-center justify-between p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div>
                 <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {initialData ? "Update Task" : "Create New Task"}
                 </h2>
                 <p className="text-zinc-500 dark:text-zinc-400 mt-1">Fill in the details below to manage the task.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <IoClose size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-sm flex items-center gap-3">
                  <IoAlertCircle className="flex-shrink-0 text-2xl" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Main Info Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Left Column: Title & Description */}
                 <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all text-lg"
                        placeholder="e.g. Redesign Landing Page"
                        autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={8}
                        className="w-full px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Add detailed instructions, requirements, and context..."
                        />
                    </div>
                 </div>

                 {/* Right Column: Meta Data */}
                 <div className="space-y-6 bg-zinc-50 dark:bg-zinc-800/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                        <IoOptionsOutline /> Settings
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-5">
                       <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Task Level
                            </label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Task Type <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <IoLayersOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <select
                                    value={formData.task_type}
                                    onChange={(e) => setFormData({ ...formData, task_type: e.target.value as any })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Photo">Photo</option>
                                    <option value="UI">UI</option>
                                    <option value="Video">Video</option>
                                    <option value="GraphicDesign">Graphic Design</option>
                                    <option value="VectorDesign">Vector Design</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Price ($) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <IoCashOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="number"
                                    min="0"
                                    step="1" 
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Deadline
                        </label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition-all"
                        />
                    </div>
                 </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--primary1)] to-[var(--primary2)] text-white font-bold shadow-lg hover:shadow-[var(--primary1)]/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <IoSave size={20} />
                      {initialData ? "Update Task" : "Create Task"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
