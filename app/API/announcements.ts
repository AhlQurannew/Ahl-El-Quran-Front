import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';
import { API_BASE_URL } from '@/utils/apiConfig';

/** School roles an announcement can be addressed to (administrators always see everything). */
export type AudienceKey = 'chief_supervisor' | 'supervisor' | 'teacher' | 'inspector';

export interface AnnouncementAttachment {
  id: number;
  filename: string;
  content_type: string;
  size: number;
}

export interface Announcement {
  id: number;
  title: string;
  body: string | null;
  audience: AudienceKey[];
  author_name: string;
  created_at: string;
  attachments: AnnouncementAttachment[];
  can_delete: boolean;
}

export interface UnreadCounts {
  announcements: number;
  messages: number;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});
// Announcements are platform-wide: no school context is sent.
setupInterceptors(client, false);

const list = async (skip = 0, limit = 20) =>
  (await client.get<{ items: Announcement[]; total: number }>('/announcements/', { params: { skip, limit } })).data;

const create = async (data: { title: string; body: string; audience: AudienceKey[]; files: File[] }) => {
  const form = new FormData();
  form.append('title', data.title);
  if (data.body) form.append('body', data.body);
  data.audience.forEach((key) => form.append('audience', key));
  data.files.forEach((file) => form.append('files', file));
  // Let the browser set the multipart boundary.
  return (await client.post<Announcement>('/announcements/', form, { headers: { 'Content-Type': undefined } })).data;
};

const remove = async (id: number) => {
  await client.delete(`/announcements/${id}`);
};

const getAttachment = async (id: number): Promise<Blob> =>
  (await client.get(`/announcements/attachments/${id}`, { responseType: 'blob' })).data;

const unread = async () => (await client.get<UnreadCounts>('/notifications/unread')).data;

const markSeen = async (kind: 'announcements' | 'messages') =>
  (await client.post<UnreadCounts>('/notifications/seen', { kind })).data;

const announcementsAPI = { list, create, remove, getAttachment, unread, markSeen };
export default announcementsAPI;
