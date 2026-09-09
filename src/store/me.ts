import { Colors } from '@/constants/theme';
import { parseProfileFlags, type CardTheme, type ProfileFlag } from '@/components/profile/cardTheme';
import { parseGallery, type GalleryPhoto } from './fo';
import { getGlobalSettings, saveGlobalSetting } from './onboarding';

// The "me" profile in one place, so the profile screen and its editor can't
// drift apart — previously each owned its own key list and mapping, which is
// how a field gets added to one and silently missed on the other.

export const ME_KEYS = [
  'user_name', 'user_pronouns', 'user_username', 'user_color', 'user_avatar', 'user_bio', 'user_tagline',
  'user_height', 'user_weight', 'user_age', 'user_birthday', 'user_song', 'user_song_link', 'user_gallery',
  'user_page_bg_color', 'user_page_bg_image', 'user_card_bg_color', 'user_card_bg_image',
  'user_card_bg_gradient', 'user_card_transparent', 'user_text_color', 'user_border_style',
  'user_name_font', 'user_identify_fo_id', 'user_flags',
] as const;

export type Me = {
  name: string; pronouns: string; username: string; color: string; avatar: string;
  bio: string; tagline: string; height: string; weight: string; age: string; birthday: string;
  song: string; songLink: string; gallery: GalleryPhoto[];
  pageBgColor: string; pageBgImage: string; cardBgColor: string; cardBgImage: string;
  cardBgGradient: string; cardTransparent: boolean; textColor: string;
  borderStyle: string; nameFont: string; identifyFoId: string;
  flags: ProfileFlag[];
};

/** One query rather than one per field — this runs on every focus. */
export function readMe(): Me {
  const g = getGlobalSettings(ME_KEYS);
  return {
    name: g.user_name,
    pronouns: g.user_pronouns || 'she/her',
    username: g.user_username,
    color: g.user_color || Colors.sakura,
    avatar: g.user_avatar,
    bio: g.user_bio,
    tagline: g.user_tagline,
    height: g.user_height,
    weight: g.user_weight,
    age: g.user_age,
    birthday: g.user_birthday,
    song: g.user_song,
    songLink: g.user_song_link,
    gallery: parseGallery(g.user_gallery),
    pageBgColor: g.user_page_bg_color,
    pageBgImage: g.user_page_bg_image,
    cardBgColor: g.user_card_bg_color,
    cardBgImage: g.user_card_bg_image,
    cardBgGradient: g.user_card_bg_gradient,
    cardTransparent: g.user_card_transparent === '1',
    textColor: g.user_text_color,
    borderStyle: g.user_border_style,
    nameFont: g.user_name_font,
    identifyFoId: g.user_identify_fo_id,
    flags: parseProfileFlags(g.user_flags),
  };
}

/** The card-theme slice, in the shape CardThemeSheet expects. */
export function meCardTheme(me: Me): CardTheme {
  return {
    pageBgColor: me.pageBgColor, pageBgImage: me.pageBgImage,
    cardBgColor: me.cardBgColor, cardBgImage: me.cardBgImage,
    cardBgGradient: me.cardBgGradient, cardTransparent: me.cardTransparent,
    textColor: me.textColor, borderStyle: me.borderStyle, nameFont: me.nameFont,
  };
}

const THEME_KEYS: Record<keyof CardTheme, string> = {
  pageBgColor: 'user_page_bg_color', pageBgImage: 'user_page_bg_image',
  cardBgColor: 'user_card_bg_color', cardBgImage: 'user_card_bg_image',
  cardBgGradient: 'user_card_bg_gradient', cardTransparent: 'user_card_transparent',
  textColor: 'user_text_color', borderStyle: 'user_border_style', nameFont: 'user_name_font',
};

const FIELD_KEYS: Partial<Record<keyof Me, string>> = {
  name: 'user_name', pronouns: 'user_pronouns', username: 'user_username',
  color: 'user_color', avatar: 'user_avatar', bio: 'user_bio', tagline: 'user_tagline',
  height: 'user_height', weight: 'user_weight', age: 'user_age', birthday: 'user_birthday', song: 'user_song', songLink: 'user_song_link',
  identifyFoId: 'user_identify_fo_id',
};

/** Persists any slice of `me`. Booleans store as '1'/'' and lists as JSON, matching settings. */
export function saveMe(patch: Partial<Me>) {
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'flags') { saveGlobalSetting('user_flags', JSON.stringify(v)); continue; }
    if (k === 'gallery') { saveGlobalSetting('user_gallery', JSON.stringify(v)); continue; }
    const themeKey = THEME_KEYS[k as keyof CardTheme];
    const fieldKey = FIELD_KEYS[k as keyof Me];
    const key = themeKey ?? fieldKey;
    if (!key) continue;
    saveGlobalSetting(key, typeof v === 'boolean' ? (v ? '1' : '') : ((v as string) ?? ''));
  }
}
