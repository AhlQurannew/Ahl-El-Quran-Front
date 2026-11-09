import { t } from '@/i18n';

const THUMN_PER_HIZB = 8;

/** What remains after whole Hizb, indexed by its number of Thumn. */
const FRACTIONS = ['', 'ثمن', 'ربع', 'ربع وثمن', 'نصف', 'نصف وثمن', 'ثلاثة أرباع', 'ثلاثة أرباع وثمن'];

function hizbLabel(count: number): string {
  if (count === 1) return t('حزب');
  if (count === 2) return t('حزبان');
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 3 && lastTwoDigits <= 10) return t('{count} أحزاب', { count });
  if (lastTwoDigits >= 11) return t('{count} حزباً', { count });
  return t('{count} حزب', { count });
}

/** A number of Thumn as it is spoken, to the nearest Thumn: « 3 أحزاب ونصف وثمن ». */
export function formatThumn(value: number | null | undefined): string {
  const exact = value ?? 0;
  const thumn = Math.round(exact);
  if (thumn <= 0) return exact > 0 ? t('أقل من ثمن') : '0';
  const hizb = Math.floor(thumn / THUMN_PER_HIZB);
  const fraction = FRACTIONS[thumn % THUMN_PER_HIZB];
  if (!hizb) return t(fraction);
  if (!fraction) return hizbLabel(hizb);
  return t('{hizb} و{fraction}', { hizb: hizbLabel(hizb), fraction: t(fraction) });
}
