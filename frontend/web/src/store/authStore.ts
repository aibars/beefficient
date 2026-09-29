import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  login: async (email: string, password: string) => {
    // TODO: Implementar login con backend
    console.log('Login:', email, password);
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    localStorage.removeItem('token');
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
}));
