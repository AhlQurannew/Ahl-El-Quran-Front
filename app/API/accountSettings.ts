import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://6d87-105-99-72-20.ngrok-free.app/api/v1";

const settingsClient = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

setupInterceptors(settingsClient, false);

export interface AdminAccountSettings {
  role: string;
  profile: {
    username: string;
    email: string | null;
    email_verified: boolean;
  };
  preferences: {
    timezone: string;
    reduce_motion: boolean;
  };
}

export interface PasswordChangeResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

const getAccountSettings = async (): Promise<AdminAccountSettings> => {
  const response = await settingsClient.get<AdminAccountSettings>('/settings');
  return response.data;
};

const updateAdminContactEmail = async (data: {
  email: string;
  current_password: string;
}) => {
  const response = await settingsClient.patch('/settings/email', data);
  return response.data as { detail: string; email: string; email_verified: boolean };
};

const changeAdminPassword = async (data: {
  current_password: string;
  new_password: string;
}): Promise<PasswordChangeResult> => {
  const response = await settingsClient.post<PasswordChangeResult>('/settings/password', data);
  return response.data;
};

const accountSettingsAPI = {
  getAccountSettings,
  updateAdminContactEmail,
  changeAdminPassword,
};

export default accountSettingsAPI;
