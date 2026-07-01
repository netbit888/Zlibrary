import { X, CheckCircle, Info, AlertCircle } from "lucide-react";
import { useBookStore } from "@/store/useBookStore";

const icons = {
  success: CheckCircle,
  info: Info,
  error: AlertCircle,
};

const styles = {
  success: "bg-green-50 text-green-800 border-green-200",
  info: "bg-ink/5 text-ink border-ink/10",
  error: "bg-red-50 text-red-800 border-red-200",
};

export default function Toast() {
  const toasts = useBookStore((s) => s.toasts);
  const removeToast = useBookStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type || "info"];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-book animate-fade-in-up ${
              styles[toast.type || "info"]
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
