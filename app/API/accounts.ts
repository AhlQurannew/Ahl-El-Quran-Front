import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';
import { API_BASE_URL } from '@/utils/apiConfig';

const client = axios.create({
  baseURL: `${API_BASE_URL}/accounts`,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});
// School-scoped: an admin viewing a school sends its school_id like the other school APIs.
setupInterceptors(client);

/** تفعيل / تعطيل: switch an account on or off (allowed down the hierarchy only). */
const setAccountActive = async (userId: number, isActive: boolean): Promise<{ user_id: number; is_active: boolean }> =>
  (await client.patch(`/${userId}/active`, { is_active: isActive })).data;

const accountsAPI = { setAccountActive };
export default accountsAPI;
