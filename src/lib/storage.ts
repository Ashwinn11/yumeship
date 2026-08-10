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
