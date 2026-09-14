/** A background design only — no text of its own. Users pick one and type
 *  their own text onto it (see EquippedBlinkie), same as picking a card color
 *  then typing a tagline, not a library of canned phrases to choose between.
 *  Every template is a real animation, not a static image — blinkies.cafe's
 *  own backgrounds are multi-frame GIFs (e.g. 0001-saucer-0.png,
 *  0001-saucer-1.png, ...), and frameCount + bgBase are how the Blinkie
 *  component cycles through them the same way. */
export type BlinkieTemplate = {
  id: string;
  /** filename prefix in assets/blinkies/ — frames are `${bgBase}-${i}.png` for i in [0, frameCount) */
  bgBase: string;
  frameCount: number;
  textColor: string;
};

/** One slot on a wall: which template, and the free text typed onto it. */
export type EquippedBlinkie = {
  templateId: string;
  text: string;
};

export const BLINKIE_TEXT_MAX = 20;

// Real pixel art from blinkies.cafe (GPL-3.0, see /LICENSE and /NOTICE.md).
// iheart/iheart2 are excluded — they have fixed text baked into the artwork
// itself, which would collide with whatever a user types on top. Character
// IP (game/show mascots), platform logos, and real-person likenesses from
// the source repo are excluded too — this is generic pattern/motif/flag art
// only, nothing that depicts someone else's franchise or identity.
export const BLINKIE_CATALOG: BlinkieTemplate[] = [
  { id: 'blinkie-0', bgBase: '0001-saucer', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-1', bgBase: '0002-mushroom', frameCount: 2, textColor: '#3d2a1a' },
  { id: 'blinkie-2', bgBase: '0003-ghost', frameCount: 2, textColor: '#2d2d3d' },
  { id: 'blinkie-3', bgBase: '0004-peachy', frameCount: 2, textColor: '#7a2d52' },
  { id: 'blinkie-4', bgBase: '0005-citystars', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-5', bgBase: '0006-purple', frameCount: 2, textColor: '#3d1a5c' },
  { id: 'blinkie-6', bgBase: '0007-chocolate', frameCount: 2, textColor: '#f0dcc0' },
  { id: 'blinkie-7', bgBase: '0008-pink', frameCount: 2, textColor: '#7a2d52' },
  { id: 'blinkie-8', bgBase: '0009-gradient-pink', frameCount: 2, textColor: '#7a2d52' },
  { id: 'blinkie-9', bgBase: '0010-blue', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-10', bgBase: '0011-frog', frameCount: 2, textColor: '#1a3d1a' },
  { id: 'blinkie-11', bgBase: '0012-kiss', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-12', bgBase: '0013-starryeyes', frameCount: 3, textColor: '#ffffff' },
  { id: 'blinkie-13', bgBase: '0016-valentine', frameCount: 2, textColor: '#7a1a1a' },
  { id: 'blinkie-14', bgBase: '0017-love', frameCount: 8, textColor: '#ffffff' },
  { id: 'blinkie-15', bgBase: '0018-glitter', frameCount: 3, textColor: '#5c4400' },
  { id: 'blinkie-16', bgBase: '0019-candy', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-17', bgBase: '0023-trans-pride', frameCount: 5, textColor: '#2d3a5c' },
  { id: 'blinkie-18', bgBase: '0024-red', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-19', bgBase: '0025-birthdaycake', frameCount: 4, textColor: '#ffffff' },
  { id: 'blinkie-20', bgBase: '0027-sakura', frameCount: 4, textColor: '#a13a5c' },
  { id: 'blinkie-21', bgBase: '0029-pinksparkle', frameCount: 2, textColor: '#7a2d52' },
  { id: 'blinkie-22', bgBase: '0030-catpaw', frameCount: 2, textColor: '#7a2d52' },
  { id: 'blinkie-23', bgBase: '0031-dogpaw', frameCount: 2, textColor: '#5c3d1a' },
  { id: 'blinkie-24', bgBase: '0032-coffeecup', frameCount: 2, textColor: '#f0dcc0' },
  { id: 'blinkie-25', bgBase: '0036-fire', frameCount: 4, textColor: '#ffffff' },
  { id: 'blinkie-26', bgBase: '0039-staticrainbow', frameCount: 8, textColor: '#ffffff' },
  { id: 'blinkie-27', bgBase: '0040-gemini', frameCount: 2, textColor: '#3d3d1a' },
  { id: 'blinkie-28', bgBase: '0041-aquarius', frameCount: 2, textColor: '#1a3d5c' },
  { id: 'blinkie-29', bgBase: '0042-aries', frameCount: 2, textColor: '#7a1a1a' },
  { id: 'blinkie-30', bgBase: '0043-taurus', frameCount: 2, textColor: '#3d5c2d' },
  { id: 'blinkie-31', bgBase: '0044-hearts', frameCount: 3, textColor: '#a13a5c' },
  { id: 'blinkie-32', bgBase: '0045-scorpio', frameCount: 2, textColor: '#5c1a1a' },
  { id: 'blinkie-33', bgBase: '0046-leo', frameCount: 2, textColor: '#5c4400' },
  { id: 'blinkie-34', bgBase: '0047-virgo', frameCount: 2, textColor: '#3d5c2d' },
  { id: 'blinkie-35', bgBase: '0048-libra', frameCount: 2, textColor: '#1a3d5c' },
  { id: 'blinkie-36', bgBase: '0049-sagittarius', frameCount: 2, textColor: '#5c2d1a' },
  { id: 'blinkie-37', bgBase: '0050-capricorn', frameCount: 2, textColor: '#2d2d3d' },
  { id: 'blinkie-38', bgBase: '0051-pisces', frameCount: 2, textColor: '#1a3d5c' },
  { id: 'blinkie-39', bgBase: '0052-cancer', frameCount: 2, textColor: '#5c4400' },
  { id: 'blinkie-40', bgBase: '0053-pinkchecker', frameCount: 2, textColor: '#7a2d52' },
  { id: 'blinkie-41', bgBase: '0055-rainbowswirl', frameCount: 10, textColor: '#ffffff' },
  { id: 'blinkie-42', bgBase: '0057-ophiuchus', frameCount: 2, textColor: '#1a3d5c' },
  { id: 'blinkie-43', bgBase: '0062-flower', frameCount: 2, textColor: '#3d5c2d' },
  { id: 'blinkie-44', bgBase: '0065-bunnies', frameCount: 6, textColor: '#7a2d52' },
  { id: 'blinkie-45', bgBase: '0066-orangekitty', frameCount: 2, textColor: '#5c2d1a' },
  { id: 'blinkie-46', bgBase: '0067-moonstars', frameCount: 5, textColor: '#ffffff' },
  { id: 'blinkie-47', bgBase: '0070-lavalamp', frameCount: 10, textColor: '#ffffff' },
  { id: 'blinkie-48', bgBase: '0071-bi', frameCount: 5, textColor: '#ffffff' },
  { id: 'blinkie-49', bgBase: '0072-lesbian', frameCount: 5, textColor: '#5c1a10' },
  { id: 'blinkie-50', bgBase: '0073-gay', frameCount: 4, textColor: '#1a1a1a' },
  { id: 'blinkie-51', bgBase: '0074-pan', frameCount: 3, textColor: '#1a1a3d' },
  { id: 'blinkie-52', bgBase: '0079-nonbinary', frameCount: 4, textColor: '#1a1a3d' },
  { id: 'blinkie-53', bgBase: '0093-cats', frameCount: 2, textColor: '#3d1a5c' },
  { id: 'blinkie-54', bgBase: '0104-redsnowflake', frameCount: 4, textColor: '#ffffff' },
  { id: 'blinkie-55', bgBase: '0105-gradientpurple', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-56', bgBase: '0107-gradientorange', frameCount: 2, textColor: '#5c2d1a' },
  { id: 'blinkie-57', bgBase: '0109-gradientgreen', frameCount: 2, textColor: '#1a3d1a' },
  { id: 'blinkie-58', bgBase: '0111-glittergold', frameCount: 3, textColor: '#5c4400' },
  { id: 'blinkie-59', bgBase: '0119-pastelstars', frameCount: 4, textColor: '#1a3d5c' },
  { id: 'blinkie-60', bgBase: '0124-stars', frameCount: 6, textColor: '#ffffff' },
  { id: 'blinkie-61', bgBase: '0189-whale', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-62', bgBase: '0226-snowflake', frameCount: 3, textColor: '#1a3d5c' },
  { id: 'blinkie-63', bgBase: '0229-roses', frameCount: 2, textColor: '#ffffff' },
  { id: 'blinkie-64', bgBase: '0236-pastelshootingstar', frameCount: 4, textColor: '#7a2d52' },
  { id: 'blinkie-65', bgBase: '0247-pinkheart', frameCount: 2, textColor: '#7a2d52' },
  { id: 'blinkie-66', bgBase: '0251-pastelpinkbutterfly', frameCount: 2, textColor: '#7a2d52' },
  { id: 'blinkie-67', bgBase: '0254-strawberrygradient', frameCount: 2, textColor: '#ffffff' },
];

export const BLINKIE_BY_ID: Record<string, BlinkieTemplate> = Object.fromEntries(
  BLINKIE_CATALOG.map((b) => [b.id, b]),
);

export const BLINKIE_WALL_MAX = 8;

/** how many a free account can have equipped at once — the second slot is the paywall */
export const BLINKIE_FREE_WALL_MAX = 1;
