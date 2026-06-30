import apiClient from './client';
import { Token } from '@/types/auth';

export const authApi = {
  login: async (
    email: string,
    password: string,
    role: string
  ): Promise<Token> => {
    const response = await apiClient.post<Token>('/auth/login', {
      email,
      password,
      role,
    });
    return response.data;
  },
};