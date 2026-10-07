import { useAuthStore } from '@/store/authStore';

export const setAuthCookies = (token: string, role?: string) => {
  if (typeof document === 'undefined') return;
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (role) {
    document.cookie = `user_role=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

export const clearAuthCookies = () => {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
  document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
};

export const logout = (expired: boolean = false) => {
  try {
    useAuthStore.getState().clearAuth();
  } catch (e) {
    console.error('Error clearing auth store:', e);
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('auth-storage');
    sessionStorage.removeItem('admin_viewing_school');

    clearAuthCookies();

    const destination = expired ? '/login?expired=true' : '/login';
    window.location.href = destination;
  }
};

export const syncAuthCookies = () => {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('access_token') || useAuthStore.getState().accessToken;
  const user = useAuthStore.getState().user;

  if (token && !document.cookie.includes('access_token=')) {
    setAuthCookies(token, user?.role);
  }
};
