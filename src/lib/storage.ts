import { File } from 'expo-file-system';

import { supabase } from './supabase';

/**
 * A year. Every path we write is unique — it carries a timestamp and a random
 * suffix — so an object at a given url never changes and can be cached forever.
 *
 * Without this supabase defaults to `cache-control: no-cache`, which tells the
 * CDN in front of storage not to keep a copy: every avatar and every photo then
 * round-trips to origin on each request (measured ~1.4s cold TTFB, ~190ms warm,
 * `cf-cache-status: MISS` every time).
 */
const IMMUTABLE_SECONDS = '31536000';

export async function uploadToBucket(
  bucket: string,
  path: string,
  localUri: string,
  contentType: string,
): Promise<string> {
  const bytes = await new File(localUri).arrayBuffer();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType, upsert: true, cacheControl: IMMUTABLE_SECONDS });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Deletes a previously-uploaded object given its public URL, so replacing a
 * photo (a new avatar, a re-saved post) doesn't leave the old copy behind
 * forever. Best-effort and silent: an orphaned file is far cheaper than
 * blocking or breaking the save that's replacing it.
 */
export async function deleteFromBucketByUrl(bucket: string, publicUrl: string): Promise<void> {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  if (!path) return;
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // swallowed on purpose — see doc comment
  }
}
