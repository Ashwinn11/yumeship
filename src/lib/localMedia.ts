import { Directory, File, Paths } from 'expo-file-system';

/**
 * Permanent home for images the user picks.
 *
 * expo-image-picker hands back a path inside `Library/Caches/ImagePicker/`,
 * which fails in two separate ways: `Caches` is reclaimable, so iOS deletes
 * from it under storage pressure; and the absolute path embeds the app
 * container uuid, which is regenerated on reinstall.
 *
 * Copying the file here fixes the first. The second is fixed once at startup by
 * repairMediaPaths() in db/init — so every store keeps doing what it already
 * does, holding a plain uri string, with no media-aware read logic anywhere.
 */

const DIR = 'media';

function mediaDir(): Directory {
  const dir = new Directory(Paths.document, DIR);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Absolute uri for a file in the media folder — `name` may be empty for the folder itself. */
export function mediaUriFor(name: string): string {
  const base = mediaDir().uri.replace(/\/?$/, '/');
  return name ? `${base}${name}` : base;
}

/**
 * Copies a picked image into permanent storage and returns a plain file uri,
 * safe both to render and to save as-is.
 *
 * Values that need no copy — remote urls, files already in the media folder,
 * empty strings — come back unchanged. A failed copy returns the original uri
 * rather than throwing: a photo that works for this session beats losing the pick.
 */
export async function persistImage(uri: string): Promise<string> {
  return copyIntoMediaDir(uri) ?? uri ?? '';
}

/**
 * Rescues a file that is readable *right now* but stored somewhere it will not
 * survive — chiefly `Library/Caches`, which iOS empties at will.
 *
 * Returns the new uri, or null when there is nothing to do: already safe, remote,
 * or the file is already gone. Synchronous so the startup repair pass can use it.
 */
export function rescueImageSync(uri: string): string | null {
  return copyIntoMediaDir(uri);
}

/** Shared core: copy into Documents/media, or null if not applicable/possible. */
function copyIntoMediaDir(uri: string): string | null {
  if (!uri || /^https?:/.test(uri) || isInMediaDir(uri)) return null;

  try {
    const src = new File(uri);
    if (!src.exists) return null;

    const ext = (uri.split('?')[0].match(/\.(jpe?g|png|heic|webp)$/i)?.[1] ?? 'jpg').toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    src.copy(new File(mediaDir(), name));
    return mediaUriFor(name);
  } catch {
    return null;
  }
}

function isInMediaDir(uri: string): boolean {
  return /\/Documents\/media\/[^/?#]+$/.test(uri);
}
