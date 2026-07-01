import { create } from "zustand";
import type { ToastMessage } from "@/types";

interface BookStore {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage["type"]) => void;
  removeToast: (id: number) => void;
}

let toastId = 0;

export const useBookStore = create<BookStore>((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
