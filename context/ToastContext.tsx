"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: "bg-white border-green-200 text-green-800",
  error: "bg-white border-red-200 text-red-800",
  info: "bg-white border-blue-200 text-blue-800",
};

const iconColorMap: Record<ToastType, string> = {
  success: "text-green-600",
  error: "text-red-600",
  info: "text-blue-600",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const Icon = iconMap[toast.type];
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${colorMap[toast.type]}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColorMap[toast.type]}`} />
      <p className="text-sm flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-700 -mr-1 mt-0.5"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}
