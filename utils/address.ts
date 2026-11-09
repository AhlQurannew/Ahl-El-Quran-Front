import { t } from '@/i18n';
import { useAuthStore } from '@/store/authStore';

/** Puts the respectful form of address before a sentence spoken to the user: « سيدي، ... » / « سيدتي، ... ». */
export function addressed(message: string): string {
  if (!message || /^(سيدي|سيدتي|Sidi|Lalla)\b/.test(message)) return message;
  const female = useAuthStore.getState().user?.honorific === 'female';
  return t(female ? 'سيدتي، {message}' : 'سيدي، {message}', {
    message: message.charAt(0).toLocaleLowerCase() + message.slice(1),
  });
}
