// 用户认证API服务
const API_BASE = import.meta.env.DEV ? '/api' : '/api';

import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  UserProfileUpdate, 
  PasswordChangeRequest,
  User,
  UserFavorite,
  UserDownload
} from '@/types';

// 构建请求工具函数
async function request<T>(
  path: string, 
  method: string = 'GET', 
  data?: any,
  requiresAuth: boolean = false
): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 添加认证token
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `请求失败: ${response.status}`);
  }

  return await response.json() as T;
}

// 用户认证相关API
export const authService = {
  // 登录
  login: (data: LoginRequest): Promise<AuthResponse> => 
    request('/auth/login', 'POST', data),

  // 注册
  register: (data: Omit<RegisterRequest, 'confirmPassword'>): Promise<AuthResponse> => 
    request('/auth/register', 'POST', data),

  // 获取当前用户信息
  getProfile: (): Promise<User> => 
    request('/auth/profile', 'GET', null, true),

  // 更新用户信息
  updateProfile: (data: UserProfileUpdate): Promise<User> => 
    request('/auth/profile', 'PUT', data, true),

  // 修改密码
  changePassword: (data: PasswordChangeRequest): Promise<{ message: string }> => 
    request('/auth/change-password', 'PUT', data, true),

  // 登出 (客户端操作，无需API调用)
  logout: () => {
    // 清除存储
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  },

  // 刷新token (如果实现token刷新机制)
  refreshToken: (): Promise<{ token: string }> => 
    request('/auth/refresh', 'POST', null, true),

  // 忘记密码请求
  requestPasswordReset: (email: string): Promise<{ message: string }> => 
    request('/auth/forgot-password', 'POST', { email }),

  // 重置密码
  resetPassword: (token: string, newPassword: string): Promise<{ message: string }> => 
    request('/auth/reset-password', 'POST', { token, newPassword }),
};

// 用户个人资料相关API
export const userService = {
  // 获取用户收藏
  getFavorites: (params?: { page?: number; pageSize?: number }): Promise<{
    favorites: UserFavorite[];
    total: number;
    page: number;
    pageSize: number;
  }> => 
    request('/user/favorites', 'GET', null, true),

  // 添加收藏
  addFavorite: (bookId: string): Promise<{ message: string }> => 
    request('/user/favorites', 'POST', { bookId }, true),

  // 移除收藏
  removeFavorite: (bookId: string): Promise<{ message: string }> => 
    request(`/user/favorites/${bookId}`, 'DELETE', null, true),

  // 检查是否已收藏
  checkFavorite: (bookId: string): Promise<{ isFavorite: boolean }> => 
    request(`/user/favorites/${bookId}/check`, 'GET', null, true),

  // 获取下载历史
  getDownloadHistory: (params?: { page?: number; pageSize?: number }): Promise<{
    downloads: UserDownload[];
    total: number;
    page: number;
    pageSize: number;
  }> => 
    request('/user/downloads', 'GET', null, true),

  // 添加下载记录
  addDownloadRecord: (bookId: string, format: 'pdf' | 'epub' | 'mobi'): Promise<{ message: string }> => 
    request('/user/downloads', 'POST', { bookId, format }, true),

  // 获取用户统计
  getUserStats: (): Promise<{
    totalFavorites: number;
    totalDownloads: number;
    favoriteCategories: Array<{ category: string; count: number }>;
  }> => 
    request('/user/stats', 'GET', null, true),
};

// 管理员用户管理API
export const adminUserService = {
  // 获取用户列表
  getUsers: (params?: { 
    page?: number; 
    pageSize?: number; 
    search?: string;
    role?: string;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    pageSize: number;
  }> => 
    request('/admin/users', 'GET', null, true),

  // 获取用户详情
  getUserById: (userId: string): Promise<User> => 
    request(`/admin/users/${userId}`, 'GET', null, true),

  // 更新用户信息
  updateUser: (userId: string, data: Partial<User>): Promise<User> => 
    request(`/admin/users/${userId}`, 'PUT', data, true),

  // 删除用户
  deleteUser: (userId: string): Promise<{ message: string }> => 
    request(`/admin/users/${userId}`, 'DELETE', null, true),

  // 更新用户角色
  updateUserRole: (userId: string, role: 'user' | 'admin'): Promise<User> => 
    request(`/admin/users/${userId}/role`, 'PUT', { role }, true),

  // 获取系统统计
  getSystemStats: (): Promise<{
    totalUsers: number;
    totalBooks: number;
    totalDownloads: number;
    activeUsers: number;
    recentRegistrations: User[];
  }> => 
    request('/admin/stats', 'GET', null, true),
};

// 验证工具函数
export const authUtils = {
  // 检查是否登录
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
  },

  // 获取当前token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  },

  // 获取当前用户
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // 检查是否是管理员
  isAdmin: (): boolean => {
    const user = authUtils.getCurrentUser();
    return user?.role === 'admin';
  },

  // 设置认证信息
  setAuth: (token: string, user: User, rememberMe: boolean = false): void => {
    if (rememberMe) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_user', JSON.stringify(user));
    }
  },

  // 清除认证信息
  clearAuth: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  },

  // 验证邮箱格式
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 验证密码强度
  validatePassword: (password: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('密码至少需要8个字符');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('密码必须包含至少一个大写字母');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('密码必须包含至少一个小写字母');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('密码必须包含至少一个数字');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密码必须包含至少一个特殊字符');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};