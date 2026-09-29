export type ProfileType = 'productor' | 'tecnico';

export interface User {
  id: string;
  email: string;
  name: string;
  profileType: ProfileType;
  isActive: boolean;
}

export interface Establishment {
  id: string;
  userId: string;
  name: string;
  location?: string;
  hectares?: number;
}

export interface ApiError {
  success: false;
  error: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
