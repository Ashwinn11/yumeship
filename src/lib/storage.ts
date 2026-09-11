import { File } from 'expo-file-system';

import { supabase } from './supabase';

/**
 * A year, expressed the way a raw PUT expects it on the wire. Every path we
 * write is unique — it carries a timestamp and a random suffix — so an
 * object at a given url never changes and can be cached forever.
 */
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

const PUBLIC_BASE: Record<string, string> = {
  avatars: 'https://avatars.myyume.app',
  'post-media': 'https://media.myyume.app',
};

/**
 * True only for a URL on one of our current R2 domains. A URL on any other
 * host isn't guaranteed to still resolve, so callers should treat it as if
 * there were no synced value at all rather than trust and propagate it.
 */
export function isManagedMediaUrl(url: string): boolean {
  return Object.values(PUBLIC_BASE).some((base) => url.startsWith(`${base}/`));
}

/**
 * Media lives in Cloudflare R2, not Supabase Storage — R2's zero egress cost
 * is what keeps a photo-heavy feed affordable at scale. Writing and deleting
 * both need R2 credentials, which (like the service-role key in
 * delete-account) can never ship in the app, so both go through the `media`
 * edge function: it signs a presigned PUT for uploads and performs deletes
 * itself. content-type/cache-control aren't part of the signature (see the
 * function), so they're set freely here on the actual PUT.
 */
export async function uploadToBucket(
  bucket: string,
  path: string,
  /** a local file uri, or (e.g. re-uploading a "use this template" clone's
   *  source image under its own post) an http(s) url to fetch bytes from —
   *  every post ends up owning an independent copy either way, so deleting
   *  one post's asset can never take down another's */
  uri: string,
  contentType: string,
): Promise<string> {
  const bytes = /^https?:\/\//.test(uri)
    ? await (await fetch(uri)).arrayBuffer()
    : await new File(uri).arrayBuffer();
  const { data, error } = await supabase.functions.invoke('media', {
    body: { action: 'sign', bucket, key: path, contentType },
  });
  if (error) throw error;
  const res = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: { 'content-type': contentType, 'cache-control': CACHE_CONTROL },
    body: bytes,
  });
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
  return PUBLIC_BASE[bucket] ? `${PUBLIC_BASE[bucket]}/${path}` : data.publicUrl;
}

/**
 * Deletes a previously-uploaded object given its public URL, so replacing a
 * photo (a new avatar, a re-saved post) doesn't leave the old copy behind
 * forever. Best-effort and silent: an orphaned file is far cheaper than
 * blocking or breaking the save that's replacing it.
 */
export async function deleteFromBucketByUrl(bucket: string, publicUrl: string): Promise<void> {
  const base = PUBLIC_BASE[bucket];
  if (!base || !publicUrl.startsWith(`${base}/`)) return;
  const key = publicUrl.slice(base.length + 1);
  if (!key) return;
  try {
    const { error } = await supabase.functions.invoke('media', {
      body: { action: 'delete', bucket, key },
    });
    if (error) throw error;
  } catch {
    // swallowed on purpose — see doc comment
  }
}
