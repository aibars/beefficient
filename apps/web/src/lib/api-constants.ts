export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  GRAZING: {
    LIST: '/grazing',
    CREATE: '/grazing',
    UPDATE: (id: string) => `/grazing/${id}`,
    DELETE: (id: string) => `/grazing/${id}`,
  },
  ESTABLISHMENTS: {
    LIST: '/auth/farms',
    CREATE: '/auth/farm',
  },
};
