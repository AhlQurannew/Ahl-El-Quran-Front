export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role: 'ADMIN' | 'PRESIDENT' | 'CHIEF_SUPERVISOR' | 'SUPERVISOR' | 'TEACHER' | 'GUARDIAN' | 'STUDENT';
  is_active: boolean;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  message?: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}