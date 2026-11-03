import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';
import { API_BASE_URL } from '@/utils/apiConfig';

export interface TeacherNote {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export type TeacherNoteChanges = Partial<Pick<TeacherNote, 'title' | 'content' | 'pinned'>>;

const notesClient = axios.create({
  baseURL: `${API_BASE_URL}/notes`,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});
// Notes are private to the signed-in teacher, so no school context is sent.
setupInterceptors(notesClient, false);

const listNotes = async (): Promise<TeacherNote[]> => (await notesClient.get<TeacherNote[]>('/')).data;

const createNote = async (note: TeacherNoteChanges = {}): Promise<TeacherNote> =>
  (await notesClient.post<TeacherNote>('/', note)).data;

const updateNote = async (id: number, changes: TeacherNoteChanges): Promise<TeacherNote> =>
  (await notesClient.patch<TeacherNote>(`/${id}`, changes)).data;

const deleteNote = async (id: number): Promise<void> => {
  await notesClient.delete(`/${id}`);
};

const notesAPI = { listNotes, createNote, updateNote, deleteNote };

export default notesAPI;
