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
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register" | "forgot";
  setAuth: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  openAuthModal: (mode?: "login" | "register" | "forgot") => void;
  closeAuthModal: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthModalOpen: false,
      authModalMode: "login",
      setAuth: (user) => set({ user, isLoading: false, isAuthModalOpen: false }),
      setLoading: (isLoading) => set({ isLoading }),
      openAuthModal: (mode = "login") => set({ isAuthModalOpen: true, authModalMode: mode }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      logout: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'yazmart-auth-user',
    }
  )
);