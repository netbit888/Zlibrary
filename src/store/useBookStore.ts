import { create } from "zustand";
import type { Book, SearchParams, ToastMessage } from "@/types";
import allBooks from "@/data/books";

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

export function searchBooks(
  params: SearchParams
): Promise<{ books: Book[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...allBooks];

      if (params.q) {
        const q = params.q.toLowerCase();
        results = results.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.description.toLowerCase().includes(q)
        );
      }

      if (params.category) {
        results = results.filter((b) => b.category === params.category);
      }

      if (params.formats && params.formats.length > 0) {
        results = results.filter((b) =>
          params.formats!.some((f) => b.formats.includes(f as any))
        );
      }

      if (params.language) {
        results = results.filter((b) => b.language === params.language);
      }

      if (params.sortBy) {
        if (params.sortBy === "rating") {
          results.sort((a, b) => b.rating - a.rating);
        } else if (params.sortBy === "newest") {
          results.sort((a, b) => b.year - a.year);
        }
      }

      const page = params.page || 1;
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      const paginated = results.slice(start, start + pageSize);

      resolve({ books: paginated, total: results.length });
    }, 300);
  });
}

export function getBookById(id: string): Promise<Book | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(allBooks.find((b) => b.id === id));
    }, 200);
  });
}

export function getCategories(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cats = Array.from(new Set(allBooks.map((b) => b.category)));
      resolve(cats);
    }, 100);
  });
}

export function getPopularBooks(): Promise<Book[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = [...allBooks].sort((a, b) => b.downloads - a.downloads);
      resolve(sorted.slice(0, 8));
    }, 200);
  });
}
