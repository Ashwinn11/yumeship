import { useCallback, useEffect, useState } from 'react';

import { compressImage, compressVideo, syncMediaMap } from '@/lib/mediaOptimizer';
import { uploadToBucket } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import { getFo, parseGallery, updateFo } from './fo';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';

export const MAX_IMAGES = 4;
export const MAX_VIDEO_DURATION_MS = 20_000;

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommunityProfile = {
  id: string;
  username: string;
  name: string;
  pronouns: string;
  bio: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
};

export type CommunityFoProfile = {
  id: string;
  name: string;
  pronouns: string;
  bio: string;
  avatarUrl: string;
};

export type PostMedia =
  | { type: 'image'; url: string; width: number; height: number }
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

function rowToProfile(row: Record<string, any>): CommunityProfile {
  return {
    id: row.id,
    username: row.username ?? '',
    name: row.name ?? '',
    pronouns: row.pronouns ?? '',
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url ?? '',
    followerCount: row.follower_count ?? 0,
    followingCount: row.following_count ?? 0,
  };
}

function rowToFoProfile(row: Record<string, any>): CommunityFoProfile {
  return {
    id: row.id,
    name: row.name ?? '',
    pronouns: row.pronouns ?? '',
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url ?? '',
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

const PROFILE_FIELDS = 'id, username, name, pronouns, bio, avatar_url, follower_count, following_count';
const FO_PROFILE_FIELDS = 'id, name, pronouns, bio, avatar_url';
const POST_SELECT = `
  id, author_id, fo_profile_id, title, body, media, like_count, comment_count, created_at,
  author:profiles!posts_author_id_fkey(${PROFILE_FIELDS}),
  fo:fo_profiles!posts_fo_profile_id_fkey(${FO_PROFILE_FIELDS})
`;
const COMMENT_SELECT = `
  id, post_id, parent_comment_id, body, created_at,
  author:profiles!comments_author_id_fkey(${PROFILE_FIELDS})
`;

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

export async function pushOwnProfile(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;

  const patch: Record<string, unknown> = {
    id: user.id,
    name: getGlobalSetting('user_name'),
    pronouns: getGlobalSetting('user_pronouns', 'she/her'),
    bio: getGlobalSetting('user_bio'),
    song: getGlobalSetting('user_song'),
    song_link: getGlobalSetting('user_song_link'),
  };

  const localAvatar = getGlobalSetting('user_avatar');
  const lastSyncedAvatar = getGlobalSetting('user_avatar_synced_uri');
  if (localAvatar && localAvatar !== lastSyncedAvatar) {
    try {
      const compressed = await compressImage(localAvatar);
      patch.avatar_url = await uploadToBucket('avatars', `${user.id}/${Date.now()}.jpg`, compressed, 'image/jpeg');
      saveGlobalSetting('user_avatar_synced_uri', localAvatar);
    } catch (_) {
      // stale/missing local avatar file — skip syncing it this time, rest of the profile still saves
    }
  }

  const localGallery = parseGallery(getGlobalSetting('user_gallery'));
  const prevGalleryMap = parseSyncMap(getGlobalSetting('user_gallery_sync_map'));
  const galleryMap = await syncMediaMap(
    localGallery.map((p) => p.uri),
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

  await supabase.from('profiles').upsert(patch);
}

export async function fetchProfile(id: string): Promise<CommunityProfile | null> {
  const { data, error } = await supabase.from('profiles').select(PROFILE_FIELDS).eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data);
}

// ─── F/O public profile ───────────────────────────────────────────────────────

export async function pushFoProfile(foId: string): Promise<void> {
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
  };

  if (fo.photoUri && fo.photoUri !== fo.avatarSyncedUri) {
    try {
      const compressed = await compressImage(fo.photoUri);
      patch.avatar_url = await uploadToBucket(
        'avatars',
        `${user.id}/fo/${fo.id}/${Date.now()}.jpg`,
        compressed,
        'image/jpeg',
      );
      updateFo(fo.id, { avatarSyncedUri: fo.photoUri });
    } catch (_) {
      // stale/missing local photo — publish the rest of their profile without a synced avatar this time
    }
  }

  const galleryMap = await syncMediaMap(
    fo.gallery.map((p) => p.uri),
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

  const { error } = await supabase.from('fo_profiles').upsert(patch);
  if (error) throw error;

  updateFo(fo.id, { gallerySyncMap: galleryMap, isPublic: true });
}

export async function unpublishFoProfile(foId: string): Promise<void> {
  updateFo(foId, { isPublic: false });
  await supabase.from('fo_profiles').delete().eq('id', foId);
}

export async function fetchFoProfile(id: string): Promise<CommunityFoProfile | null> {
  const { data, error } = await supabase.from('fo_profiles').select(FO_PROFILE_FIELDS).eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToFoProfile(data);
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
  title: string;
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
            const compressed = await compressImage(item.uri);
            const url = await uploadToBucket('post-media', `${user.id}/${batchId}/${i}.jpg`, compressed, 'image/jpeg');
            return {
              type: 'image' as const,
              url,
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
      title: input.title.trim(),
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
    .select(`blocked:profiles!blocks_blocked_id_fkey(${PROFILE_FIELDS})`)
    .eq('blocker_id', user.id);
  if (error || !data) return [];
  return data.map((r: any) => rowToProfile(r.blocked));
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

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (posts.length === 0) return;
    const more = await fetchFeedPage({
      mode,
      before: posts[posts.length - 1].createdAt,
    });
    setPosts((prev) => [...prev, ...more]);
  }, [mode, posts]);

  const toggleLikeOptimistic = useCallback(
    async (postId: string) => {
      const target = posts.find((p) => p.id === postId);
      if (!target) return;
      const wasLiked = target.likedByMe;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !wasLiked,
                likeCount: p.likeCount + (wasLiked ? -1 : 1),
              }
            : p,
        ),
      );
      try {
        await toggleLike(postId, wasLiked);
      } catch {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likedByMe: wasLiked,
                  likeCount: p.likeCount + (wasLiked ? 1 : -1),
                }
              : p,
          ),
        );
      }
    },
    [posts],
  );

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
