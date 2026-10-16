import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
}
