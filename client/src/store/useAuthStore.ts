import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types';

interface AuthState {
  // 用户信息
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 用户操作
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  register: (email: string, username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// 从localStorage中检查token和用户信息
const getStoredAuth = () => {
  if (typeof window === 'undefined') return { token: null, user: null };

  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');

  if (!token || !userStr) return { token: null, user: null };

  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const storedAuth = getStoredAuth();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: storedAuth.user,
      token: storedAuth.token,
      isAuthenticated: !!storedAuth.token,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || '登录失败');
          }
          
          // 存储token和用户信息
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('auth_token', data.token);
          storage.setItem('auth_user', JSON.stringify(data.user));

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '登录失败';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      register: async (email: string, username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '注册失败');
          }

          const data: AuthResponse = await response.json();
          
          // 自动登录
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '注册失败';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      logout: () => {
        // 清除所有存储
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: async (updates: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          const { token } = get();
          if (!token) throw new Error('用户未登录');

          const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '更新失败');
          }

          const updatedUser: User = await response.json();
          
          // 更新存储的用户信息
          const userStr = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
          if (userStr) {
            const storage = localStorage.getItem('auth_user') ? localStorage : sessionStorage;
            storage.setItem('auth_user', JSON.stringify(updatedUser));
          }

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '更新失败';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      setUser: (user: User) => {
        const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
        storage.setItem('auth_user', JSON.stringify(user));
        set({ user });
      },

      setToken: (token: string) => {
        const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
        storage.setItem('auth_token', token);
        set({ token, isAuthenticated: true });
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// 认证hooks
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
};
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);