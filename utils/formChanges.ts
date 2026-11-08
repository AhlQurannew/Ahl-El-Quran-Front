/**
 * "Has the user changed anything?" for edit forms: the save button is only enabled when the form
 * differs from the record it was opened with.
 *
 * Key order is ignored, and null / undefined / '' count as the same empty value (inputs turn null
 * into '' as soon as they are touched). A picked file always counts as a change.
 */
const normalize = (value: unknown): unknown => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof File !== 'undefined' && value instanceof File) return `file:${value.name}:${value.size}:${value.lastModified}`;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalize(record[key])]));
  }
  return value;
};

export const sameValues = (a: unknown, b: unknown): boolean => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
