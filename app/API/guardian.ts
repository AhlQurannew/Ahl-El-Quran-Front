import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/utils/auth';
import {
  mapGuardianResponse,
  type Guardian,
  type GuardianApiResponse,
  type GuardianListApiResponse,
  type GuardianStudentOption,
  type GuardianStudentsApiResponse,
} from '@/types/guardian';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const axiosGlobal = axios.create({
  baseURL: `${API_URL}/guardians`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

axiosGlobal.interceptors.request.use((config) => {
  const directToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const token = directToken || useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (typeof window !== 'undefined') {
    const adminViewData = sessionStorage.getItem('admin_viewing_school');
    if (adminViewData) {
      try {
        const { id } = JSON.parse(adminViewData);
        config.headers['X-Role-Override'] = 'CHIEF_SUPERVISOR';
        config.params = { ...config.params, school_id: id };
      } catch (error) {
        console.error('Error parsing admin view data:', error);
      }
    }
  }

  return config;
});

axiosGlobal.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) logout(true);
    return Promise.reject(error);
  },
);

export interface GuardianProfilePayload {
  guardian_info: {
    first_name: string;
    last_name: string;
    relationship: string;
    date_of_birth: string | null;
    phone_number: string | null;
    email: string | null;
    job: string | null;
    address: string | null;
  };
  student_ids: number[];
}

export interface GuardianCreatePayload extends GuardianProfilePayload {
  account_info: {
    username: string;
    password: string;
  };
}

export interface GuardianUpdatePayload extends GuardianProfilePayload {
  account_info: {
    username: string;
    password?: string;
  };
}

function guardianListFromResponse(data: GuardianListApiResponse | GuardianApiResponse[]): GuardianApiResponse[] {
  return Array.isArray(data) ? data : data.guardians ?? [];
}

function studentListFromResponse(data: GuardianStudentsApiResponse | GuardianStudentsApiResponse['students']): GuardianStudentsApiResponse['students'] {
  return Array.isArray(data) ? data : data.students ?? [];
}

const getGuardians = async (skip = 0, limit = 100): Promise<GuardianListApiResponse> => {
  const response = await axiosGlobal.get<GuardianListApiResponse>('/', { params: { skip, limit } });
  return response.data;
};

const getAllGuardians = async (): Promise<Guardian[]> => {
  const guardians: Guardian[] = [];
  const limit = 100;
  let skip = 0;

  while (true) {
    const response = await getGuardians(skip, limit);
    const page = guardianListFromResponse(response).map(mapGuardianResponse);
    guardians.push(...page);
    skip += page.length;
    if (page.length < limit || (response.total !== undefined && skip >= response.total)) break;
  }

  return guardians;
};

const getGuardian = async (guardianId: number): Promise<Guardian> => {
  const response = await axiosGlobal.get<GuardianApiResponse>(`/${guardianId}`);
  return mapGuardianResponse(response.data);
};

const createGuardian = async (data: GuardianCreatePayload): Promise<GuardianApiResponse> => {
  const response = await axiosGlobal.post<GuardianApiResponse>('/', data);
  return response.data;
};

const updateGuardian = async (guardianId: number, data: GuardianUpdatePayload): Promise<GuardianApiResponse> => {
  const response = await axiosGlobal.put<GuardianApiResponse>(`/${guardianId}`, data);
  return response.data;
};

const deleteGuardian = async (guardianId: number): Promise<void> => {
  await axiosGlobal.delete(`/${guardianId}`);
};

const getAvailableStudents = async (skip = 0, limit = 100): Promise<GuardianStudentsApiResponse> => {
  const response = await axiosGlobal.get<GuardianStudentsApiResponse>('/available-students', {
    params: { skip, limit },
  });
  return response.data;
};

const getAllAvailableStudents = async (): Promise<GuardianStudentOption[]> => {
  const students: GuardianStudentsApiResponse['students'] = [];
  const limit = 100;
  let skip = 0;

  while (true) {
    const response = await getAvailableStudents(skip, limit);
    const page = studentListFromResponse(response);
    students.push(...page);
    skip += page.length;
    if (page.length < limit || (response.total !== undefined && skip >= response.total)) break;
  }

  return students.map((student) => ({
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    username: student.username,
  }));
};

const getMyChildren = async (skip = 0, limit = 100) => {
  const response = await axiosGlobal.get('/my-children', { params: { skip, limit } });
  return response.data;
};

const getMyChild = async (studentId: number) => {
  const response = await axiosGlobal.get(`/my-children/${studentId}`);
  return response.data;
};

const getStudentAchievements = async (
  studentId: number,
  params?: { start_date?: string; end_date?: string; page?: number; page_size?: number },
) => {
  const response = await axiosGlobal.get(`/students/${studentId}/achievements`, { params });
  return response.data;
};

const getStudentAttendance = async (
  studentId: number,
  params?: { start_date?: string; end_date?: string; page?: number; page_size?: number },
) => {
  const response = await axiosGlobal.get(`/students/${studentId}/attendance`, { params });
  return response.data;
};

const guardianAPI = {
  getGuardians,
  getAllGuardians,
  getGuardian,
  createGuardian,
  updateGuardian,
  deleteGuardian,
  getAvailableStudents,
  getAllAvailableStudents,
  getMyChildren,
  getMyChild,
  getStudentAchievements,
  getStudentAttendance,
};

export default guardianAPI;
