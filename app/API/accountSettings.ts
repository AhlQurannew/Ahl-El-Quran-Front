import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';

import { API_BASE_URL as API_URL } from '@/utils/apiConfig';

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
    honorific?: 'male' | 'female' | null;
  };
  has_photo: boolean;
}

/** Profile fields returned for non-admin accounts (extra fields depend on the role). */
export interface UserAccountProfile {
  firstname: string;
  lastname: string;
  login_email: string;
  is_active: boolean;
  school_name?: string | null;
  phone_number?: string | null;
  [key: string]: unknown;
}

export interface UserAccountSettings {
  role: string;
  profile: UserAccountProfile;
  preferences: AdminAccountSettings['preferences'];
  has_photo: boolean;
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

const getUserAccountSettings = async (): Promise<UserAccountSettings> => {
  const response = await settingsClient.get<UserAccountSettings>('/settings');
  return response.data;
};

const updateProfile = async (changes: Partial<Pick<UserAccountProfile, 'firstname' | 'lastname'>>) => {
  const response = await settingsClient.patch<{ profile: UserAccountProfile }>('/settings/profile', changes);
  return response.data.profile;
};

/** Signed-in account's avatar as a blob; the blob is empty when there is none. */
const getPhoto = async (): Promise<Blob> => {
  const response = await settingsClient.get('/settings/photo', { responseType: 'blob' });
  return response.data;
};

const uploadPhoto = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  await settingsClient.post('/settings/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deletePhoto = async (): Promise<void> => {
  await settingsClient.delete('/settings/photo');
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

const updateHonorific = async (honorific: 'male' | 'female'): Promise<void> => {
  await settingsClient.patch('/settings/preferences', { honorific });
};

const accountSettingsAPI = {
  updateHonorific,
  getAccountSettings,
  getUserAccountSettings,
  updateProfile,
  getPhoto,
  uploadPhoto,
  deletePhoto,
  updateAdminContactEmail,
  changeAdminPassword,
};

export default accountSettingsAPI;
