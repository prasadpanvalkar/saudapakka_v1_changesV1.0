import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/axios';

interface User {
  id: string;
  first_name?: string;  // Added for layout compatibility
  last_name?: string;   // Added for layout compatibility
  full_name: string;
  email: string;
  is_active_seller: boolean;
  is_active_broker: boolean;
  is_staff: boolean;
  kyc_verified?: boolean;
}

interface AuthState {
  user: User | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkUser: () => Promise<void>; // Alias for layouts
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      setAuth: (user, token, refreshToken) => {
        Cookies.set('access_token', token, { expires: 7 });
        Cookies.set('refresh_token', refreshToken, { expires: 7 });
        set({ user });
      },

      refreshUser: async () => {
        try {
          const res = await api.get("/api/user/me/");
          // This updates the local state AND the persisted localStorage
          set({ user: res.data });
          console.log("✅ Auth State Synchronized:", res.data);
        } catch (error: any) {
          console.error("Failed to refresh user data", error);
          // Interceptor handles 401 and redirect if refresh fails
          // We just need to ensure local state is cleared if that happens
          if (error.response?.status === 401) {
            set({ user: null });
          }
          throw error;
        }
      },

      // Use this in layouts to ensure fresh data on every navigation
      checkUser: async () => {
        const token = Cookies.get('access_token');
        const refreshToken = Cookies.get('refresh_token');

        // As long as we have a refresh token, we technically have a session
        // The interceptor will swap it for a new access token if needed
        if (token || refreshToken) {
          await get().refreshUser();
        }
      },

      logout: () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        localStorage.removeItem('saudapakka-auth'); // Clear storage
        set({ user: null });
      },
    }),
    {
      name: 'saudapakka-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      skipHydration: true, // Prevent automatic hydration during SSR
    }
  )
);