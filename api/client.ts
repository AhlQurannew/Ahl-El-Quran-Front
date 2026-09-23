import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check if admin is viewing a school (from session storage)
    if (typeof window !== 'undefined') {
      const adminViewData = sessionStorage.getItem('admin_viewing_school');
      if (adminViewData) {
        try {
          const { id } = JSON.parse(adminViewData);
          // Add school_id as query parameter for GET requests
          // or as body parameter for POST/PUT/PATCH requests
          if (config.method?.toLowerCase() === 'get') {
            config.params = { ...config.params, school_id: id };
          } else if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
            if (config.data && typeof config.data === 'object') {
              config.data = { ...config.data, school_id: id };
            }
          }
        } catch (e) {
          console.error('Error parsing admin view data:', e);
        }
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;