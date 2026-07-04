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

// 用户相关类型
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserProfileUpdate {
  username?: string;
  bio?: string;
  avatar?: string;
}

// 用户收藏和下载历史
export interface UserFavorite {
  userId: string;
  bookId: string;
  book: Book;
  createdAt: string;
}

export interface UserDownload {
  id: string;
  userId: string;
  bookId: string;
  book: Book;
  format: 'pdf' | 'epub' | 'mobi';
  downloadedAt: string;
}
