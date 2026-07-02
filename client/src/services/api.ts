// 开发环境走 Vite 代理，生产环境同源（Pages Functions 部署在 /api/*）
const API_BASE = import.meta.env.DEV
  ? "/api"
  : "/api";

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
}

export interface SearchParams {
  q?: string;
  category?: string;
  formats?: string[];
  language?: string;
  sortBy?: "relevance" | "rating" | "newest";
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = API_BASE + path;
  if (!params) return base;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      search.append(k, String(v));
    }
  });
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

async function request<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function searchBooks(params: SearchParams): Promise<SearchResult> {
  return request<SearchResult>("/books/search", {
    q: params.q,
    category: params.category,
    formats: params.formats?.join(","),
    language: params.language,
    sortBy: params.sortBy,
    page: params.page,
    pageSize: 10,
  });
}

export function getBookById(id: string): Promise<Book> {
  return request<Book>(`/books/${encodeURIComponent(id)}`);
}

export function getCategories(): Promise<string[]> {
  return request<string[]>("/categories");
}

export function getPopularBooks(limit = 8): Promise<Book[]> {
  return request<Book[]>("/books/popular", { limit });
}
