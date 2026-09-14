import { useEffect, useState } from 'react';
import { relationshipTypeOr } from '@/constants/theme';
import { getDb, newId } from '@/db/client';
import { parseProfileFlags, parseProfileLinks, parseProfileSongs, type ProfileFlag, type ProfileLink, type ProfileSong } from '@/components/profile/cardTheme';
import type { EquippedBlinkie } from '@/constants/blinkies';
import { notifyShips } from './ships';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';

export type GalleryPhoto = { uri: string; caption: string };

export type Fo = {
  id: string;
  name: string;
  pronouns: string;
  fandom: string;
  /** free text — a preset chip's value ('romantic' etc.) or anything typed instead */
  relStatus: string;
  /** free text — a preset chip's value ('yes'/'no'/'selective'/'mirror') or anything typed instead */
  shareStatus: string;
  /** short bio shown on the card itself */
  tagline: string;
  /** longer-form writeup, shown in its own section — separate from tagline */
  about: string;
  /** free text — usually a day with no year, e.g. "March 3, 2023" */
  sinceDate: string;
  photoUri: string;
  /** face used on notifications — falls back to photoUri when empty */
  notifPhotoUri: string;
  /** profile-card presentation customization */
  pageBgColor: string;
  pageBgImage: string;
  cardBgColor: string;
  cardBgImage: string;
  /** two comma-joined hex colors, e.g. "#fce4ec,#e1bee7" — empty when unset */
  cardBgGradient: string;
  /** hero card has no fill at all, letting the page background show through */
  cardTransparent: boolean;
  textColor: string;
  /** comma-joined border-frame accents — see cardTheme.ts parseBorderFrame/buildBorderFrame */
  borderStyle: string;
  /** '' (default display font) | 'script' | 'marker' */
  nameFont: string;
  /** '' (avatar above name, centered) | 'left' (avatar beside name, Instagram-style) */
  cardLayout: string;
  /** avatar fallback tint — the F/O counterpart to Me.color, so both profile
   *  screens tint a photoless F/O the same instead of each picking a constant */
  color: string;
  /** theme songs shown two-per-row on the card */
  songs: ProfileSong[];
  /** extra photos shown in a strip on the profile card, beyond the main portrait */
  gallery: GalleryPhoto[];
  /** everything they fly under the name — identity flags, symbols, their words */
  flags: ProfileFlag[];
  /** external links shown in their own card section — socials, playlists, etc. */
  links: ProfileLink[];
  /** whether this F/O has an opt-in public profile in community — independent of
   *  shareStatus, which is a stated boundary toward doubles, not a visibility switch */
  isPublic: boolean;
  /** blinkie templates + text equipped on this F/O's own profile wall — see constants/blinkies.ts */
  blinkies: EquippedBlinkie[];
  /** local avatar uri last uploaded to the public fo_profiles row — skip re-upload when unchanged */
  avatarSyncedUri: string;
  /** {localUri: remoteUrl} map for gallery photos already uploaded to the public fo_profiles row */
  gallerySyncMap: Record<string, string>;
  createdAt: number;
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export function parseGallery(raw: unknown): GalleryPhoto[] {
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    // tolerate the earlier string[]-only shape from before captions existed
    return v
      .map((x) => (typeof x === 'string' ? { uri: x, caption: '' } : x))
      .filter((x): x is GalleryPhoto => x && typeof x.uri === 'string');
  } catch {
    return [];
  }
}

function rowToFo(row: Record<string, unknown>): Fo {
  return {
    id: row.id as string,
    name: (row.name as string) ?? '',
    pronouns: (row.pronouns as string) ?? '',
    fandom: (row.fandom as string) ?? '',
    relStatus: (row.rel_status as Fo['relStatus']) ?? 'romantic',
    shareStatus: (row.share_status as Fo['shareStatus']) ?? 'selective',
    tagline: (row.tagline as string) ?? '',
    about: (row.about as string) ?? '',
    sinceDate: (row.since_date as string) ?? '',
    photoUri: (row.photo_uri as string) ?? '',
    notifPhotoUri: (row.notif_photo_uri as string) ?? '',
    pageBgColor: (row.page_bg_color as string) ?? '',
    pageBgImage: (row.page_bg_image as string) ?? '',
    cardBgColor: (row.card_bg_color as string) ?? '',
    cardBgImage: (row.card_bg_image as string) ?? '',
    cardBgGradient: (row.card_bg_gradient as string) ?? '',
    cardTransparent: !!(row.card_transparent as number),
    textColor: (row.text_color as string) ?? '',
    borderStyle: (row.border_style as string) ?? '',
    nameFont: (row.name_font as string) ?? '',
    cardLayout: (row.card_layout as string) ?? '',
    color: (row.color as string) ?? '',
    songs: parseProfileSongs((row.songs as string) ?? ''),
    gallery: parseGallery(row.gallery),
    flags: parseProfileFlags((row.flags as string) ?? ''),
    links: parseProfileLinks((row.links as string) ?? ''),
    isPublic: !!(row.is_public as number),
    blinkies: parseEquippedBlinkies((row.blinkies as string) ?? ''),
    avatarSyncedUri: (row.avatar_synced_uri as string) ?? '',
    gallerySyncMap: parseSyncMap(row.gallery_sync_map),
    createdAt: row.created_at as number,
  };
}

function isEquippedBlinkie(v: unknown): v is EquippedBlinkie {
  return !!v && typeof v === 'object' && typeof (v as any).templateId === 'string' && typeof (v as any).text === 'string';
}

function parseEquippedBlinkies(raw: string): EquippedBlinkie[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(isEquippedBlinkie) : [];
  } catch {
    return [];
  }
}

function parseSyncMap(raw: unknown): Record<string, string> {
  if (typeof raw !== 'string' || !raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function getAllFos(): Fo[] {
  return (getDb().getAllSync('SELECT * FROM fo ORDER BY created_at DESC') as Record<string, unknown>[])
    .map(rowToFo);
}

export function getFo(id: string): Fo | undefined {
  if (!id) return undefined;
  const row = getDb().getFirstSync('SELECT * FROM fo WHERE id = ?', id) as Record<string, unknown> | null;
  return row ? rowToFo(row) : undefined;
}

export function addFo(d: {
  name: string;
  pronouns?: string;
  fandom?: string;
  relStatus?: string;
  shareStatus?: string;
  tagline?: string;
  sinceDate?: string;
  photoUri?: string;
  songs?: ProfileSong[];
  gallery?: GalleryPhoto[];
}): string {
  const id = newId();
  getDb().runSync(
    `INSERT INTO fo (id, name, pronouns, fandom, rel_status, share_status, tagline, since_date, photo_uri, songs, gallery, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    d.name,
    d.pronouns ?? '',
    d.fandom ?? '',
    d.relStatus ?? 'romantic',
    d.shareStatus ?? 'selective',
    d.tagline ?? '',
    d.sinceDate ?? '',
    d.photoUri ?? '',
    JSON.stringify(d.songs ?? []),
    JSON.stringify(d.gallery ?? []),
    Date.now(),
  );
  notify();
  return id;
}

export function updateFo(id: string, d: Partial<Omit<Fo, 'id' | 'createdAt'>>) {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (d.name !== undefined)        { fields.push('name = ?');         values.push(d.name); }
  if (d.pronouns !== undefined)    { fields.push('pronouns = ?');     values.push(d.pronouns); }
  if (d.fandom !== undefined)      { fields.push('fandom = ?');       values.push(d.fandom); }
  if (d.relStatus !== undefined)   { fields.push('rel_status = ?');   values.push(d.relStatus); }
  if (d.shareStatus !== undefined) { fields.push('share_status = ?'); values.push(d.shareStatus); }
  if (d.tagline !== undefined)     { fields.push('tagline = ?');      values.push(d.tagline); }
  if (d.about !== undefined)       { fields.push('about = ?');        values.push(d.about); }
  if (d.sinceDate !== undefined)   { fields.push('since_date = ?');   values.push(d.sinceDate); }
  if (d.photoUri !== undefined)    { fields.push('photo_uri = ?');    values.push(d.photoUri); }
  if (d.notifPhotoUri !== undefined) { fields.push('notif_photo_uri = ?'); values.push(d.notifPhotoUri); }
  if (d.pageBgColor !== undefined) { fields.push('page_bg_color = ?'); values.push(d.pageBgColor); }
  if (d.pageBgImage !== undefined) { fields.push('page_bg_image = ?'); values.push(d.pageBgImage); }
  if (d.cardBgColor !== undefined) { fields.push('card_bg_color = ?'); values.push(d.cardBgColor); }
  if (d.cardBgImage !== undefined) { fields.push('card_bg_image = ?'); values.push(d.cardBgImage); }
  if (d.cardBgGradient !== undefined) { fields.push('card_bg_gradient = ?'); values.push(d.cardBgGradient); }
  if (d.cardTransparent !== undefined) { fields.push('card_transparent = ?'); values.push(d.cardTransparent ? 1 : 0); }
  if (d.textColor !== undefined)   { fields.push('text_color = ?');   values.push(d.textColor); }
  if (d.borderStyle !== undefined) { fields.push('border_style = ?'); values.push(d.borderStyle); }
  if (d.color !== undefined)      { fields.push('color = ?');        values.push(d.color); }
  if (d.nameFont !== undefined)    { fields.push('name_font = ?');    values.push(d.nameFont); }
  if (d.cardLayout !== undefined)  { fields.push('card_layout = ?');  values.push(d.cardLayout); }
  if (d.songs !== undefined)       { fields.push('songs = ?');        values.push(JSON.stringify(d.songs)); }
  if (d.gallery !== undefined)     { fields.push('gallery = ?');      values.push(JSON.stringify(d.gallery)); }
  if (d.flags !== undefined)       { fields.push('flags = ?');        values.push(JSON.stringify(d.flags)); }
  if (d.links !== undefined)       { fields.push('links = ?');        values.push(JSON.stringify(d.links)); }
  if (d.blinkies !== undefined)    { fields.push('blinkies = ?');     values.push(JSON.stringify(d.blinkies)); }
  if (d.isPublic !== undefined)       { fields.push('is_public = ?');         values.push(d.isPublic ? 1 : 0); }
  if (d.avatarSyncedUri !== undefined) { fields.push('avatar_synced_uri = ?'); values.push(d.avatarSyncedUri); }
  if (d.gallerySyncMap !== undefined)  { fields.push('gallery_sync_map = ?');  values.push(JSON.stringify(d.gallerySyncMap)); }

  if (!fields.length) return;
  getDb().runSync(
    `UPDATE fo SET ${fields.join(', ')} WHERE id = ?`,
    ...([...values, id] as import('expo-sqlite').SQLiteBindValue[]),
  );

  // sync-on-write: ships keep denormalized copies of F/O identity fields so the
  // many existing ship read sites don't need to resolve the fo link
  const shipFields: string[] = [];
  const shipValues: unknown[] = [];
  if (d.name !== undefined)        { shipFields.push('name = ?');       shipValues.push(d.name); }
  if (d.fandom !== undefined)      { shipFields.push('fandom = ?');     shipValues.push(d.fandom); }
  // the ship's rel_type stays a closed set (it drives scenario prompts and
  // badge colors elsewhere) even though the F/O's own relStatus is now free
  // text — a custom value here just leaves the ship's copy at its last known type
  if (d.relStatus !== undefined)   { shipFields.push('rel_type = ?');   shipValues.push(relationshipTypeOr(d.relStatus)); }
  if (d.shareStatus !== undefined) { shipFields.push('share_type = ?'); shipValues.push(d.shareStatus); }
  if (shipFields.length) {
    getDb().runSync(
      `UPDATE ships SET ${shipFields.join(', ')} WHERE fo_id = ?`,
      ...([...shipValues, id] as import('expo-sqlite').SQLiteBindValue[]),
    );
    notifyShips();
  }

  notify();
}

export function deleteFo(id: string) {
  // unlink, never cascade — the ship survives with its cached identity fields frozen
  getDb().runSync(`UPDATE ships SET fo_id = '' WHERE fo_id = ?`, id);
  getDb().runSync('DELETE FROM fo WHERE id = ?', id);
  if (getGlobalSetting('user_identify_fo_id') === id) {
    saveGlobalSetting('user_identify_fo_id', '');
  }
  notify();
  notifyShips();
}

export function useFos(): Fo[] {
  const [fos, setFos] = useState<Fo[]>(() => getAllFos());
  useEffect(() => {
    const fn = () => setFos(getAllFos());
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return fos;
}

export function useFo(id: string | undefined): Fo | undefined {
  const [fo, setFo] = useState<Fo | undefined>(() => id ? getFo(id) : undefined);
  useEffect(() => {
    const fn = () => setFo(id ? getFo(id) : undefined);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [id]);
  return fo;
}
