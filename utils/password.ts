/** Letters and digits without look-alikes (0/O, 1/l/I). */
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const DIGITS = '23456789';
const ALL = UPPER + LOWER + DIGITS;

/** The server's minimum for school accounts (teachers, supervisors, guardians, directors). */
export const MIN_ACCOUNT_PASSWORD = 8;

/** A uniform random index in [0, max) from the browser's CSPRNG (no modulo bias). */
function randomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const value = new Uint32Array(1);
  do crypto.getRandomValues(value); while (value[0] >= limit);
  return value[0] % max;
}

/** A random password with at least one capital, one small letter and one digit. */
export function generatePassword(length = 12): string {
  const chars = [UPPER, LOWER, DIGITS].map((set) => set[randomIndex(set.length)]);
  while (chars.length < length) chars.push(ALL[randomIndex(ALL.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
