import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';
import { API_BASE_URL } from '@/utils/apiConfig';

export interface SpecialityLecture {
  lecture_id: number;
  lecture_name_ar: string;
  lecture_name_en?: string | null;
  /** Weight of the circle in this speciality (used for exams later). */
  coefficient: number;
}

export interface Speciality {
  id: number;
  name: string;
  description: string | null;
  /** Common core (جذع مشترك) */
  is_common: boolean;
  lectures: SpecialityLecture[];
  student_count: number;
}

export interface SpecialityPayload {
  name: string;
  description?: string | null;
  is_common: boolean;
  lectures: { lecture_id: number; coefficient: number }[];
}

const client = axios.create({
  baseURL: `${API_BASE_URL}/specialities`,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});
// School-scoped: admins viewing a school send its school_id like the other school APIs.
setupInterceptors(client);

const listSpecialities = async (): Promise<Speciality[]> => (await client.get<Speciality[]>('/')).data;

const createSpeciality = async (payload: SpecialityPayload): Promise<Speciality> =>
  (await client.post<Speciality>('/', payload)).data;

const updateSpeciality = async (id: number, payload: SpecialityPayload): Promise<Speciality> =>
  (await client.put<Speciality>(`/${id}`, payload)).data;

const deleteSpeciality = async (id: number): Promise<void> => {
  await client.delete(`/${id}`);
};

const specialitiesAPI = { listSpecialities, createSpeciality, updateSpeciality, deleteSpeciality };

export default specialitiesAPI;
