export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  publisher: string;
  year: number;
  pages: number;
  language: string;
  rating: number;
  downloads: number;
  category: string;
  formats: ("pdf" | "epub" | "mobi")[];
  description: string;
  pdf_url?: string;
  epub_url?: string;
  mobi_url?: string;
}

export interface SearchParams {
  q?: string;
  category?: string;
  formats?: string[];
  language?: string;
  sortBy?: "relevance" | "rating" | "newest";
  page?: number;
}

export interface ToastMessage {
  id: number;
  message: string;
  type?: "success" | "info" | "error";
}
