import { t } from '@/i18n';

/** Puts the respectful form of address before a sentence spoken to the user: « سيدي، ... » / "Sidi, ...". */
export function addressed(message: string): string {
  if (!message || /^(سيدي|Sidi)\b/.test(message)) return message;
  return t('سيدي، {message}', { message: message.charAt(0).toLocaleLowerCase() + message.slice(1) });
}
