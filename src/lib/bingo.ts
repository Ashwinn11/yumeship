// Shared bingo logic — the post composer's create-from-scratch attachment and
// the read-only feed/detail card both draw on this, so a posted card and the
// "use this template" flow that marks a copy of it never drift apart.

export type BingoCell = { text: string; free: boolean; marked: boolean };

/** A board's full visual identity — the part that survives a "use this template" clone. */
export type BingoStyle = {
  markerKey: string;
  /** only meaningful when markerKey === 'custom' */
  markerImageUri: string;
  bgColor: string;
  bgImage: string;
};

export type BingoCard = BingoStyle & { cells: BingoCell[] };

// F/O = "Fictional Other," the shipping-community term for the character
// someone yumeships with. This is a checklist about that relationship, not a
// log of moments that happened — "how much of this is true for you and them."
export const POOL = [
  'made an au for them', 'sketched fanart of the two of you', 'paid an artist to draw them', 'built a whole moodboard for this',
  "made a playlist that's basically theirs", 'written a scenario starring them', "owns merch that's basically theirs now", 'made an OC just to stand in for you',
  'has headcanons nobody asked for', 'has a dedicated shelf corner for them', 'together over a year now', 'wasn\'t serious about this at first',
  'has a nickname only they get', 'dreamed about them, no shame', 'loves more than one F/O', 'this yumeship happens to be queer',
  '"married" in your heart, no ring needed', 'happy ending, no notes', 'picked the sad ending on purpose', 'talks to them like they\'re in the room',
  'F/O is criminally underrated', 'F/O already has a huge fandom', 'ship is niche — nobody else gets it', "canon ship isn't yours, and that's fine",
  "found them through someone else's fanart", 'rewatched the source just for them', 'fully open sharing, ask away', 'selective sharing, close friends only',
  'keeping this one private', 'has friends who ship right along with you', 'posted about them before', 'got asked "wait, who?" more than once',
  'thinks of them at the most random times', 'has a song that\'s "theirs"', 'saw something and thought of them', 'imagined introducing them to your friends',
];

// The glyph shown on a marked square (and, bigger, on the free centre square).
// Plain dingbat characters — not emoji — so the `color` style can still tint
// them.
export const MARKERS: { key: string; glyph: string }[] = [
  { key: 'heart', glyph: '♥' },
  { key: 'star', glyph: '★' },
  { key: 'sparkle', glyph: '✦' },
  { key: 'flower', glyph: '✿' },
  { key: 'check', glyph: '✓' },
  { key: 'diamond', glyph: '◆' },
];
export const DEFAULT_MARKER_KEY = 'heart';

export function markerGlyph(key: string): string {
  return MARKERS.find((m) => m.key === key)?.glyph ?? MARKERS[0].glyph;
}

export function defaultBingoStyle(): BingoStyle {
  return { markerKey: DEFAULT_MARKER_KEY, markerImageUri: '', bgColor: '', bgImage: '' };
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeBingoCells(): BingoCell[] {
  const picks = shuffle(POOL).slice(0, 24);
  const cells: BingoCell[] = [];
  let p = 0;
  for (let i = 0; i < 25; i++) {
    // free centre carries no text of its own — it only ever shows the chosen marker
    if (i === 12) cells.push({ text: '', free: true, marked: true });
    else cells.push({ text: picks[p++], free: false, marked: false });
  }
  return cells;
}

/**
 * A cloned copy for "use this template": same 25 prompts and the same visual
 * style, every mark wiped except the free centre — the whole point being
 * that the person who taps this starts from zero, not from the OP's board.
 */
export function clearBingoMarks(cells: BingoCell[]): BingoCell[] {
  return cells.map((c) => ({ ...c, marked: c.free }));
}
