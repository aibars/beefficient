import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => Promise<void>;
  setToken: (token: string | null) => Promise<void>;
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  restore: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({
          token,
          user,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Failed to restore auth:', error);
    }
  },

  login: async (email: string, password: string) => {
    // TODO: Implementar login con backend
    console.log('Login:', email, password);
  },

  logout: async () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    await AsyncStorage.multiRemove(['token', 'user']);
  },

  setUser: async (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('user');
    }
  },

  setToken: async (token) => {
    set({ token });
    if (token) {
      await AsyncStorage.setItem('token', token);
    } else {
      await AsyncStorage.removeItem('token');
    }
  },
}));
