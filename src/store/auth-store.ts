import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string | null;
  email?: string | null;
  phone?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  setAuth: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setAuth: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'yazmart-auth-user',
    }
  )
);