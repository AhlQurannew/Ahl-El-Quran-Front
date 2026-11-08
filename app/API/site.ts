import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';
import { API_BASE_URL, API_ORIGIN } from '@/utils/apiConfig';

export interface LoginSlide {
  id: number;
  /** Absolute URL of the (public) slide image. */
  url: string;
  position: number;
  /** The default photo shipped with the app: removable, and restorable at any time. */
  builtin: boolean;
}

// Public reads need no token (the login page is shown before sign-in).
const publicClient = axios.create({
  baseURL: `${API_BASE_URL}/site`,
  headers: { 'ngrok-skip-browser-warning': 'true' },
});

const adminClient = axios.create({
  baseURL: `${API_BASE_URL}/site`,
  headers: { 'ngrok-skip-browser-warning': 'true' },
});
setupInterceptors(adminClient, false);

const withAbsoluteUrl = (slide: LoginSlide): LoginSlide => ({ ...slide, url: `${API_ORIGIN}${slide.url}` });

const listLoginSlides = async (): Promise<LoginSlide[]> => {
  const res = await publicClient.get<LoginSlide[]>('/login-slides');
  return res.data.map(withAbsoluteUrl);
};

const uploadLoginSlide = async (file: File): Promise<LoginSlide> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await adminClient.post<LoginSlide>('/login-slides', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return withAbsoluteUrl(res.data);
};

const reorderLoginSlides = async (ids: number[]): Promise<LoginSlide[]> => {
  const res = await adminClient.put<LoginSlide[]>('/login-slides/order', { ids });
  return res.data.map(withAbsoluteUrl);
};

const deleteLoginSlide = async (id: number): Promise<void> => {
  await adminClient.delete(`/login-slides/${id}`);
};

const restoreBuiltinSlide = async (): Promise<LoginSlide> => {
  const res = await adminClient.post<LoginSlide>('/login-slides/builtin');
  return withAbsoluteUrl(res.data);
};

const siteAPI = { listLoginSlides, uploadLoginSlide, reorderLoginSlides, deleteLoginSlide, restoreBuiltinSlide };

export default siteAPI;
