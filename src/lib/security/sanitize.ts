/**
 * Sanitize a filename: lowercase, strip diacritics, keep only ASCII
 * alphanumeric, dots and hyphens. Caps length at 100 chars.
 */
export function sanitizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.-]/g, '_')
      .slice(0, 100) || 'image'
  );
}
