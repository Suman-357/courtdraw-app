import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

export const useAuthStore = create(persist((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      
      set({ 
        user: data.user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true, role: data.user.role };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      
      set({ 
        user: data.user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true, role: data.user.role };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  }
}), {
  name: 'auth-storage',
  partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
}));
