import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  AlertTriangle,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastFn: (message: string, type: ToastType) => void;

export const showToast = (message: string, type: ToastType = "info") => {
  if (toastFn) toastFn(message, type);
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastFn = (message: string, type: ToastType) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 w-full max-w-[400px] pointer-events-none px-6 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-10 duration-300
            ${
              toast.type === "success"
                ? "bg-emerald-500/90 border-emerald-400/30 text-white"
                : toast.type === "error"
                  ? "bg-rose-500/90 border-rose-400/30 text-white"
                  : toast.type === "warning"
                    ? "bg-amber-500/90 border-amber-400/30 text-white"
                    : "bg-blue-600/90 border-blue-400/30 text-white"
            }
          `}
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && <CheckCircle2 size={20} />}
            {toast.type === "error" && <AlertCircle size={20} />}
            {toast.type === "warning" && <AlertTriangle size={20} />}
            {toast.type === "info" && <Info size={20} />}
            <p className="text-xs font-black uppercase tracking-widest">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
