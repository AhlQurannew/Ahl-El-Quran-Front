import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://6d87-105-99-72-20.ngrok-free.app/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    // FORCE CACHE BUST - version 3
    console.log('[API Client v3] Interceptor running');
    
    // Check if admin is viewing a school (from session storage)
    if (typeof window !== 'undefined') {
      const adminViewData = sessionStorage.getItem('admin_viewing_school');
      console.log('[API Client v3] admin_viewing_school:', adminViewData);
      
      if (adminViewData) {
        try {
          const parsed = JSON.parse(adminViewData);
          const { id } = parsed;
          console.log('[API Client v3] Adding X-Role-Override for school:', id);
          
          // Add role override header when admin is viewing a school
          config.headers['x-role-override'] = 'CHIEF_SUPERVISOR';
          console.log('[API Client v3] Headers:', config.headers);
          
          // Always send school_id as query parameter (works for GET, POST, PUT, PATCH, DELETE)
          config.params = { ...config.params, school_id: id };
        } catch (e) {
          console.error('[API Client v3] Error parsing admin view data:', e);
        }
      } else {
        console.log('[API Client v3] No admin_viewing_school in sessionStorage');
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
