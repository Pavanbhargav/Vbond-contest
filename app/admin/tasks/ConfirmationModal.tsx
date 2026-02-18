import { motion, AnimatePresence } from "framer-motion";
import { IoAlertCircle, IoCheckmarkCircleOutline, IoClose } from "react-icons/io5";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  type?: "confirm" | "alert"; // confirm = 2 buttons, alert = 1 button (OK)
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  type = "confirm",
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto z-[60] w-full max-w-md h-fit p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'}`}>
                {isDanger ? <IoAlertCircle size={32} /> : <IoCheckmarkCircleOutline size={32} />}
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                {title}
            </h3>
            
            <div className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                {message}
            </div>

            <div className="flex items-center gap-3 w-full">
                {type === "confirm" && (
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                )}
                <button
                    onClick={() => {
                        onConfirm();
                        if (type === "alert") onClose();
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 ${
                        isDanger 
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                        : 'bg-[var(--primary1)] hover:bg-[var(--primary1)]/90 shadow-[var(--primary1)]/20'
                    }`}
                >
                    {confirmText}
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
