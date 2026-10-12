import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/utils/auth';

/**
 * Add authentication token to all requests
 */
export const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }
  return config;
};

/**
 * Add school_id parameter when admin is viewing a specific school
 * This allows admin to act as president of that school
 */
export const schoolContextInterceptor = (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const adminViewData = sessionStorage.getItem('admin_viewing_school');
    if (adminViewData) {
      try {
        const { id } = JSON.parse(adminViewData);
        // Add school_id as query parameter
        config.params = { ...config.params, school_id: id };
      } catch (e) {
        console.error('Error parsing admin view data:', e);
      }
    }
  }
  return config;
};

/**
 * Handle 401 errors by logging out the user
 */
export const authErrorInterceptor = async (error: any) => {
  if (error.response?.status === 401) {
    logout(true);
  }
  return Promise.reject(error);
};

/**
 * Setup common interceptors for an axios instance
 */
export const setupInterceptors = (axiosInstance: AxiosInstance, includeSchoolContext: boolean = true) => {
  // Request interceptors
  axiosInstance.interceptors.request.use(authInterceptor);
  
  if (includeSchoolContext) {
    axiosInstance.interceptors.request.use(schoolContextInterceptor);
  }
  
  // Response interceptors
  axiosInstance.interceptors.response.use(
    (response) => response,
    authErrorInterceptor
  );
};
