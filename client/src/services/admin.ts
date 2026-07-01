// 开发环境走 Vite 代理（同源），生产环境走绝对地址
const API_BASE = import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_URL || "") + "/api";

const ADMIN_TOKEN_KEY = "zlib_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["x-admin-token"] = token;
  }
  const res = await fetch(API_BASE + path, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `请求失败: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function adminLogin(password: string): Promise<{ token: string; success: boolean }> {
  const res = await fetch(API_BASE + "/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "登录失败");
  return data;
}

export async function adminGetBooks(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ books: any[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams();
  if (params.q) query.append("q", params.q);
  if (params.page) query.append("page", String(params.page));
  if (params.pageSize) query.append("pageSize", String(params.pageSize));
  const qs = query.toString();
  return request(`/admin/books${qs ? `?${qs}` : ""}`);
}

export async function adminCreateBook(data: Record<string, any>): Promise<{ id: string; success: boolean }> {
  return request("/admin/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function adminUpdateBook(id: string, data: Record<string, any>): Promise<{ success: boolean }> {
  return request(`/admin/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function adminDeleteBook(id: string): Promise<{ success: boolean }> {
  return request(`/admin/books/${id}`, {
    method: "DELETE",
  });
}

export async function adminUploadFile(file: File, type: "cover" | "book"): Promise<{ url: string; filename: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAdminToken();
  const res = await fetch(API_BASE + "/admin/upload?type=" + type, {
    method: "POST",
    headers: token ? { "x-admin-token": token } : {},
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "上传失败");
  }
  return res.json();
}
