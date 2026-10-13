import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  effectiveRole: string | null; // Role override for admin viewing schools
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setUser: (user: User) => void;
  setEffectiveRole: (role: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      effectiveRole: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setUser: (user) => set({ user }),
      setEffectiveRole: (role) => set({ effectiveRole: role }),
      clearAuth: () => set({
        accessToken: null,
        refreshToken: null,
        user: null,
        effectiveRole: null,
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);