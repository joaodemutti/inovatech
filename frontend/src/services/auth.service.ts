import api from '@/lib/api';
import type { User, LoginRequest } from '@/types/auth';

export const authService = {
  login: (data: LoginRequest) => api.post<User>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),
};
