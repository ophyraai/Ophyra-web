import { supabaseAdmin } from '@/lib/supabase/server';

const BUCKET = 'diagnosis-photos';
const SUPABASE_STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

/**
 * Converts a photo URL or path to a relative storage path (without bucket prefix).
 * Handles both legacy full public URLs and new relative paths.
 */
function toRelativePath(urlOrPath: string): string {
  if (urlOrPath.startsWith('http')) {
    // Legacy: "https://<host>/storage/v1/object/public/diagnosis-photos/<uuid>/<file>"
    const afterPrefix = urlOrPath.replace(SUPABASE_STORAGE_PREFIX, '');
    // afterPrefix = "diagnosis-photos/<uuid>/<file>"
    if (afterPrefix.startsWith(`${BUCKET}/`)) {
      return afterPrefix.slice(BUCKET.length + 1);
    }
    return afterPrefix;
  }
  // New format: "diagnosis-photos/<uuid>/<file>" → "<uuid>/<file>"
  if (urlOrPath.startsWith(`${BUCKET}/`)) {
    return urlOrPath.slice(BUCKET.length + 1);
  }
  return urlOrPath;
}

/**
 * Generates short-lived signed URLs for diagnosis photos.
 * Handles both legacy public URLs and new relative paths.
 *
 * @param paths Array of photo URLs or storage paths
 * @param expiresIn Seconds until URLs expire (default: 15 minutes)
 * @returns Array of signed URLs
 */
export async function getSignedPhotoUrls(
  paths: string[],
  expiresIn = 900,
): Promise<string[]> {
  if (paths.length === 0) return [];

  const relativePaths = paths.map(toRelativePath);

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrls(relativePaths, expiresIn);

  if (error) {
    console.error('[Storage] Failed to create signed URLs:', error.message);
    return [];
  }

  return data
    .filter((item) => item.signedUrl)
    .map((item) => item.signedUrl);
}

/**
 * Converts a photo URL or path to a relative storage path.
 * Exported for use in deletion logic.
 */
export { toRelativePath };
