import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { compressImage, compressVideo, syncMediaMap } from '@/lib/mediaOptimizer';
import { uploadToBucket } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import { getAllFos, getFo, parseGallery, updateFo, type Fo, type GalleryPhoto } from './fo';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';

export const MAX_IMAGES = 4;
export const MAX_VIDEO_DURATION_MS = 10_000;

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
};

export type PostMedia =
  | {
      type: 'image';
      url: string;
      /** small variant for the feed grid — absent on posts made before thumbnails existed */
      thumbnailUrl?: string;
      width: number;
      height: number;
    }
  | {
      type: 'video';
      url: string;
      thumbnailUrl: string;
      durationMs: number;
      width: number;
      height: number;
    };

export type LocalPickedMedia =
  | { type: 'image'; uri: string; width: number; height: number }
  | {
      type: 'video';
      uri: string;
      durationMs: number;
      width: number;
      height: number;
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
  };
}

function rowToPost(row: Record<string, any>, likedPostIds: Set<string>): CommunityPost {
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
  fandom, rel_status, share_status, ${CARD_THEME_FIELDS}
`);

// Feed rows only ever draw an avatar + name, so post embeds stay on this narrow
// set — pulling every author's gallery and theme per post would balloon the feed
// payload for data no card in the list renders. rowToProfile tolerates the gaps.
const PROFILE_SUMMARY_FIELDS = 'id, username, name, pronouns, avatar_url';
const FO_SUMMARY_FIELDS = 'id, name, pronouns, avatar_url';
const POST_SELECT = cols(`
  id, author_id, fo_profile_id, title, body, media, like_count, comment_count, created_at,
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
  return { ok: true };
}

export async function pushOwnProfile(): Promise<PushResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return { photoFailed: false };

  let photoFailed = false;
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

  // The local "already uploaded this file" marker can't be trusted on its own:
  // the remote row may have lost its avatar since (an unpublish, or an upsert
  // that failed after the marker was written). Re-upload whenever it has none.
  const { data: existingRow } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const localAvatar = getGlobalSetting('user_avatar');
  const lastSyncedAvatar = getGlobalSetting('user_avatar_synced_uri');
  let uploadedAvatarFor = '';
  if (localAvatar && (localAvatar !== lastSyncedAvatar || !existingRow?.avatar_url)) {
    try {
      const compressed = await compressImage(localAvatar, 'avatar');
      patch.avatar_url = await uploadToBucket('avatars', `${user.id}/${Date.now()}.jpg`, compressed, 'image/jpeg');
      uploadedAvatarFor = localAvatar;
    } catch (e) {
      // the rest of the profile still saves, but the caller is told the photo did not
      photoFailed = true;
      logSyncFailure('pushOwnProfile avatar upload')(e);
    }
  } else if (!localAvatar) {
    patch.avatar_url = '';
  }

  // gallery and the two background images ride the same {localUri: remoteUrl}
  // map, so a background picked once is never re-uploaded on later saves
  const localGallery = parseGallery(getGlobalSetting('user_gallery'));
  const cardBgImage = getGlobalSetting('user_card_bg_image');
  const pageBgImage = getGlobalSetting('user_page_bg_image');
  const prevGalleryMap = parseSyncMap(getGlobalSetting('user_gallery_sync_map'));
  const galleryMap = await syncMediaMap(
    [...localGallery.map((p) => p.uri), cardBgImage, pageBgImage].filter(Boolean),
    prevGalleryMap,
    (compressedUri) =>
      uploadToBucket(
        'avatars',
        `${user.id}/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
        compressedUri,
        'image/jpeg',
      ),
  );
  saveGlobalSetting('user_gallery_sync_map', JSON.stringify(galleryMap));
  patch.gallery = localGallery.map((p) => ({ url: galleryMap[p.uri], caption: p.caption })).filter((g) => g.url);
  patch.card_bg_image = (cardBgImage && galleryMap[cardBgImage]) || '';
  patch.page_bg_image = (pageBgImage && galleryMap[pageBgImage]) || '';

  const { error } = await supabase.from('profiles').upsert(patch);
  if (error) throw error;
  // only remember the upload once the row that references it actually landed
  if (uploadedAvatarFor) saveGlobalSetting('user_avatar_synced_uri', uploadedAvatarFor);
  return { photoFailed };
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

  let photoFailed = false;
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
  const { data: existingRow } = await supabase
    .from('fo_profiles')
    .select('avatar_url')
    .eq('id', fo.id)
    .maybeSingle();

  let uploadedAvatarFor = '';
  if (fo.photoUri && (fo.photoUri !== fo.avatarSyncedUri || !existingRow?.avatar_url)) {
    try {
      const compressed = await compressImage(fo.photoUri, 'avatar');
      patch.avatar_url = await uploadToBucket(
        'avatars',
        `${user.id}/fo/${fo.id}/${Date.now()}.jpg`,
        compressed,
        'image/jpeg',
      );
      uploadedAvatarFor = fo.photoUri;
    } catch (e) {
      photoFailed = true;
      logSyncFailure('pushFoProfile avatar upload')(e);
    }
  } else if (!fo.photoUri) {
    patch.avatar_url = '';
  }

  const galleryMap = await syncMediaMap(
    [...fo.gallery.map((p) => p.uri), fo.cardBgImage, fo.pageBgImage].filter(Boolean),
    fo.gallerySyncMap,
    (compressedUri) =>
      uploadToBucket(
        'avatars',
        `${user.id}/fo/${fo.id}/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
        compressedUri,
        'image/jpeg',
      ),
  );
  patch.gallery = fo.gallery.map((p) => ({ url: galleryMap[p.uri], caption: p.caption })).filter((g) => g.url);
  patch.card_bg_image = (fo.cardBgImage && galleryMap[fo.cardBgImage]) || '';
  patch.page_bg_image = (fo.pageBgImage && galleryMap[fo.pageBgImage]) || '';

  const { error } = await supabase.from('fo_profiles').upsert(patch);
  if (error) throw error;

  updateFo(fo.id, {
    gallerySyncMap: galleryMap,
    isPublic: true,
    // committed only now that the row referencing the upload exists
    ...(uploadedAvatarFor ? { avatarSyncedUri: uploadedAvatarFor } : null),
  });
  return { photoFailed };
}

export async function unpublishFoProfile(foId: string): Promise<void> {
  await supabase.from('fo_profiles').delete().eq('id', foId);
  // the row is gone, so every uploaded-already marker is now a lie — clearing
  // them makes the next publish re-upload the avatar and gallery from scratch
  updateFo(foId, { isPublic: false, avatarSyncedUri: '', gallerySyncMap: {} });
}

export async function fetchFoProfile(id: string): Promise<CommunityFoProfile | null> {
  const { data, error } = await supabase.from('fo_profiles').select(FO_PROFILE_FIELDS).eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToFoProfile(data);
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
  if (error) throw error;
  if (data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }

  saveGlobalSetting('user_username', '');
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

export async function fetchFeedPage(opts: {
  mode: 'global' | 'following';
  before?: string;
  limit?: number;
}): Promise<CommunityPost[]> {
  const limit = opts.limit ?? 20;
  let query = supabase.from('posts').select(POST_SELECT).order('created_at', { ascending: false }).limit(limit);
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
  const likedIds = await fetchLikedPostIds(data.map((r: any) => r.id));
  return data.map((r: any) => rowToPost(r, likedIds));
}

export async function fetchPost(id: string): Promise<CommunityPost | null> {
  const { data, error } = await supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle();
  if (error || !data) return null;
  const likedIds = await fetchLikedPostIds([id]);
  return rowToPost(data, likedIds);
}

export async function createPost(input: {
  /** optional — posts are body/media-first, a title is just an extra flourish */
  title?: string;
  body: string;
  media: LocalPickedMedia[];
  foProfileId?: string;
}): Promise<CommunityPost> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('not signed in');

  const batchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const first = input.media[0];

  // images (up to 4) upload concurrently; a video is always alone (schema-enforced),
  // and its own two uploads (clip + thumbnail) also run concurrently once compressed
  const media: PostMedia[] =
    first?.type === 'video'
      ? await (async () => {
          const { uri: compressedUri, thumbnailUri } = await compressVideo(first.uri);
          const [url, thumbnailUrl] = await Promise.all([
            uploadToBucket('post-media', `${user.id}/${batchId}/video.mp4`, compressedUri, 'video/mp4'),
            uploadToBucket('post-media', `${user.id}/${batchId}/thumb.jpg`, thumbnailUri, 'image/jpeg'),
          ]);
          return [
            {
              type: 'video' as const,
              url,
              thumbnailUrl,
              durationMs: first.durationMs,
              width: first.width,
              height: first.height,
            },
          ];
        })()
      : await Promise.all(
          input.media.map(async (item, i) => {
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
    })
    .select(POST_SELECT)
    .single();
  if (error) throw error;
  return rowToPost(data, new Set());
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleLike(postId: string, currentlyLiked: boolean): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;
  if (currentlyLiked) {
    await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
  } else {
    await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
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
  await supabase.from('follows').insert({ follower_id: user.id, following_id: id });
}

export async function unfollowUser(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;
  await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id);
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
  await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: id });
}

export async function unblockUser(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;
  await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', id);
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
export function subscribeBlocks(
  userId: string,
  onBlocked: (blockedUserId: string) => void,
): () => void {
  const channel = supabase
    .channel(`community-blocks-${userId}`)
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
    onCountsUpdate: (patch: { id: string; likeCount: number; commentCount: number }) => void;
    onDelete: (id: string) => void;
  },
): () => void {
  const channel = supabase
    .channel(`community-feed-${mode}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
      const row = payload.new as { id: string; author_id: string };
      if (mode === 'following' && !followingIds.has(row.author_id)) return;
      const post = await fetchPost(row.id);
      if (post) handlers.onInsert(post);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
      const row = payload.new as {
        id: string;
        like_count: number;
        comment_count: number;
      };
      handlers.onCountsUpdate({
        id: row.id,
        likeCount: row.like_count,
        commentCount: row.comment_count,
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

export function subscribeProfile(
  id: string,
  onUpdate: (patch: { followerCount: number; followingCount: number }) => void,
): () => void {
  const channel = supabase
    .channel(`community-profile-${id}`)
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
    onCountsUpdate: (patch: { likeCount: number; commentCount: number }) => void;
    onCommentInsert: (c: CommunityComment) => void;
    onCommentDelete: (id: string) => void;
  },
): () => void {
  const channel = supabase
    .channel(`community-post-${postId}`)
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
        };
        handlers.onCountsUpdate({
          likeCount: row.like_count,
          commentCount: row.comment_count,
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
    const first = p.media[0];
    if (first?.type === 'video') urls.push(first.thumbnailUrl);
    else for (const m of p.media) if (m.type === 'image') urls.push(m.thumbnailUrl || m.url);
  }
  if (urls.length) Image.prefetch(urls, 'memory-disk').catch(() => {});
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCommunityFeed(mode: 'global' | 'following') {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const page = await fetchFeedPage({ mode });
    setPosts(page);
    setLoading(false);
    prefetchFeedMedia(page);
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (mode !== 'following') return;
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
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
    await load();
    setRefreshing(false);
  }, [load]);

  const loadMore = useCallback(async () => {
    const current = postsRef.current;
    if (current.length === 0) return;
    const more = await fetchFeedPage({
      mode,
      before: current[current.length - 1].createdAt,
    });
    setPosts((prev) => [...prev, ...more]);
    prefetchFeedMedia(more);
  }, [mode]);

  // a double-tap fires twice before the first request resolves; without this the
  // second inverts the optimistic state and the count ends up wrong
  const inFlight = useRef<Set<string>>(new Set());

  const toggleLikeOptimistic = useCallback(async (postId: string) => {
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
    } finally {
      inFlight.current.delete(postId);
    }
  }, []);

  return {
    posts,
    loading,
    refreshing,
    refresh,
    loadMore,
    toggleLikeOptimistic,
  };
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
              }
            : prev,
        ),
      onCommentInsert: (c) => setComments((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c])),
      onCommentDelete: (cid) => setComments((prev) => prev.filter((c) => c.id !== cid)),
    });
  }, [id]);

  const toggleLikeOptimistic = useCallback(async () => {
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
    }
  }, [post]);

  return { post, comments, loading, toggleLikeOptimistic };
}
