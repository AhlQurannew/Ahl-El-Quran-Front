/**
 * @file interceptors.ts
 * @description Axios interceptors for handling authentication, admin role override, and error responses
 * 
 * This file contains three main interceptors:
 * 1. authInterceptor - Adds JWT token to all requests
 * 2. schoolContextInterceptor - Handles admin viewing school (role override)
 * 3. authErrorInterceptor - Handles 401 errors and auto-logout
 * 
 * @author Ahl El Quran Team
 * @version 1.0.0
 */

import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/utils/auth';

/**
 * Authentication Interceptor
 * 
 * Automatically adds the JWT access token to all outgoing requests.
 * Also adds ngrok-skip-browser-warning header to bypass ngrok browser warning page.
 * 
 * @param {InternalAxiosRequestConfig} config - Axios request configuration
 * @returns {InternalAxiosRequestConfig} Modified config with auth headers
 * 
 * @example
 * // This interceptor runs automatically for all axios requests
 * // It adds: Authorization: Bearer <token>
 */
export const authInterceptor = (config: InternalAxiosRequestConfig) => {
  // Get access token from Zustand store
  const token = useAuthStore.getState().accessToken;
  
  if (token) {
    // Add JWT token to Authorization header
    config.headers.Authorization = `Bearer ${token}`;
    
    // Bypass ngrok browser warning (only needed when using ngrok for backend)
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }
  
  return config;
};

/**
 * School Context Interceptor (Admin Role Override)
 * 
 * When an admin views a specific school, this interceptor:
 * 1. Reads the school ID from sessionStorage
 * 2. Adds X-Role-Override header to make admin act as CHIEF_SUPERVISOR
 * 3. Adds school_id parameter to scope all requests to that school
 * 
 * This enables admins to manage schools as if they were the school's chief supervisor.
 * 
 * @param {InternalAxiosRequestConfig} config - Axios request configuration
 * @returns {InternalAxiosRequestConfig} Modified config with role override headers
 * 
 * @example
 * // When admin clicks "View School" on a school:
 * sessionStorage.setItem('admin_viewing_school', JSON.stringify({ id: 5, name: 'School A' }));
 * 
 * // All subsequent API calls will include:
 * // Header: X-Role-Override: CHIEF_SUPERVISOR
 * // Param: school_id=5
 * 
 * // To exit admin view:
 * sessionStorage.removeItem('admin_viewing_school');
 */
export const schoolContextInterceptor = (config: InternalAxiosRequestConfig) => {
  // Only run in browser environment (not during SSR)
  if (typeof window !== 'undefined') {
    // Check if admin is currently viewing a school
    const adminViewData = sessionStorage.getItem('admin_viewing_school');
    
    if (adminViewData) {
      try {
        // Parse school data from sessionStorage
        const { id } = JSON.parse(adminViewData);
        
        // IMPORTANT: Header must be 'X-Role-Override' (capitalized)
        // Backend checks for this exact header name (case-sensitive in some implementations)
        config.headers['X-Role-Override'] = 'CHIEF_SUPERVISOR';
        
        // Add school_id as query parameter to scope all requests
        config.params = { ...config.params, school_id: id };
        
      } catch (e) {
        console.error('Error parsing admin view data:', e);
      }
    }
  }
  
  return config;
};

/**
 * Authentication Error Interceptor
 * 
 * Handles HTTP 401 (Unauthorized) responses by:
 * 1. Logging out the user
 * 2. Clearing tokens from storage
 * 3. Redirecting to login page
 * 
 * This prevents users from making requests with expired tokens.
 * 
 * @param {any} error - Axios error object
 * @returns {Promise<never>} Rejected promise with error
 * 
 * @example
 * // When a 401 error occurs:
 * // 1. User is logged out
 * // 2. Tokens are cleared from localStorage
 * // 3. User is redirected to /login?expired=true
 */
export const authErrorInterceptor = async (error: any) => {
  // Check if response status is 401 Unauthorized
  if (error.response?.status === 401) {
    // Logout user and redirect to login page
    logout(true); // true = redirect to login
  }
  
  // Re-throw error so calling code can handle it
  return Promise.reject(error);
};

/**
 * Setup Interceptors
 * 
 * Configures an Axios instance with all necessary interceptors.
 * This ensures consistent authentication, role override, and error handling
 * across all API clients.
 * 
 * @param {AxiosInstance} axiosInstance - The Axios instance to configure
 * @param {boolean} includeSchoolContext - Whether to include school context interceptor (default: true)
 * 
 * @example
 * import axios from 'axios';
 * import { setupInterceptors } from './interceptors';
 * 
 * const apiClient = axios.create({ baseURL: 'https://api.example.com' });
 * setupInterceptors(apiClient); // Adds all interceptors
 * 
 * // Or exclude school context for specific APIs:
 * setupInterceptors(apiClient, false);
 */
export const setupInterceptors = (axiosInstance: AxiosInstance, includeSchoolContext: boolean = true) => {
  // === REQUEST INTERCEPTORS (run before request is sent) ===
  
  // 1. Add authentication token to all requests
  axiosInstance.interceptors.request.use(authInterceptor);
  
  // 2. Add school context for admin role override (optional)
  if (includeSchoolContext) {
    axiosInstance.interceptors.request.use(schoolContextInterceptor);
  }
  
  // === RESPONSE INTERCEPTORS (run after response is received) ===
  
  // Handle successful responses (pass through)
  // Handle error responses (check for 401 and logout if needed)
  axiosInstance.interceptors.response.use(
    (response) => response, // Success: return response as-is
    authErrorInterceptor    // Error: handle 401 and other errors
  );
};
