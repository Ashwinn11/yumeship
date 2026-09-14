/**
 * Shared expo-image defaults. Without these every <Image> re-fetches on each
 * mount and pops in with a blank frame; 'memory-disk' keeps a decoded copy in
 * memory and the bytes on disk, so scrolling back up a feed is instant.
 *
 * `recyclingKey` matters in FlatList: cells are reused, and without it a
 * recycled row briefly shows the previous row's photo.
 */
export const IMAGE_DEFAULTS = {
  cachePolicy: 'memory-disk',
  transition: 180,
} as const;

/** Avatars are small and always wanted first — fetch them ahead of feed media. */
export const AVATAR_IMAGE = {
  ...IMAGE_DEFAULTS,
  priority: 'high',
  placeholderContentFit: 'cover',
} as const;

/** Feed/post photos: bigger, below the fold more often, so they yield to avatars. */
export const MEDIA_IMAGE = {
  ...IMAGE_DEFAULTS,
  priority: 'normal',
  placeholder: { blurhash: 'L6Pj0^i_.AyE_3t7t7R**0o#DgR4' },
  placeholderContentFit: 'cover',
} as const;
