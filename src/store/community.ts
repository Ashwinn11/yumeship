import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { compressImage, syncMediaMap } from '@/lib/mediaOptimizer';
import { deleteFromBucketByUrl, isManagedMediaUrl, uploadToBucket } from '@/lib/storage';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

import { getAllFos, getFo, parseGallery, updateFo, type Fo, type GalleryPhoto } from './fo';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';

export const MAX_IMAGES = 4;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Card presentation shared by both public profile shapes — mirrors CardTheme. */
export type CommunityCardTheme = {
  color: string;
  height: string;
  weight: string;
  pageBgColor: string;
  pageBgImage: string;
  cardBgColor: string;
  cardBgImage: string;
  cardBgGradient: string;
  cardTransparent: boolean;
  textColor: string;
  borderStyle: string;
  decoration: string;
  nameFont: string;
};

export type CommunityProfile = CommunityCardTheme & {
  id: string;
  username: string;
  name: string;
  pronouns: string;
  bio: string;
  avatarUrl: string;
  statusLabel: string;
  song: string;
  songLink: string;
  gallery: GalleryPhoto[];
  /** published F/O shown paired on this card, when "profile identify" is on */
  identifyFoId: string | null;
  followerCount: number;
  followingCount: number;
};

export type CommunityFoProfile = CommunityCardTheme & {
  id: string;
  name: string;
  pronouns: string;
  bio: string;
  avatarUrl: string;
  statusLabel: string;
  song: string;
  songLink: string;
  gallery: GalleryPhoto[];
  fandom: string;
  relStatus: Fo['relStatus'];
  shareStatus: Fo['shareStatus'];
  age: string;
  birthday: string;
};

export type PostMedia = {
  /** 'gif' skips compression end to end so the animation survives — see createPost */
  type: 'image' | 'gif';
  url: string;
  /** small variant for the feed grid — absent on posts made before thumbnails existed, and always absent for gifs (compressing one would flatten the animation, so the full file doubles as its own thumbnail) */
  thumbnailUrl?: string;
  width: number;
  height: number;
};

export type LocalPickedMedia = { type: 'image' | 'gif'; uri: string; width: number; height: number };

/** 2-4 options, single-select, changeable — null when the post has no poll. */
export type Poll = {
  options: string[];
  counts: number[];
  /** the signed-in user's chosen option index, null if they haven't voted */
  myVote: number | null;
};

export type CommunityPost = {
  id: string;
  author: CommunityProfile;
  fo: CommunityFoProfile | null;
  title: string;
  body: string;
  media: PostMedia[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
  /** 'activity' = a prompt in the vote pool; 'post' = everything else */
  kind: 'post' | 'activity';
  /** set once this activity has been featured — the day it won */
  featuredDate: string | null;
  /** null when this post has no poll attached */
  poll: Poll | null;
  /** set when this post is a response to a featured activity — null otherwise */
  activityId: string | null;
};

export type CommunityComment = {
  id: string;
  postId: string;
  author: CommunityProfile;
  parentCommentId: string | null;
  body: string;
  createdAt: string;
};

// ─── Row mappers ──────────────────────────────────────────────────────────────

function rowToCardTheme(row: Record<string, any>): CommunityCardTheme {
  return {
    color: row.color ?? '',
    height: row.height ?? '',
    weight: row.weight ?? '',
    pageBgColor: row.page_bg_color ?? '',
    pageBgImage: row.page_bg_image ?? '',
    cardBgColor: row.card_bg_color ?? '',
    cardBgImage: row.card_bg_image ?? '',
    cardBgGradient: row.card_bg_gradient ?? '',
    cardTransparent: !!row.card_transparent,
    textColor: row.text_color ?? '',
    borderStyle: row.border_style ?? '',
    decoration: row.decoration ?? '',
    nameFont: row.name_font ?? '',
  };
}

/** Remote gallery rows are already {url, caption} — reshape to the local {uri, caption}. */
function rowToGallery(raw: unknown): GalleryPhoto[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((g) => g && typeof g.url === 'string')
    .map((g) => ({ uri: g.url as string, caption: (g.caption as string) ?? '' }));
}

function rowToProfile(row: Record<string, any>): CommunityProfile {
  return {
    ...rowToCardTheme(row),
    id: row.id,
    username: row.username ?? '',
    name: row.name ?? '',
    pronouns: row.pronouns ?? '',
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url ?? '',
    statusLabel: row.status_label ?? '',
    song: row.song ?? '',
    songLink: row.song_link ?? '',
    gallery: rowToGallery(row.gallery),
    identifyFoId: row.identify_fo_id ?? null,
    followerCount: row.follower_count ?? 0,
    followingCount: row.following_count ?? 0,
  };
}

function rowToFoProfile(row: Record<string, any>): CommunityFoProfile {
  return {
    ...rowToCardTheme(row),
    id: row.id,
    name: row.name ?? '',
    pronouns: row.pronouns ?? '',
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url ?? '',
    statusLabel: row.status_label ?? '',
    song: row.song ?? '',
    songLink: row.song_link ?? '',
    gallery: rowToGallery(row.gallery),
    fandom: row.fandom ?? '',
    relStatus: (row.rel_status as Fo['relStatus']) ?? 'romantic',
    shareStatus: (row.share_status as Fo['shareStatus']) ?? 'selective',
    age: row.age ?? '',
    birthday: row.birthday ?? '',
  };
}

/** Merge a realtime count update into an existing poll — `myVote` is local-only, never carried on the wire. */
function withPollCounts(poll: Poll | null, counts: number[] | null): Poll | null {
  return poll && counts ? { ...poll, counts } : poll;
}

/** Local optimistic recompute for casting/switching a poll vote — moves the count from the old choice (if any) to the new one. */
function pollAfterVote(poll: Poll, optionIndex: number): Poll {
  const counts = [...poll.counts];
  if (poll.myVote !== null) counts[poll.myVote] = Math.max(0, (counts[poll.myVote] ?? 0) - 1);
  counts[optionIndex] = (counts[optionIndex] ?? 0) + 1;
  return { ...poll, counts, myVote: optionIndex };
}

function rowToPoll(row: Record<string, any>, myPollVote: number | undefined): Poll | null {
  if (!row.poll_options) return null;
  return {
    options: row.poll_options as string[],
    counts: (row.poll_counts ?? (row.poll_options as string[]).map(() => 0)) as number[],
    myVote: myPollVote ?? null,
  };
}

function rowToPost(
  row: Record<string, any>,
  likedPostIds: Set<string>,
  myPollVotes: Map<string, number>,
): CommunityPost {
  return {
    id: row.id,
    author: rowToProfile(row.author),
    fo: row.fo ? rowToFoProfile(row.fo) : null,
    title: row.title,
    body: row.body,
    media: (row.media ?? []) as PostMedia[],
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    likedByMe: likedPostIds.has(row.id),
    createdAt: row.created_at,
    kind: (row.kind as CommunityPost['kind']) ?? 'post',
    featuredDate: row.featured_date ?? null,
    poll: rowToPoll(row, myPollVotes.get(row.id)),
    activityId: row.activity_id ?? null,
  };
}

function rowToComment(row: Record<string, any>): CommunityComment {
  return {
    id: row.id,
    postId: row.post_id,
    author: rowToProfile(row.author),
    parentCommentId: row.parent_comment_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function parseSyncMap(raw: string): Record<string, string> {
  try {
    const v = JSON.parse(raw || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

/** Everything a full profile card needs to render as its owner styled it. */
const CARD_THEME_FIELDS =
  'height, weight, page_bg_color, page_bg_image, card_bg_color, card_bg_image, ' +
  'card_bg_gradient, card_transparent, text_color, border_style, decoration, name_font';
/**
 * PostgREST silently ignores a `select` that starts with whitespace and returns
 * *every* column instead — so a readable multi-line list quietly turns into
 * `select=*`. Collapse to one line before the value ever leaves here.
 */
const cols = (s: string) => s.replace(/\s+/g, ' ').trim();

const PROFILE_FIELDS = cols(`
  id, username, name, pronouns, bio, avatar_url, status_label, song, song_link, gallery,
  color, identify_fo_id, follower_count, following_count, ${CARD_THEME_FIELDS}
`);
const FO_PROFILE_FIELDS = cols(`
  id, name, pronouns, bio, avatar_url, status_label, song, song_link, gallery,
  fandom, rel_status, share_status, age, birthday, ${CARD_THEME_FIELDS}
`);

// Feed rows only ever draw an avatar + name, so post embeds stay on this narrow
// set — pulling every author's gallery and theme per post would balloon the feed
// payload for data no card in the list renders. rowToProfile tolerates the gaps.
const PROFILE_SUMMARY_FIELDS = 'id, username, name, pronouns, avatar_url';
const FO_SUMMARY_FIELDS = 'id, name, pronouns, avatar_url';
// The F/O preview row on a profile shows a real card (bio, pronouns, flag), not
// just an avatar+name chip — a richer, standalone select so post embeds above
// stay on the narrow field set.
const FO_ROW_FIELDS = 'id, name, pronouns, avatar_url, bio, status_label';
const POST_SELECT = cols(`
  id, author_id, fo_profile_id, title, body, media, like_count, comment_count, created_at,
  kind, featured_date, poll_options, poll_counts, activity_id,
  author:profiles!posts_author_id_fkey(${PROFILE_SUMMARY_FIELDS}),
  fo:fo_profiles!posts_fo_profile_id_fkey(${FO_SUMMARY_FIELDS})
`);
const COMMENT_SELECT = cols(`
  id, post_id, parent_comment_id, body, created_at,
  author:profiles!comments_author_id_fkey(${PROFILE_SUMMARY_FIELDS})
`);

/**
 * What a profile push could not carry across.
 *
 * These used to be swallowed by a bare `catch (_) {}`, so a profile whose photo
 * failed to upload saved "successfully" with no avatar and no complaint — which
 * is how a broken image path went unnoticed for months. Failures that shouldn't
 * block the rest of the save are reported here instead of discarded.
 */
export type PushResult = {
  /** a local photo existed but could not be read, so the server has none */
  photoFailed: boolean;
};

/** Consistent, greppable logging for sync paths that have no UI of their own. */
export function logSyncFailure(context: string) {
  return (e: unknown) => {
    console.warn(`[sync] ${context} failed:`, e instanceof Error ? e.message : e);
  };
}

// ─── Identity / profile sync ──────────────────────────────────────────────────

export async function checkUsernameAvailable(username: string): Promise<{ ok: boolean; reason?: string }> {
  const clean = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
    return {
      ok: false,
      reason: '3–20 characters: lowercase letters, numbers, underscores only',
    };
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  const { data: existing } = await supabase.from('profiles').select('id').eq('username', clean).maybeSingle();
  if (existing && existing.id !== user?.id) {
    return { ok: false, reason: 'that username is taken' };
  }
  return { ok: true };
}

export async function claimUsername(username: string): Promise<{ ok: boolean; reason?: string }> {
  const check = await checkUsernameAvailable(username);
  if (!check.ok) return check;

  const clean = username.trim().toLowerCase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return { ok: false, reason: 'not signed in' };

  const { error } = await supabase.from('profiles').upsert({ id: user.id, username: clean });
  if (error) return { ok: false, reason: error.message };
  saveGlobalSetting('user_username', clean);
  // records *whose* username this is — see cachedUsernameFor in community.tsx
  saveGlobalSetting('user_username_uid', user.id);
  return { ok: true };
}

/**
 * Shared by pushOwnProfile/pushFoProfile — both need the same "already a
 * remote url / diff against last-synced marker / fall back to the existing
 * remote avatar / feed the avatar into the gallery map" logic, just against
 * different tables, ids and storage paths. Kept in this file (not
 * mediaOptimizer.ts) since it's specific to those two callers' patch/table/
 * bucket conventions, not a generic media utility.
 */
async function syncAvatarAndGallery(input: {
  table: 'profiles' | 'fo_profiles';
  entityId: string;
  avatarUri: string;
  avatarSyncedMarker: string;
  galleryUris: string[];
  previousGalleryMap: Record<string, string>;
  avatarPath: string;
  galleryPathPrefix: string;
  logContext: string;
}): Promise<{
  /** undefined = leave patch.avatar_url unset (unchanged); '' = explicitly cleared */
  avatarUrl: string | undefined;
  uploadedAvatarFor: string;
  photoFailed: boolean;
  galleryMap: Record<string, string>;
  /** urls nothing in the new state points at anymore — the caller should only
   * actually delete these once its own upsert of that new state has landed.
   * Deleting them here, before the save is confirmed, would turn a still-live
   * reference into a broken one if that save then failed. */
  orphanedUrls: string[];
}> {
  const { table, entityId, avatarUri, avatarSyncedMarker, galleryUris, previousGalleryMap, avatarPath, galleryPathPrefix, logContext } = input;

  // The local "already uploaded this file" marker can't be trusted on its own:
  // the remote row may have lost its avatar since (an unpublish, or an upsert
  // that failed after the marker was written). Re-upload whenever it has none.
  const { data: existingRow } = await supabase.from(table).select('avatar_url').eq('id', entityId).maybeSingle();

  let avatarUrl: string | undefined;
  let uploadedAvatarFor = '';
  let photoFailed = false;

  if (avatarUri && isManagedMediaUrl(avatarUri)) {
    // already hosted where we serve from — the local file was lost and the
    // startup repair pass substituted the published copy already sitting on
    // the server, so there is nothing to compress or upload, just keep it
    avatarUrl = avatarUri;
  } else if (avatarUri && (avatarUri !== avatarSyncedMarker || !existingRow?.avatar_url)) {
    try {
      const compressed = await compressImage(avatarUri, 'avatar');
      avatarUrl = await uploadToBucket('avatars', avatarPath, compressed, 'image/jpeg');
      uploadedAvatarFor = avatarUri;
      // the old copy's cleanup isn't handled here — see the orphan sweep below,
      // which catches this the same way it catches a cleared avatar or a
      // removed gallery photo, instead of a one-off case just for replacement
    } catch (e) {
      // the rest of the profile still saves, but the caller is told the photo did not
      photoFailed = true;
      logSyncFailure(logContext)(e);
    }
  } else if (!avatarUri) {
    avatarUrl = '';
  }

  // gallery and the two background images ride the same {localUri: remoteUrl}
  // map, so a background picked once is never re-uploaded on later saves
  const galleryMap = await syncMediaMap(
    galleryUris,
    previousGalleryMap,
    (compressedUri) =>
      uploadToBucket(
        'avatars',
        `${galleryPathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
        compressedUri,
        'image/jpeg',
      ),
  );
  // A uri missing from the returned map never made it up — syncMediaMap skips
  // whatever it can't compress or upload so one bad photo doesn't sink the
  // rest. That's the same thing photoFailed already means for the avatar, so
  // report it the same way instead of letting a gallery photo quietly never
  // appear on the public profile.
  const galleryFailed = galleryUris.some((uri) => !galleryMap[uri]);

  // The avatar rides the same {localUri: remoteUrl} map as the gallery and
  // backgrounds, rather than a dedicated column — Part B of the media-durability
  // work: if this exact local file later goes missing (evicted cache, a wipe
  // mid-flight), the startup repair pass can fall back to the copy already on
  // the server instead of leaving the profile faceless. Prefer the URL just
  // uploaded; if this save didn't re-upload, the existing row's URL is that copy.
  const avatarRemoteUrl = avatarUrl || existingRow?.avatar_url || '';
  if (avatarUri && avatarRemoteUrl) galleryMap[avatarUri] = avatarRemoteUrl;

  // Anything uploaded before that nothing points at anymore — a cleared
  // avatar, a removed gallery photo, a swapped background, a replaced avatar
  // — has no reason to keep costing storage. One check here covers every
  // "this got removed" case instead of a separate cleanup call at each site
  // that could remove something, which is exactly the kind of duplication
  // that's easy to add once and then forget to repeat next time. Actually
  // deleting is left to the caller — see the field's doc comment.
  const stillReferenced = new Set(Object.values(galleryMap));
  const orphanedUrls = Object.values(previousGalleryMap).filter((url) => url && !stillReferenced.has(url));

  return { avatarUrl, uploadedAvatarFor, photoFailed: photoFailed || galleryFailed, galleryMap, orphanedUrls };
}

export async function pushOwnProfile(): Promise<PushResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return { photoFailed: false };

  const patch: Record<string, unknown> = {
    id: user.id,
    name: getGlobalSetting('user_name'),
    pronouns: getGlobalSetting('user_pronouns', 'she/her'),
    bio: getGlobalSetting('user_bio'),
    song: getGlobalSetting('user_song'),
    song_link: getGlobalSetting('user_song_link'),
    status_label: getGlobalSetting('user_status_label'),
    height: getGlobalSetting('user_height'),
    weight: getGlobalSetting('user_weight'),
    color: getGlobalSetting('user_color'),
    page_bg_color: getGlobalSetting('user_page_bg_color'),
    card_bg_color: getGlobalSetting('user_card_bg_color'),
    card_bg_gradient: getGlobalSetting('user_card_bg_gradient'),
    card_transparent: getGlobalSetting('user_card_transparent') === '1',
    text_color: getGlobalSetting('user_text_color'),
    border_style: getGlobalSetting('user_border_style'),
    decoration: getGlobalSetting('user_decoration'),
    name_font: getGlobalSetting('user_name_font'),
  };

  // identify_fo_id is a real FK, so confirm the row is actually there rather than
  // trusting the local isPublic flag — the two can disagree (publish still in
  // flight, or an unpublish that raced this save) and a bad id fails the upsert
  const identifyFoId = getGlobalSetting('user_identify_fo_id');
  if (identifyFoId) {
    const { data: foRow } = await supabase
      .from('fo_profiles')
      .select('id')
      .eq('id', identifyFoId)
      .maybeSingle();
    patch.identify_fo_id = foRow?.id ?? null;
  } else {
    patch.identify_fo_id = null;
  }

  const localGallery = parseGallery(getGlobalSetting('user_gallery'));
  const cardBgImage = getGlobalSetting('user_card_bg_image');
  const pageBgImage = getGlobalSetting('user_page_bg_image');

  const sync = await syncAvatarAndGallery({
    table: 'profiles',
    entityId: user.id,
    avatarUri: getGlobalSetting('user_avatar'),
    avatarSyncedMarker: getGlobalSetting('user_avatar_synced_uri'),
    galleryUris: [...localGallery.map((p) => p.uri), cardBgImage, pageBgImage].filter(Boolean),
    previousGalleryMap: parseSyncMap(getGlobalSetting('user_gallery_sync_map')),
    avatarPath: `${user.id}/${Date.now()}.jpg`,
    galleryPathPrefix: `${user.id}/gallery`,
    logContext: 'pushOwnProfile avatar upload',
  });

  if (sync.avatarUrl !== undefined) patch.avatar_url = sync.avatarUrl;
  saveGlobalSetting('user_gallery_sync_map', JSON.stringify(sync.galleryMap));
  patch.gallery = localGallery.map((p) => ({ url: sync.galleryMap[p.uri], caption: p.caption })).filter((g) => g.url);
  patch.card_bg_image = (cardBgImage && sync.galleryMap[cardBgImage]) || '';
  patch.page_bg_image = (pageBgImage && sync.galleryMap[pageBgImage]) || '';

  const { error } = await supabase.from('profiles').upsert(patch);
  if (error) throw error;
  // only remember the upload once the row that references it actually landed
  if (sync.uploadedAvatarFor) saveGlobalSetting('user_avatar_synced_uri', sync.uploadedAvatarFor);
  // only now that the new state is durably saved — deleting any earlier would
  // risk breaking a still-live reference had this upsert failed instead
  for (const url of sync.orphanedUrls) deleteFromBucketByUrl('avatars', url);
  return { photoFailed: sync.photoFailed };
}

export async function fetchProfile(id: string): Promise<CommunityProfile | null> {
  const { data, error } = await supabase.from('profiles').select(PROFILE_FIELDS).eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data);
}

// ─── F/O public profile ───────────────────────────────────────────────────────

export async function pushFoProfile(foId: string): Promise<PushResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('not signed in');
  const fo = getFo(foId);
  if (!fo) throw new Error('f/o not found');
  if (fo.shareStatus === 'no') throw new Error("this f/o's sharing status is set to no — change it first");

  const patch: Record<string, unknown> = {
    id: fo.id,
    owner_id: user.id,
    name: fo.name,
    pronouns: fo.pronouns,
    bio: fo.bio,
    song: fo.song,
    song_link: fo.songLink,
    status_label: fo.statusLabel,
    height: fo.height,
    weight: fo.weight,
    age: fo.age,
    birthday: fo.birthday,
    fandom: fo.fandom,
    rel_status: fo.relStatus,
    share_status: fo.shareStatus,
    page_bg_color: fo.pageBgColor,
    card_bg_color: fo.cardBgColor,
    card_bg_gradient: fo.cardBgGradient,
    card_transparent: fo.cardTransparent,
    text_color: fo.textColor,
    border_style: fo.borderStyle,
    decoration: fo.decoration,
    name_font: fo.nameFont,
  };

  // See pushOwnProfile: unpublishing deletes the row outright, so a re-publish
  // would otherwise trust a stale avatarSyncedUri and leave the F/O faceless.
  const sync = await syncAvatarAndGallery({
    table: 'fo_profiles',
    entityId: fo.id,
    avatarUri: fo.photoUri,
    avatarSyncedMarker: fo.avatarSyncedUri,
    galleryUris: [...fo.gallery.map((p) => p.uri), fo.cardBgImage, fo.pageBgImage].filter(Boolean),
    previousGalleryMap: fo.gallerySyncMap,
    avatarPath: `${user.id}/fo/${fo.id}/${Date.now()}.jpg`,
    galleryPathPrefix: `${user.id}/fo/${fo.id}/gallery`,
    logContext: 'pushFoProfile avatar upload',
  });

  if (sync.avatarUrl !== undefined) patch.avatar_url = sync.avatarUrl;
  patch.gallery = fo.gallery.map((p) => ({ url: sync.galleryMap[p.uri], caption: p.caption })).filter((g) => g.url);
  patch.card_bg_image = (fo.cardBgImage && sync.galleryMap[fo.cardBgImage]) || '';
  patch.page_bg_image = (fo.pageBgImage && sync.galleryMap[fo.pageBgImage]) || '';

  const { error } = await supabase.from('fo_profiles').upsert(patch);
  if (error) throw error;

  updateFo(fo.id, {
    gallerySyncMap: sync.galleryMap,
    isPublic: true,
    // committed only now that the row referencing the upload exists
    ...(sync.uploadedAvatarFor ? { avatarSyncedUri: sync.uploadedAvatarFor } : null),
  });
  // only now that the new state is durably saved — deleting any earlier would
  // risk breaking a still-live reference had this upsert failed instead
  for (const url of sync.orphanedUrls) deleteFromBucketByUrl('avatars', url);
  return { photoFailed: sync.photoFailed };
}

export async function unpublishFoProfile(foId: string): Promise<void> {
  // fetched before the row goes away — it's the only place these urls live
  const { data: existing } = await supabase
    .from('fo_profiles')
    .select('avatar_url, gallery, card_bg_image, page_bg_image')
    .eq('id', foId)
    .maybeSingle();

  const { error } = await supabase.from('fo_profiles').delete().eq('id', foId);
  if (error) throw error;
  // only flip local state once the remote row is actually gone — otherwise a
  // failed delete leaves the app believing a still-public profile is private
  // the row is gone, so every uploaded-already marker is now a lie — clearing
  // them makes the next publish re-upload the avatar and gallery from scratch
  updateFo(foId, { isPublic: false, avatarSyncedUri: '', gallerySyncMap: {} });

  // best-effort, after the delete the caller asked for has already landed —
  // a missed cleanup here leaves orphaned files, not a broken unpublish
  if (existing?.avatar_url) deleteFromBucketByUrl('avatars', existing.avatar_url);
  if (existing?.card_bg_image) deleteFromBucketByUrl('avatars', existing.card_bg_image);
  if (existing?.page_bg_image) deleteFromBucketByUrl('avatars', existing.page_bg_image);
  for (const g of (existing?.gallery ?? []) as { url?: string }[]) {
    if (g.url) deleteFromBucketByUrl('avatars', g.url);
  }
}

export async function fetchFoProfile(id: string): Promise<CommunityFoProfile | null> {
  const { data, error } = await supabase.from('fo_profiles').select(FO_PROFILE_FIELDS).eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToFoProfile(data);
}

export type CommunityFoSummary = {
  id: string;
  name: string;
  avatarUrl: string;
  pronouns: string;
  bio: string;
  statusLabel: string;
};

function rowToFoSummary(row: Record<string, any>): CommunityFoSummary {
  return {
    id: row.id,
    name: row.name ?? '',
    avatarUrl: row.avatar_url ?? '',
    pronouns: row.pronouns ?? '',
    bio: row.bio ?? '',
    statusLabel: row.status_label ?? '',
  };
}

/**
 * A user's public F/Os, for the horizontal row on their profile. Unpublishing
 * deletes the fo_profiles row outright, so "owned by this user" already means
 * "public" — no is_public filter needed, row existence is the privacy model.
 */
export async function fetchUserFoProfiles(ownerId: string): Promise<CommunityFoSummary[]> {
  const { data, error } = await supabase
    .from('fo_profiles')
    .select(FO_ROW_FIELDS)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map(rowToFoSummary);
}

/**
 * "Profile identify" doubles as the community publish switch: whoever is picked
 * there goes public the moment the user is signed in, and comes back down if
 * unpaired. Called both right after the toggle/picker changes and on sign-in,
 * since either order (pair-then-sign-in or sign-in-then-pair) must end up published.
 */
export async function syncIdentifyFoPublish(foId: string): Promise<PushResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const nothingToDo = { photoFailed: false };
  if (!session?.user) return nothingToDo;

  const fo = getFo(foId);
  if (!fo) return nothingToDo;
  if (fo.isPublic) return nothingToDo;
  return pushFoProfile(foId);
}

/**
 * Deletes the account for good.
 *
 * The auth record is the thing that has to go — everything else follows from it,
 * since public.profiles cascades from auth.users and posts, comments, likes,
 * follows, blocks and published F/O profiles all cascade from profiles.
 *
 * That delete needs the service role, which cannot ship in a mobile binary: the
 * key is extractable from any app bundle and bypasses RLS entirely. So it lives
 * in the `delete-account` edge function, which identifies the caller from their
 * own JWT and can therefore only ever delete them.
 *
 * Local F/Os and ships are deliberately untouched — they were never community
 * data and live on the device. The claimed username is released with the row.
 */
export async function deleteCommunityAccount(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return;

  const { data, error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) {
    // a non-2xx response only ever surfaces as this generic wrapper — the
    // function's own {error: "..."} body (e.g. "not signed in") is on
    // error.context and has to be read separately, or every failure looks
    // like the same unhelpful "non-2xx status code" message to the user
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      throw new Error(body?.error || error.message);
    }
    throw error;
  }
  if (data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }

  saveGlobalSetting('user_username', '');
  saveGlobalSetting('user_username_uid', '');
  saveGlobalSetting('user_avatar_synced_uri', '');
  saveGlobalSetting('user_gallery_sync_map', '{}');
  saveGlobalSetting('user_identify_fo_id', '');
  // the cascade already unpublished every F/O; the local flags must agree
  for (const fo of getAllFos()) {
    if (fo.isPublic) updateFo(fo.id, { isPublic: false, avatarSyncedUri: '', gallerySyncMap: {} });
  }
}

// ─── Feed / posts ─────────────────────────────────────────────────────────────

async function fetchLikedPostIds(postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return new Set();
  const { data } = await supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds);
  return new Set((data ?? []).map((r: any) => r.post_id));
}

async function fetchMyPollVotes(postIds: string[]): Promise<Map<string, number>> {
  if (postIds.length === 0) return new Map();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return new Map();
  const { data } = await supabase
    .from('poll_votes')
    .select('post_id, option_index')
    .eq('user_id', user.id)
    .in('post_id', postIds);
  return new Map((data ?? []).map((r: any) => [r.post_id, r.option_index as number]));
}

export async function fetchFeedPage(opts: {
  mode: 'global' | 'following';
  before?: string;
  limit?: number;
}): Promise<CommunityPost[]> {
  const limit = opts.limit ?? 20;
  // activity prompts live in their own pool (fetchActivityPool), and responses
  // to a featured activity live only on that activity's own page — neither
  // belongs in the feed
  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('kind', 'post')
    .is('activity_id', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (opts.before) query = query.lt('created_at', opts.before);

  if (opts.mode === 'following') {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return [];
    const { data: followingRows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
    const ids = (followingRows ?? []).map((r: any) => r.following_id);
    if (ids.length === 0) return [];
    query = query.in('author_id', ids);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  const ids = data.map((r: any) => r.id);
  const [likedIds, myPollVotes] = await Promise.all([
    fetchLikedPostIds(ids),
    fetchMyPollVotes(ids),
  ]);
  return data.map((r: any) => rowToPost(r, likedIds, myPollVotes));
}

export type PostPageOpts = { before?: string; limit?: number };

/** One owning column's posts — same page shape and cursor as the feed. */
async function fetchPostsBy(
  column: 'author_id' | 'fo_profile_id',
  value: string,
  opts: PostPageOpts,
): Promise<CommunityPost[]> {
  const limit = opts.limit ?? 20;
  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .eq(column, value)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (opts.before) query = query.lt('created_at', opts.before);

  const { data, error } = await query;
  if (error || !data) return [];
  const ids = data.map((r: any) => r.id);
  const [likedIds, myPollVotes] = await Promise.all([
    fetchLikedPostIds(ids),
    fetchMyPollVotes(ids),
  ]);
  return data.map((r: any) => rowToPost(r, likedIds, myPollVotes));
}

export function fetchUserPosts(authorId: string, opts: PostPageOpts = {}): Promise<CommunityPost[]> {
  return fetchPostsBy('author_id', authorId, opts);
}

/**
 * Every post tagged to one F/O. Always authored by that F/O's owner — the
 * composer tags whichever F/O the poster paired in "profile identify", so
 * there's no way to tag someone else's.
 */
export function fetchFoPosts(foProfileId: string, opts: PostPageOpts = {}): Promise<CommunityPost[]> {
  return fetchPostsBy('fo_profile_id', foProfileId, opts);
}

/**
 * The submission pool: the top 30 unfeatured activity prompts, most liked
 * first — a submission stays eligible indefinitely, however long ago it was
 * posted, until it either wins or someone bumps it off the top 30. No cursor
 * pagination — like-count ordering doesn't map cleanly to a `before` cursor,
 * and only the top slice is ever shown anyway.
 */
export async function fetchActivityPool(limit = 30): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('kind', 'activity')
    .is('featured_date', null)
    .order('like_count', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  const ids = data.map((r: any) => r.id);
  const [likedIds, myPollVotes] = await Promise.all([
    fetchLikedPostIds(ids),
    fetchMyPollVotes(ids),
  ]);
  return data.map((r: any) => rowToPost(r, likedIds, myPollVotes));
}

/**
 * Full posts made in response to one activity, newest first. No cursor
 * pagination — bounded to a single activity's single day, same reasoning as
 * fetchActivityPool.
 */
export async function fetchActivityResponses(activityId: string, limit = 150): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('activity_id', activityId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  const ids = data.map((r: any) => r.id);
  const [likedIds, myPollVotes] = await Promise.all([
    fetchLikedPostIds(ids),
    fetchMyPollVotes(ids),
  ]);
  return data.map((r: any) => rowToPost(r, likedIds, myPollVotes));
}

/**
 * Today's featured activity — the single daily winner. `pick_todays_activity`
 * is idempotent (picks once, then just returns the same row for the rest of
 * the day), so every client can safely call this on launch with no cron: the
 * first opener of the day does the pick, everyone after just reads it.
 *
 * The RPC returns bare `posts` columns with none of PostgREST's joined
 * author/fo embeds, so it only gives us the winning id — the actual
 * render-ready post comes from the normal fully-joined fetch, same as how a
 * realtime insert resolves its row in subscribeFeed below.
 */
export async function fetchTodaysActivity(): Promise<CommunityPost | null> {
  const { data, error } = await supabase.rpc('pick_todays_activity');
  if (error || !data || data.length === 0) return null;
  return fetchPost(data[0].id);
}

export async function fetchPost(id: string): Promise<CommunityPost | null> {
  const { data, error } = await supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle();
  if (error || !data) return null;
  const [likedIds, myPollVotes] = await Promise.all([
    fetchLikedPostIds([id]),
    fetchMyPollVotes([id]),
  ]);
  return rowToPost(data, likedIds, myPollVotes);
}

/** Vote (or switch your vote) on a poll — no un-voting once cast, same as Twitter/IG. */
export async function votePoll(postId: string, optionIndex: number): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('not signed in');

  const { error } = await supabase
    .from('poll_votes')
    .upsert({ post_id: postId, user_id: user.id, option_index: optionIndex }, { onConflict: 'post_id,user_id' });
  if (error) throw error;
}

export async function createPost(input: {
  /** optional — posts are body/media-first, a title is just an extra flourish */
  title?: string;
  body: string;
  media: LocalPickedMedia[];
  foProfileId?: string;
  /** defaults to 'post' — pass 'activity' to submit a prompt to the vote pool */
  kind?: 'post' | 'activity';
  /** 2-4 option labels — mutually exclusive with media, same as Twitter/IG */
  poll?: string[];
  /** set to post as a response to a featured activity, kept off the main feed */
  activityId?: string;
}): Promise<CommunityPost> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('not signed in');

  const batchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // the images (up to 4) all upload concurrently
  const media: PostMedia[] = await Promise.all(
    input.media.map(async (item, i) => {
      if (item.type === 'gif') {
        // uploaded as-is, no compression pass — react-native-compressor
        // re-encodes to a static frame, which would defeat the entire point
        const url = await uploadToBucket('post-media', `${user.id}/${batchId}/${i}.gif`, item.uri, 'image/gif');
        return { type: 'gif' as const, url, width: item.width, height: item.height };
      }
      // full + thumb are compressed and uploaded side by side so the feed
      // can stay on the small one and only the detail view pays for the full
      const [full, thumb] = await Promise.all([
        compressImage(item.uri, 'post'),
        compressImage(item.uri, 'thumb'),
      ]);
      const [url, thumbnailUrl] = await Promise.all([
        uploadToBucket('post-media', `${user.id}/${batchId}/${i}.jpg`, full, 'image/jpeg'),
        uploadToBucket('post-media', `${user.id}/${batchId}/${i}-thumb.jpg`, thumb, 'image/jpeg'),
      ]);
      return {
        type: 'image' as const,
        url,
        thumbnailUrl,
        width: item.width,
        height: item.height,
      };
    }),
  );

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      fo_profile_id: input.foProfileId ?? null,
      title: (input.title ?? '').trim(),
      body: input.body.trim(),
      media,
      kind: input.kind ?? 'post',
      poll_options: input.poll ?? null,
      poll_counts: input.poll ? input.poll.map(() => 0) : null,
      activity_id: input.activityId ?? null,
    })
    .select(POST_SELECT)
    .single();
  if (error) {
    // the images already landed in R2 with no row ever created to reference
    // them — without this they'd sit there permanently, unused from the start
    for (const m of media) {
      deleteFromBucketByUrl('post-media', m.url);
      if (m.thumbnailUrl) deleteFromBucketByUrl('post-media', m.thumbnailUrl);
    }
    throw error;
  }
  return rowToPost(data, new Set(), new Map());
}

export async function deletePost(id: string): Promise<void> {
  // fetched before the row goes away — it's the only place the media urls live
  const { data: existing } = await supabase.from('posts').select('media').eq('id', id).maybeSingle();

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;

  // best-effort, after the delete the caller asked for has already landed —
  // a missed cleanup here leaves an orphaned file, not a broken delete
  const media = (existing?.media ?? []) as PostMedia[];
  for (const m of media) {
    if (m.url) deleteFromBucketByUrl('post-media', m.url);
    if (m.thumbnailUrl) deleteFromBucketByUrl('post-media', m.thumbnailUrl);
  }
}

export async function toggleLike(postId: string, currentlyLiked: boolean): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;
  if (currentlyLiked) {
    const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
    if (error) throw error;
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function fetchComments(postId: string): Promise<CommunityComment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map(rowToComment);
}

export async function addComment(postId: string, body: string, parentCommentId?: string): Promise<CommunityComment> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('not signed in');
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      parent_comment_id: parentCommentId ?? null,
      body: body.trim(),
    })
    .select(COMMENT_SELECT)
    .single();
  if (error) throw error;
  return rowToComment(data);
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
}

// ─── Social graph ─────────────────────────────────────────────────────────────

export async function followUser(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;
  const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: id });
  if (error) throw error;
}

export async function unfollowUser(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;
  const { error } = await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id);
  if (error) throw error;
}

export async function fetchRelationship(id: string): Promise<{ following: boolean; blocked: boolean }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return { following: false, blocked: false };
  const [{ data: f }, { data: b }] = await Promise.all([
    supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', id).maybeSingle(),
    supabase.from('blocks').select('blocker_id').eq('blocker_id', user.id).eq('blocked_id', id).maybeSingle(),
  ]);
  return { following: !!f, blocked: !!b };
}

export async function blockUser(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;
  const { error } = await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: id });
  if (error) throw error;
}

export async function unblockUser(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;
  const { error } = await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', id);
  if (error) throw error;
}

export async function fetchBlockedUsers(): Promise<CommunityProfile[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from('blocks')
    .select(`blocked:profiles!blocks_blocked_id_fkey(${PROFILE_SUMMARY_FIELDS})`)
    .eq('blocker_id', user.id);
  if (error || !data) return [];
  return data.map((r: any) => rowToProfile(r.blocked));
}

/**
 * Blocks in real time.
 *
 * Only the blocker's own rows: the SELECT policy on `blocks` is `blocker_id =
 * auth.uid()`, so the blocked party cannot read the row at all — and that is
 * deliberate, not an oversight. Being told "X blocked you" escalates exactly
 * the situation blocking exists to defuse. Their feed simply stops including
 * the other person on its next fetch, which RLS already enforces.
 *
 * What this buys is consistency across the blocker's own devices, and an
 * immediate effect on the list already rendered.
 */
let channelSeq = 0;
/**
 * `supabase.channel(topic)` returns the *same* object for a repeated topic
 * string until the previous one's async unsubscribe finishes tearing down —
 * and once `.subscribe()` has ever run on a channel, it refuses new `.on()`
 * bindings forever, even mid-teardown. Reusing a topic keyed only on semantic
 * identity (a post id, a mode) races that async unsubscribe: re-mounting the
 * same screen before the previous subscription's teardown lands throws.
 * A unique topic per subscription instance sidesteps the reuse lookup
 * entirely, so this is never in play.
 */
function uniqueTopic(base: string): string {
  return `${base}-${channelSeq++}`;
}

export function subscribeBlocks(
  userId: string,
  onBlocked: (blockedUserId: string) => void,
): () => void {
  const channel = supabase
    .channel(uniqueTopic(`community-blocks-${userId}`))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'blocks', filter: `blocker_id=eq.${userId}` },
      (payload) => {
        const row = payload.new as { blocked_id: string };
        if (row.blocked_id) onBlocked(row.blocked_id);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Realtime ─────────────────────────────────────────────────────────────────

export function subscribeFeed(
  mode: 'global' | 'following',
  followingIds: Set<string>,
  handlers: {
    onInsert: (p: CommunityPost) => void;
    onCountsUpdate: (patch: { id: string; likeCount: number; commentCount: number; pollCounts: number[] | null }) => void;
    onDelete: (id: string) => void;
  },
): () => void {
  const channel = supabase
    .channel(uniqueTopic(`community-feed-${mode}`))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
      const row = payload.new as { id: string; author_id: string; kind?: string; activity_id?: string | null };
      // activity prompts live in their own pool (subscribeActivityPool below)
      // and responses to one live only on that activity's own page — neither
      // belongs in the live feed
      if (row.kind === 'activity' || row.activity_id) return;
      if (mode === 'following' && !followingIds.has(row.author_id)) return;
      const post = await fetchPost(row.id);
      if (post) handlers.onInsert(post);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
      const row = payload.new as {
        id: string;
        like_count: number;
        comment_count: number;
        poll_counts: number[] | null;
      };
      handlers.onCountsUpdate({
        id: row.id,
        likeCount: row.like_count,
        commentCount: row.comment_count,
        pollCounts: row.poll_counts,
      });
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
      const row = payload.old as { id: string };
      handlers.onDelete(row.id);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Counts only, no insert/delete — for a scoped, already-loaded list (a
 * profile's or F/O's posts) where a new post showing up live isn't needed,
 * but someone else's like/poll tap on a post already on screen should
 * still move without a manual refresh. Broadcasts every posts UPDATE
 * unfiltered; the caller's reducer only applies patches whose id it already
 * has, so this is cheap to leave running per screen.
 */
export function subscribePostCounts(
  onCountsUpdate: (patch: { id: string; likeCount: number; commentCount: number; pollCounts: number[] | null }) => void,
): () => void {
  const channel = supabase
    .channel(uniqueTopic('community-post-counts'))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
      const row = payload.new as {
        id: string;
        like_count: number;
        comment_count: number;
        poll_counts: number[] | null;
      };
      onCountsUpdate({
        id: row.id,
        likeCount: row.like_count,
        commentCount: row.comment_count,
        pollCounts: row.poll_counts,
      });
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * The activity submission pool, live — a newly submitted prompt appears for
 * everyone watching, and like counts move in real time as people like one.
 * Liking an activity only ever touches `posts.like_count` (via the same
 * trigger every other post's likes use), so watching `posts` UPDATE is
 * enough.
 */
export function subscribeActivityPool(handlers: {
  onInsert: (p: CommunityPost) => void;
  onLikeUpdate: (patch: { id: string; likeCount: number; featured: boolean }) => void;
  onDelete: (id: string) => void;
}): () => void {
  const channel = supabase
    .channel(uniqueTopic('community-activity-pool'))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
      const row = payload.new as { id: string; kind?: string; featured_date: string | null };
      if (row.kind !== 'activity' || row.featured_date) return;
      const post = await fetchPost(row.id);
      if (post) handlers.onInsert(post);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
      const row = payload.new as { id: string; kind?: string; like_count: number; featured_date: string | null };
      if (row.kind !== 'activity') return;
      handlers.onLikeUpdate({ id: row.id, likeCount: row.like_count, featured: !!row.featured_date });
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
      const row = payload.old as { id: string };
      handlers.onDelete(row.id);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeActivityDetail(
  activityId: string,
  handlers: {
    onResponseInsert: (p: CommunityPost) => void;
    onResponseDelete: (id: string) => void;
  },
): () => void {
  const channel = supabase
    .channel(uniqueTopic(`community-activity-detail-${activityId}`))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'posts', filter: `activity_id=eq.${activityId}` },
      async (payload) => {
        const row = payload.new as { id: string };
        const post = await fetchPost(row.id);
        if (post) handlers.onResponseInsert(post);
      },
    )
    // unfiltered: posts has default replica identity, so a DELETE's old-row
    // payload only carries the primary key — a filter on activity_id would
    // never match. The caller's reducer discards ids it doesn't have.
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
      const row = payload.old as { id: string };
      handlers.onResponseDelete(row.id);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeProfile(
  id: string,
  onUpdate: (patch: { followerCount: number; followingCount: number }) => void,
): () => void {
  const channel = supabase
    .channel(uniqueTopic(`community-profile-${id}`))
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${id}`,
      },
      (payload) => {
        const row = payload.new as { follower_count: number; following_count: number };
        onUpdate({ followerCount: row.follower_count, followingCount: row.following_count });
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribePost(
  postId: string,
  handlers: {
    onCountsUpdate: (patch: { likeCount: number; commentCount: number; pollCounts: number[] | null }) => void;
    onCommentInsert: (c: CommunityComment) => void;
    onCommentDelete: (id: string) => void;
  },
): () => void {
  const channel = supabase
    .channel(uniqueTopic(`community-post-${postId}`))
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`,
      },
      (payload) => {
        const row = payload.new as {
          like_count: number;
          comment_count: number;
          poll_counts: number[] | null;
        };
        handlers.onCountsUpdate({
          likeCount: row.like_count,
          commentCount: row.comment_count,
          pollCounts: row.poll_counts,
        });
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      },
      async (payload) => {
        const row = payload.new as { id: string };
        const { data } = await supabase.from('comments').select(COMMENT_SELECT).eq('id', row.id).maybeSingle();
        if (data) handlers.onCommentInsert(rowToComment(data));
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => {
        const row = payload.old as { id: string };
        handlers.onCommentDelete(row.id);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Warms the image cache for a page of posts the moment it arrives, rather than
 * when each row scrolls into view — the same "fetch just ahead of the scroll"
 * trick feed apps use so media is decoded before it is needed.
 *
 * Only the small variants: avatars and the 480px thumbnails the cards actually
 * draw. Full-size photos stay lazy, since most posts are never opened.
 */
function prefetchFeedMedia(posts: CommunityPost[]) {
  const urls: string[] = [];
  for (const p of posts) {
    if (p.author.avatarUrl) urls.push(p.author.avatarUrl);
    if (p.fo?.avatarUrl) urls.push(p.fo.avatarUrl);
    for (const m of p.media) urls.push(m.thumbnailUrl || m.url);
  }
  if (urls.length) Image.prefetch(urls, 'memory-disk').catch(() => {});
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCommunityFeed(mode: 'global' | 'following') {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  // shared by load() and loadMore(): a short page means the feed has run out,
  // and this stops onEndReached from refetching the tail forever
  const hasMore = useRef(true);

  const load = useCallback(async () => {
    const page = await fetchFeedPage({ mode, limit: 20 });
    hasMore.current = page.length >= 20;
    setPosts(page);
    setLoading(false);
    prefetchFeedMedia(page);
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // follows aren't in the realtime publication, so this set only updates when
  // asked — on mode change, on pull-to-refresh, and on screen focus (below), the
  // moments a newly-followed person actually needs to show up in this feed
  const loadFollowingIds = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
    setFollowingIds(new Set((data ?? []).map((r: any) => r.following_id)));
  }, []);

  useEffect(() => {
    if (mode !== 'following') return;
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user || cancelled) return;
      const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
      if (!cancelled) setFollowingIds(new Set((data ?? []).map((r: any) => r.following_id)));
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  // a block in either direction takes effect on screen, not just on next fetch
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid || cancelled) return;
      unsubscribe = subscribeBlocks(uid, (otherId) => {
        setPosts((prev) => prev.filter((p) => p.author.id !== otherId));
      });
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    return subscribeFeed(mode, followingIds, {
      onInsert: (p) => setPosts((prev) => (prev.some((x) => x.id === p.id) ? prev : [p, ...prev])),
      onCountsUpdate: (patch) =>
        setPosts((prev) =>
          prev.map((p) =>
            p.id === patch.id
              ? {
                  ...p,
                  likeCount: patch.likeCount,
                  commentCount: patch.commentCount,
                  poll: withPollCounts(p.poll, patch.pollCounts),
                }
              : p,
          ),
        ),
      onDelete: (id) => setPosts((prev) => prev.filter((p) => p.id !== id)),
    });
  }, [mode, followingIds]);

  // Reading posts through a ref rather than the dependency array: with [posts]
  // this callback got a new identity on every list change, which changed every
  // card's onToggleLike prop and re-rendered the whole feed on a single like.
  const postsRef = useRef(posts);
  postsRef.current = posts;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    hasMore.current = true;
    if (mode === 'following') await loadFollowingIds();
    await load();
    setRefreshing(false);
  }, [load, mode, loadFollowingIds]);

  // onEndReached fires repeatedly while the list is still settling, so without a
  // guard several requests run concurrently against the same cursor and append
  // the same page twice.
  const loadingMore = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingMore.current || !hasMore.current) return;
    const current = postsRef.current;
    if (current.length === 0) return;

    loadingMore.current = true;
    try {
      const limit = 20;
      const more = await fetchFeedPage({
        mode,
        before: current[current.length - 1].createdAt,
        limit,
      });
      if (more.length < limit) hasMore.current = false;
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      prefetchFeedMedia(more);
    } finally {
      loadingMore.current = false;
    }
  }, [mode]);

  // a double-tap fires twice before the first request resolves; without this the
  // second inverts the optimistic state and the count ends up wrong
  const inFlight = useRef<Set<string>>(new Set());

  const toggleLikeOptimistic = useCallback(async (postId: string, onFailure?: () => void) => {
    if (inFlight.current.has(postId)) return;
    const target = postsRef.current.find((p) => p.id === postId);
    if (!target) return;

    const wasLiked = target.likedByMe;
    const apply = (liked: boolean, delta: number) =>
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likedByMe: liked, likeCount: p.likeCount + delta } : p,
        ),
      );

    inFlight.current.add(postId);
    apply(!wasLiked, wasLiked ? -1 : 1);
    try {
      await toggleLike(postId, wasLiked);
    } catch {
      apply(wasLiked, wasLiked ? 1 : -1);
      onFailure?.();
    } finally {
      inFlight.current.delete(postId);
    }
  }, []);

  const inFlightPoll = useRef<Set<string>>(new Set());
  const pollVoteOptimistic = useCallback(async (postId: string, optionIndex: number, onFailure?: () => void) => {
    if (inFlightPoll.current.has(postId)) return;
    const target = postsRef.current.find((p) => p.id === postId);
    if (!target?.poll) return;

    const prevPoll = target.poll;
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, poll: pollAfterVote(prevPoll, optionIndex) } : p)));
    inFlightPoll.current.add(postId);
    try {
      await votePoll(postId, optionIndex);
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, poll: prevPoll } : p)));
      onFailure?.();
    } finally {
      inFlightPoll.current.delete(postId);
    }
  }, []);

  return {
    posts,
    loading,
    refreshing,
    refresh,
    loadMore,
    toggleLikeOptimistic,
    pollVoteOptimistic,
  };
}

/**
 * A paginated post list scoped to one owner — see useUserPosts (an author's
 * posts) and useFoPosts (posts tagged to an F/O) for the entry points.
 *
 * Deliberately lighter than useCommunityFeed: no following-set or realtime
 * subscription, since these are secondary, already-scoped views —
 * posting/liking elsewhere is reflected next time this list loads, not live.
 */
function usePostList(
  ownerId: string | undefined,
  fetchPage: (id: string, opts: PostPageOpts) => Promise<CommunityPost[]>,
) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasMore = useRef(true);

  const load = useCallback(async () => {
    if (!ownerId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    const page = await fetchPage(ownerId, { limit: 20 });
    hasMore.current = page.length >= 20;
    setPosts(page);
    setLoading(false);
    prefetchFeedMedia(page);
  }, [ownerId, fetchPage]);

  useEffect(() => {
    setLoading(true);
    hasMore.current = true;
    load();
  }, [load]);

  useEffect(() => {
    return subscribePostCounts((patch) =>
      setPosts((prev) =>
        prev.map((p) =>
          p.id === patch.id
            ? {
                ...p,
                likeCount: patch.likeCount,
                commentCount: patch.commentCount,
                poll: withPollCounts(p.poll, patch.pollCounts),
              }
            : p,
        ),
      ),
    );
  }, []);

  const postsRef = useRef(posts);
  postsRef.current = posts;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    hasMore.current = true;
    await load();
    setRefreshing(false);
  }, [load]);

  const loadingMore = useRef(false);

  const loadMore = useCallback(async () => {
    if (!ownerId || loadingMore.current || !hasMore.current) return;
    const current = postsRef.current;
    if (current.length === 0) return;

    loadingMore.current = true;
    try {
      const limit = 20;
      const more = await fetchPage(ownerId, { before: current[current.length - 1].createdAt, limit });
      if (more.length < limit) hasMore.current = false;
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      prefetchFeedMedia(more);
    } finally {
      loadingMore.current = false;
    }
  }, [ownerId, fetchPage]);

  const inFlight = useRef<Set<string>>(new Set());

  const toggleLikeOptimistic = useCallback(async (postId: string, onFailure?: () => void) => {
    if (inFlight.current.has(postId)) return;
    const target = postsRef.current.find((p) => p.id === postId);
    if (!target) return;

    const wasLiked = target.likedByMe;
    const apply = (liked: boolean, delta: number) =>
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likedByMe: liked, likeCount: p.likeCount + delta } : p)),
      );

    inFlight.current.add(postId);
    apply(!wasLiked, wasLiked ? -1 : 1);
    try {
      await toggleLike(postId, wasLiked);
    } catch {
      apply(wasLiked, wasLiked ? 1 : -1);
      onFailure?.();
    } finally {
      inFlight.current.delete(postId);
    }
  }, []);

  const inFlightPoll = useRef<Set<string>>(new Set());
  const pollVoteOptimistic = useCallback(async (postId: string, optionIndex: number, onFailure?: () => void) => {
    if (inFlightPoll.current.has(postId)) return;
    const target = postsRef.current.find((p) => p.id === postId);
    if (!target?.poll) return;

    const prevPoll = target.poll;
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, poll: pollAfterVote(prevPoll, optionIndex) } : p)));
    inFlightPoll.current.add(postId);
    try {
      await votePoll(postId, optionIndex);
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, poll: prevPoll } : p)));
      onFailure?.();
    } finally {
      inFlightPoll.current.delete(postId);
    }
  }, []);

  // called after a confirmed delete — the row is already gone server-side by
  // the time this runs, so this is a plain local removal, not optimistic
  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return {
    posts,
    loading,
    refreshing,
    refresh,
    loadMore,
    toggleLikeOptimistic,
    pollVoteOptimistic,
    removePost,
  };
}

/**
 * A single author's posts — the profile screens' "their posts" section, both
 * for the signed-in user's own profile and anyone else's public one.
 */
export function useUserPosts(userId: string | undefined) {
  return usePostList(userId, fetchUserPosts);
}

/** Every post tagged to one F/O, for that F/O's profile page. */
export function useFoPosts(foId: string | undefined) {
  return usePostList(foId, fetchFoPosts);
}

export function useCommunityPost(id: string) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [p, c] = await Promise.all([fetchPost(id), fetchComments(id)]);
      if (!cancelled) {
        setPost(p);
        setComments(c);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    return subscribePost(id, {
      onCountsUpdate: (patch) =>
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likeCount: patch.likeCount,
                commentCount: patch.commentCount,
                poll: withPollCounts(prev.poll, patch.pollCounts),
              }
            : prev,
        ),
      onCommentInsert: (c) => setComments((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c])),
      onCommentDelete: (cid) => setComments((prev) => prev.filter((c) => c.id !== cid)),
    });
  }, [id]);

  const toggleLikeOptimistic = useCallback(async (onFailure?: () => void) => {
    if (!post) return;
    const wasLiked = post.likedByMe;
    const targetId = post.id;
    setPost((p) =>
      p
        ? {
            ...p,
            likedByMe: !wasLiked,
            likeCount: p.likeCount + (wasLiked ? -1 : 1),
          }
        : p,
    );
    try {
      await toggleLike(targetId, wasLiked);
    } catch {
      setPost((p) =>
        p
          ? {
              ...p,
              likedByMe: wasLiked,
              likeCount: p.likeCount + (wasLiked ? 1 : -1),
            }
          : p,
      );
      onFailure?.();
    }
  }, [post]);

  const pollVoteOptimistic = useCallback(async (optionIndex: number, onFailure?: () => void) => {
    if (!post?.poll) return;
    const targetId = post.id;
    const prevPoll = post.poll;
    setPost((p) => (p ? { ...p, poll: pollAfterVote(prevPoll, optionIndex) } : p));
    try {
      await votePoll(targetId, optionIndex);
    } catch {
      setPost((p) => (p ? { ...p, poll: prevPoll } : p));
      onFailure?.();
    }
  }, [post]);

  // exposed so the composer can show a comment the instant it's created rather
  // than waiting on the realtime echo — onCommentInsert above already dedupes by
  // id, so the echo arriving afterwards is a no-op, not a double entry
  const insertComment = useCallback((c: CommunityComment) => {
    setComments((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]));
  }, []);

  return { post, comments, loading, toggleLikeOptimistic, pollVoteOptimistic, insertComment };
}

/**
 * A featured activity's own page: the prompt itself (votable) plus every
 * full post made in response to it, live.
 */
export function useActivityDetail(activityId: string) {
  const [activity, setActivity] = useState<CommunityPost | null>(null);
  const [responses, setResponses] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [a, r] = await Promise.all([fetchPost(activityId), fetchActivityResponses(activityId)]);
      if (!cancelled) {
        setActivity(a);
        setResponses(r);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activityId]);

  useEffect(() => {
    return subscribeActivityDetail(activityId, {
      onResponseInsert: (p) => setResponses((prev) => (prev.some((x) => x.id === p.id) ? prev : [p, ...prev])),
      onResponseDelete: (id) => setResponses((prev) => prev.filter((p) => p.id !== id)),
    });
  }, [activityId]);

  const responsesRef = useRef(responses);
  responsesRef.current = responses;

  const inFlightLike = useRef<Set<string>>(new Set());
  const toggleResponseLikeOptimistic = useCallback(async (postId: string, onFailure?: () => void) => {
    if (inFlightLike.current.has(postId)) return;
    const target = responsesRef.current.find((p) => p.id === postId);
    if (!target) return;

    const wasLiked = target.likedByMe;
    const apply = (liked: boolean, delta: number) =>
      setResponses((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likedByMe: liked, likeCount: p.likeCount + delta } : p)),
      );

    inFlightLike.current.add(postId);
    apply(!wasLiked, wasLiked ? -1 : 1);
    try {
      await toggleLike(postId, wasLiked);
    } catch {
      apply(wasLiked, wasLiked ? 1 : -1);
      onFailure?.();
    } finally {
      inFlightLike.current.delete(postId);
    }
  }, []);

  const inFlightPoll = useRef<Set<string>>(new Set());
  const pollVoteOptimistic = useCallback(async (postId: string, optionIndex: number, onFailure?: () => void) => {
    if (inFlightPoll.current.has(postId)) return;
    const target = responsesRef.current.find((p) => p.id === postId);
    if (!target?.poll) return;

    const prevPoll = target.poll;
    setResponses((prev) => prev.map((p) => (p.id === postId ? { ...p, poll: pollAfterVote(prevPoll, optionIndex) } : p)));
    inFlightPoll.current.add(postId);
    try {
      await votePoll(postId, optionIndex);
    } catch {
      setResponses((prev) => prev.map((p) => (p.id === postId ? { ...p, poll: prevPoll } : p)));
      onFailure?.();
    } finally {
      inFlightPoll.current.delete(postId);
    }
  }, []);

  return { activity, responses, loading, toggleResponseLikeOptimistic, pollVoteOptimistic };
}
