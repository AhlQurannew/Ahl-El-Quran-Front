/**
 * School whose chat room is open. The admin chat page (/dashboard/messages) sets it explicitly;
 * otherwise it is the school an admin is viewing (sessionStorage), and null for school accounts.
 */
let explicitChatSchool: number | null = null;

export const setChatSchool = (schoolId: number | null) => {
  explicitChatSchool = schoolId;
};

export const getChatSchool = (): number | null => {
  if (explicitChatSchool) return explicitChatSchool;
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem('admin_viewing_school');
    const id = stored ? Number(JSON.parse(stored).id) : NaN;
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
};
