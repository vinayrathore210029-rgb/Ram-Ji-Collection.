import { create } from 'zustand';
import api from '../services/api';
import { User } from '@ramjicollection/types';

interface AdminAuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data.data;
      
      if (user.role !== 'ADMIN') {
        throw new Error('Access denied. Admin role required.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ token, user, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw error.message || error.response?.data?.message || 'Login failed';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ loading: true });
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      if (user.role !== 'ADMIN') {
        throw new Error('Not Admin');
      }
      set({ user, loading: false });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, token: null, loading: false });
    }
  }
}));
