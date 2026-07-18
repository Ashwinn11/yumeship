import { File } from 'expo-file-system';
import { Image as ImageCompressor, Video as VideoCompressor, createVideoThumbnail } from 'react-native-compressor';

// react-native-compressor's native (Nitro/Swift) implementation hard-crashes the
// whole app (SIGTRAP, uncatchable by JS try/catch) when given a uri that no
// longer points to a real file — e.g. a stale cached avatar path left over from
// a previous install. Always verify the file is actually there first, and throw
// a normal, catchable JS error instead of ever reaching the native call.
function assertLocalFileExists(uri: string) {
  if (!new File(uri).exists) {
    throw new Error(`local file no longer exists: ${uri}`);
  }
}

export async function compressImage(uri: string): Promise<string> {
  assertLocalFileExists(uri);
  return ImageCompressor.compress(uri, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
}

export async function compressVideo(uri: string): Promise<{ uri: string; thumbnailUri: string }> {
  assertLocalFileExists(uri);
  const compressedUri = await VideoCompressor.compress(uri, { compressionMethod: 'auto' });
  const thumb = await createVideoThumbnail(compressedUri, { quality: 0.8 });
  return { uri: compressedUri, thumbnailUri: thumb.path };
}

/**
 * Given the account/F/O's current local gallery uris and the previously-synced
 * {localUri: remoteUrl} map, uploads only the uris not already in the map
 * (compressing first) and returns the fully up-to-date map. Local uris removed
 * from the gallery are dropped from the returned map — nothing else to do,
 * since orphaned Storage objects cost nothing to leave behind for now.
 */
export async function syncMediaMap(
  currentLocalUris: string[],
  previousMap: Record<string, string>,
  upload: (compressedUri: string) => Promise<string>,
): Promise<Record<string, string>> {
  const next: Record<string, string> = {};
  const toUpload = currentLocalUris.filter((uri) => {
    if (previousMap[uri]) {
      next[uri] = previousMap[uri];
      return false;
    }
    return true;
  });
  // compress+upload the whole batch concurrently — sequential awaits made
  // profile/F/O sync (and posting, which reuses the same helper) feel slow
  await Promise.all(
    toUpload.map(async (uri) => {
      try {
        const compressed = await compressImage(uri);
        next[uri] = await upload(compressed);
      } catch (_) {
        // one missing/broken local photo shouldn't block syncing the rest of the gallery
      }
    }),
  );
  return next;
}
