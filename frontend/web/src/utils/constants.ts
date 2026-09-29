export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const API_VERSION = '/api/v1';
export const FULL_API_URL = `${API_URL}${API_VERSION}`;

export const PROFILE_TYPES = {
  PRODUCTOR: 'productor',
  TECNICO: 'tecnico',
} as const;

export const PROFILE_LABELS = {
  [PROFILE_TYPES.PRODUCTOR]: 'Productor',
  [PROFILE_TYPES.TECNICO]: 'Técnico',
} as const;
