import { File } from 'expo-file-system';
import { Image as ImageCompressor } from 'react-native-compressor';

import { isManagedMediaUrl } from './storage';

// react-native-compressor's native (Nitro/Swift) implementation hard-crashes the
// whole app (SIGTRAP, uncatchable by JS try/catch) when given a uri that no
// longer points to a real file — e.g. a stale cached avatar path left over from
// a previous install. Always verify the file is actually there first, and throw
// a normal, catchable JS error instead of ever reaching the native call.
function assertLocalFileExists(uri: string) {
  // a directory-shaped or otherwise malformed uri makes the File constructor
  // itself throw (a native FunctionCallException, not a catchable "missing
  // file" case) — treat that the same as a missing file rather than let it
  // escape as an opaque native error
  let exists: boolean;
  try {
    exists = new File(uri).exists;
  } catch {
    exists = false;
  }
  if (!exists) {
    throw new Error(`local file no longer exists: ${uri}`);
  }
}

// Supabase's render/image transform endpoint is Pro-only (403 FeatureNotEnabled on
// this project), so there is no server-side resizing to fall back on: whatever we
// upload is exactly what every screen downloads. Size each upload for its largest
// real display instead of shipping one 1600px original to a 30px comment avatar.
/**
 * `compressionMethod: 'manual'` on every preset is load-bearing, not
 * boilerplate. The library defaults to 'auto', where these bounds are only
 * hints: it re-encodes, compares against the source, and if the result isn't
 * smaller it discards it and hands back *the original file untouched*. That
 * makes a 480px thumbnail silently come back as the full-size original, so
 * "full" and "thumb" end up byte-identical. Manual mode always resizes to the
 * bounds below, which is the whole point of having distinct presets.
 */
const PRESETS = {
  /** avatars — biggest on-screen use is ProfileCard's 96pt hero, so 512 covers 3x */
  avatar: { compressionMethod: 'manual', maxWidth: 512, maxHeight: 512, quality: 0.8 },
  /** post photos — full-bleed card media is ~400pt wide, so 1280 covers 3x */
  post: { compressionMethod: 'manual', maxWidth: 1280, maxHeight: 1280, quality: 0.82 },
  /**
   * Feed thumbnails. A 2x2 grid cell is ~180pt, so 480 covers it at ~3x for a
   * fraction of the bytes — the feed never has a reason to pull the full photo.
   */
  thumb: { compressionMethod: 'manual', maxWidth: 480, maxHeight: 480, quality: 0.7 },
  /** gallery polaroids render small but open larger, so keep some headroom */
  gallery: { compressionMethod: 'manual', maxWidth: 1024, maxHeight: 1024, quality: 0.8 },
} as const;

export type ImagePreset = keyof typeof PRESETS;

export async function compressImage(uri: string, preset: ImagePreset = 'post'): Promise<string> {
  assertLocalFileExists(uri);
  return ImageCompressor.compress(uri, PRESETS[preset]);
}

/**
 * Given the account/F/O's current local gallery uris and the previously-synced
 * {localUri: remoteUrl} map, uploads only the uris not already in the map
 * (compressing first) and returns the fully up-to-date map. Local uris removed
 * from the gallery are dropped from the returned map — nothing else to do,
 * since orphaned Storage objects cost nothing to leave behind for now.
 *
 */
export async function syncMediaMap(
  currentLocalUris: string[],
  previousMap: Record<string, string>,
  upload: (compressedUri: string) => Promise<string>,
  preset: ImagePreset = 'gallery',
): Promise<Record<string, string>> {
  const next: Record<string, string> = {};
  const toUpload = currentLocalUris.filter((uri) => {
    if (previousMap[uri]) {
      next[uri] = previousMap[uri];
      return false;
    }
    // already hosted where we serve from — the startup repair pass substitutes
    // one of these in place of a local path once the local copy is gone, so
    // there is nothing to compress or upload, the url itself is the synced value
    if (isManagedMediaUrl(uri)) {
      next[uri] = uri;
      return false;
    }
    return true;
  });
  // compress+upload the whole batch concurrently — sequential awaits made
  // profile/F/O sync (and posting, which reuses the same helper) feel slow
  await Promise.all(
    toUpload.map(async (uri) => {
      try {
        const compressed = await compressImage(uri, preset);
        next[uri] = await upload(compressed);
      } catch (_) {
        // one missing/broken local photo shouldn't block syncing the rest of the gallery
      }
    }),
  );
  return next;
}
