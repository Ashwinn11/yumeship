import { Directory, File, Paths } from 'expo-file-system';

/**
 * Durable storage for images the user picks.
 *
 * expo-image-picker hands back a path inside `Library/Caches/ImagePicker/`,
 * which is wrong to keep in two separate ways:
 *
 *  1. `Caches` is reclaimable — iOS deletes from it under storage pressure.
 *  2. The absolute path embeds the app container UUID, which is regenerated on
 *     every reinstall, so yesterday's path points nowhere after a rebuild.
 *
 * Storing one of those paths therefore produces an avatar that looks fine until
 * it abruptly doesn't — and worse, fails *silently*, because the compressor and
 * the notification code both treat a missing file as "no avatar" and carry on.
 *
 * So: copy into Documents on pick, and store a container-independent reference
 * (`media://name.jpg`) that is resolved to a real uri at read time.
 */

const DIR = 'media';
const REF = 'media://';

function mediaDir(): Directory {
  const dir = new Directory(Paths.document, DIR);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** True for refs this module owns — i.e. produced by persistImage. */
export function isPersistedRef(value: string): boolean {
  return typeof value === 'string' && value.startsWith(REF);
}

/**
 * Copies a picked image into Documents and returns a **renderable** uri.
 *
 * Deliberately not the `media://` ref: callers put this straight into component
 * state and into <Image source>, and a made-up scheme renders as nothing. The
 * ref form only exists at the storage boundary — see toMediaRef.
 *
 * Anything that isn't a local file we can copy — a remote url, an already
 * persisted ref, an empty string — is returned resolved, so this is safe to
 * call on any value. If the copy fails the original uri comes back rather than
 * throwing: a photo that works for this session beats losing the pick outright.
 */
export async function persistImage(uri: string): Promise<string> {
  if (!uri || isPersistedRef(uri) || /^https?:/.test(uri)) return resolveMedia(uri);

  try {
    const src = new File(uri);
    if (!src.exists) return uri;

    const ext = (uri.split('?')[0].match(/\.(jpe?g|png|heic|webp)$/i)?.[1] ?? 'jpg').toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    src.copy(new File(mediaDir(), name));
    return resolveMedia(`${REF}${name}`);
  } catch {
    return uri;
  }
}

/**
 * Inverse of resolveMedia: collapses an absolute path inside our media folder
 * back to a container-independent ref. Everything written to the database or to
 * settings must go through this, or the absolute path — which embeds the app
 * container UUID — gets baked in and dies at the next reinstall.
 */
export function toMediaRef(value: string): string {
  if (!value || isPersistedRef(value) || /^https?:/.test(value)) return value ?? '';
  try {
    const dir = mediaDir().uri.replace(/\/?$/, '/');
    if (value.startsWith(dir)) return `${REF}${value.slice(dir.length)}`;
  } catch {
    // fall through — an unconvertible value is stored as-is
  }
  return value;
}

/** toMediaRef across the {uri, caption} gallery shape. */
export function galleryToRefs<T extends { uri: string }>(photos: T[]): T[] {
  return photos.map((p) => ({ ...p, uri: toMediaRef(p.uri) }));
}

/**
 * Turns a stored value into something renderable. Passes through remote urls and
 * legacy absolute paths unchanged, so old records keep working (they just stay
 * as fragile as they were until the photo is re-picked).
 */
export function resolveMedia(value: string): string {
  if (!isPersistedRef(value)) return value ?? '';
  try {
    return new File(mediaDir(), value.slice(REF.length)).uri;
  } catch {
    return '';
  }
}

/** Convenience for the {uri, caption} gallery shape used by profiles and F/Os. */
export async function persistGallery<T extends { uri: string }>(photos: T[]): Promise<T[]> {
  return Promise.all(photos.map(async (p) => ({ ...p, uri: await persistImage(p.uri) })));
}
