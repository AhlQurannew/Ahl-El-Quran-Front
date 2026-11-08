import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/utils/apiConfig';

/** An inspector (مفتش): admin-area account created and managed by the administrator. */
export interface Inspector {
  id: number;
  username: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface InspectorCreatePayload {
  username: string;
  full_name: string;
  email: string | null;
  password: string;
}

export interface InspectorUpdatePayload {
  full_name?: string;
  email?: string | null;
  is_active?: boolean;
  /** Resets the inspector's sessions */
  password?: string;
}

const client = axios.create({
  baseURL: `${API_BASE_URL}/admin/inspectors`,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const listInspectors = async (): Promise<Inspector[]> => (await client.get<Inspector[]>('/')).data;
const createInspector = async (payload: InspectorCreatePayload): Promise<Inspector> => (await client.post<Inspector>('/', payload)).data;
const updateInspector = async (id: number, payload: InspectorUpdatePayload): Promise<Inspector> =>
  (await client.put<Inspector>(`/${id}`, payload)).data;
const deleteInspector = async (id: number): Promise<void> => { await client.delete(`/${id}`); };

const inspectorsAPI = { listInspectors, createInspector, updateInspector, deleteInspector };
export default inspectorsAPI;
