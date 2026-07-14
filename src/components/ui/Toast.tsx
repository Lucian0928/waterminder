"use client";

import { AnimatePresence, motion } from "framer-motion";

export interface ToastData {
  id: string;
  message: string;
  undoLabel?: string;
}

export function Toast({
  toast,
  onUndo,
}: {
  toast: ToastData | null;
  onUndo?: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center px-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="glass-pill pointer-events-auto flex items-center gap-3 rounded-full py-2.5 pl-5 pr-2.5"
            role="status"
          >
            <span className="text-sm font-semibold text-ink">
              {toast.message}
            </span>
            {onUndo && (
              <button
                onClick={onUndo}
                className="rounded-full bg-accent/15 px-3.5 py-1.5 text-sm font-bold text-accent transition-colors hover:bg-accent/25"
              >
                {toast.undoLabel ?? "Undo"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
