import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';

interface User {
  userId: string;
  email: string;
  name?: string;
  role?: 'admin' | 'manager' | 'viewer';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (supabaseUser, token) => {
        // Supabaseのユーザー情報を内部形式に変換
        const user: User = {
          userId: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || supabaseUser.email,
          role: supabaseUser.user_metadata?.role || 'viewer',
        };
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      initialize: async () => {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            const mappedUser: User = {
              userId: user.id,
              email: user.email!,
              name: user.user_metadata?.name || user.email,
              role: user.user_metadata?.role || 'viewer',
            };
            const token = localStorage.getItem('auth_token') || null;
            set({ user: mappedUser, token, isAuthenticated: true });
          } else {
            // セッションがない場合はクリア
            localStorage.removeItem('auth_token');
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Initialize auth error:', error);
          localStorage.removeItem('auth_token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
