import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/utils/apiConfig';

const client = axios.create({
  baseURL: `${API_BASE_URL}/admin/backup`,
  headers: { 'ngrok-skip-browser-warning': 'true' },
});
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface RestoreResult {
  created_at: string | null;
  rows: number;
  files: number;
}

/** Download a full backup (ZIP) and save it on the computer. */
const downloadBackup = async (): Promise<void> => {
  const response = await client.get('/', { responseType: 'blob', timeout: 300000 });
  const disposition = String(response.headers['content-disposition'] ?? '');
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fallback = `ahlquran-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.zip`;
  const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallback;
  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

/** Replace ALL data with the content of a backup file. */
const restoreBackup = async (file: File): Promise<RestoreResult> => {
  const form = new FormData();
  form.append('file', file);
  return (await client.post<RestoreResult>('/restore', form, { timeout: 600000 })).data;
};

const backupAPI = { downloadBackup, restoreBackup };
export default backupAPI;
