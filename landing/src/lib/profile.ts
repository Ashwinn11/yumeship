import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GalleryPhoto = { uri: string; caption: string };

export type ProfileFlag = {
  id: string;
  flag: string;
  imageUrl: string;
  text: string;
};

export type WebProfile = {
  id: string;
  username: string;
  name: string;
  pronouns: string;
  bio: string;
  tagline: string;
  avatarUrl: string;
  song: string;
  songLink: string;
  gallery: GalleryPhoto[];
  flags: ProfileFlag[];
  identifyFoId: string | null;
  followerCount: number;
  followingCount: number;
  // card theme
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
  nameFont: string;
};

export type WebFoProfile = {
  id: string;
  name: string;
  pronouns: string;
  bio: string;
  tagline: string;
  avatarUrl: string;
  song: string;
  songLink: string;
  gallery: GalleryPhoto[];
  flags: ProfileFlag[];
  fandom: string;
  relStatus: string;
  shareStatus: string;
  age: string;
  birthday: string;
  // card theme
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
  nameFont: string;
};

// ─── Field lists (mirrors community.ts in the app) ────────────────────────────

const CARD_THEME_FIELDS =
  'height, weight, page_bg_color, page_bg_image, card_bg_color, card_bg_image, ' +
  'card_bg_gradient, card_transparent, text_color, border_style, name_font';

const PROFILE_FIELDS =
  `id, username, name, pronouns, bio, tagline, avatar_url, song, song_link, gallery, flags, ` +
  `color, identify_fo_id, follower_count, following_count, ${CARD_THEME_FIELDS}`;

const FO_PROFILE_FIELDS =
  `id, name, pronouns, bio, tagline, avatar_url, song, song_link, gallery, flags, ` +
  `fandom, rel_status, share_status, age, birthday, ${CARD_THEME_FIELDS}`;

// ─── Row mappers ──────────────────────────────────────────────────────────────

function parseGallery(raw: unknown): GalleryPhoto[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((g) => g && typeof g.url === 'string')
    .map((g) => ({ uri: g.url as string, caption: (g.caption as string) ?? '' }));
}

function parseFlags(raw: unknown): ProfileFlag[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((f) => f && typeof f.text === 'string')
    .map((f) => ({
      id: (f.id as string) ?? '',
      flag: ((f.flag ?? f.icon) as string) ?? '',
      imageUrl: (f.imageUrl as string) ?? '',
      text: f.text as string,
    }));
}

function parseCardTheme(row: Record<string, unknown>) {
  return {
    color: (row.color as string) ?? '',
    height: (row.height as string) ?? '',
    weight: (row.weight as string) ?? '',
    pageBgColor: (row.page_bg_color as string) ?? '',
    pageBgImage: (row.page_bg_image as string) ?? '',
    cardBgColor: (row.card_bg_color as string) ?? '',
    cardBgImage: (row.card_bg_image as string) ?? '',
    cardBgGradient: (row.card_bg_gradient as string) ?? '',
    cardTransparent: !!(row.card_transparent),
    textColor: (row.text_color as string) ?? '',
    borderStyle: (row.border_style as string) ?? '',
    nameFont: (row.name_font as string) ?? '',
  };
}

function rowToProfile(row: Record<string, unknown>): WebProfile {
  return {
    ...parseCardTheme(row),
    id: row.id as string,
    username: (row.username as string) ?? '',
    name: (row.name as string) ?? '',
    pronouns: (row.pronouns as string) ?? '',
    bio: (row.bio as string) ?? '',
    tagline: (row.tagline as string) ?? '',
    avatarUrl: (row.avatar_url as string) ?? '',
    song: (row.song as string) ?? '',
    songLink: (row.song_link as string) ?? '',
    gallery: parseGallery(row.gallery),
    flags: parseFlags(row.flags),
    identifyFoId: (row.identify_fo_id as string) ?? null,
    followerCount: (row.follower_count as number) ?? 0,
    followingCount: (row.following_count as number) ?? 0,
  };
}

function rowToFoProfile(row: Record<string, unknown>): WebFoProfile {
  return {
    ...parseCardTheme(row),
    id: row.id as string,
    name: (row.name as string) ?? '',
    pronouns: (row.pronouns as string) ?? '',
    bio: (row.bio as string) ?? '',
    tagline: (row.tagline as string) ?? '',
    avatarUrl: (row.avatar_url as string) ?? '',
    song: (row.song as string) ?? '',
    songLink: (row.song_link as string) ?? '',
    gallery: parseGallery(row.gallery),
    flags: parseFlags(row.flags),
    fandom: (row.fandom as string) ?? '',
    relStatus: (row.rel_status as string) ?? 'romantic',
    shareStatus: (row.share_status as string) ?? 'selective',
    age: (row.age as string) ?? '',
    birthday: (row.birthday as string) ?? '',
  };
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

/** Resolve a @username to a full profile. Returns null if not found. */
export async function fetchProfileByUsername(username: string): Promise<WebProfile | null> {
  const clean = username.trim().toLowerCase().replace(/^@/, '');
  console.log('[profile] fetching username:', clean);
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('username', clean)
    .maybeSingle();
  console.log('[profile] result:', { data, error });
  if (error || !data) return null;
  return rowToProfile(data as unknown as Record<string, unknown>);
}

/** Fetch a profile by UUID — used after username resolution for the paired F/O. */
export async function fetchProfileById(id: string): Promise<WebProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data as unknown as Record<string, unknown>);
}

/** All public F/O profiles owned by a user. */
export async function fetchUserFoProfiles(userId: string): Promise<WebFoProfile[]> {
  const { data, error } = await supabase
    .from('fo_profiles')
    .select(FO_PROFILE_FIELDS)
    .eq('owner_id', userId);
  if (error || !data) return [];
  return (data as unknown as Record<string, unknown>[]).map(rowToFoProfile);
}

/** Single F/O profile by id — for the paired identity card. */
export async function fetchFoProfile(foId: string): Promise<WebFoProfile | null> {
  const { data, error } = await supabase
    .from('fo_profiles')
    .select(FO_PROFILE_FIELDS)
    .eq('id', foId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToFoProfile(data as unknown as Record<string, unknown>);
}

export type WebPostMedia = { url: string; width?: number; height?: number };

export type WebPost = {
  id: string;
  authorId: string;
  foProfileId: string | null;
  title: string;
  body: string;
  media: WebPostMedia[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  kind?: string;
  pollOptions?: string[];
  pollCounts?: number[];
  author?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  fo?: {
    id: string;
    name: string;
    avatarUrl: string;
  } | null;
};

export async function fetchUserPosts(userId: string): Promise<WebPost[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, author_id, fo_profile_id, title, body, media, like_count, comment_count, created_at,
        kind, poll_options, poll_counts,
        author:profiles!posts_author_id_fkey(id, name, username, avatar_url),
        fo:fo_profiles!posts_fo_profile_id_fkey(id, name, avatar_url)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error || !data) return [];
    return (data as any[]).map((r) => ({
      id: r.id,
      authorId: r.author_id,
      foProfileId: r.fo_profile_id,
      title: r.title || '',
      body: r.body || '',
      media: Array.isArray(r.media) ? r.media : [],
      likeCount: r.like_count || 0,
      commentCount: r.comment_count || 0,
      createdAt: r.created_at,
      kind: r.kind,
      pollOptions: r.poll_options,
      pollCounts: r.poll_counts,
      author: r.author,
      fo: r.fo,
    }));
  } catch {
    return [];
  }
}

