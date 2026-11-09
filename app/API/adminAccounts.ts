import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/utils/apiConfig';
import type { StaffAccount, StaffAccountCreatePayload, StaffAccountUpdatePayload } from '@/app/API/inspectors';

const client = axios.create({
  baseURL: `${API_BASE_URL}/admin/admins`,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const listAdmins = async (): Promise<StaffAccount[]> => (await client.get<StaffAccount[]>('/')).data;
const createAdmin = async (payload: StaffAccountCreatePayload): Promise<StaffAccount> => (await client.post<StaffAccount>('/', payload)).data;
const updateAdmin = async (id: number, payload: StaffAccountUpdatePayload): Promise<StaffAccount> =>
  (await client.put<StaffAccount>(`/${id}`, payload)).data;
const deleteAdmin = async (id: number): Promise<void> => { await client.delete(`/${id}`); };

const adminAccountsAPI = { listAdmins, createAdmin, updateAdmin, deleteAdmin };
export default adminAccountsAPI;
