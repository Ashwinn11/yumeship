import type { ComponentType } from 'react';

import {
  StickerEnvelope, StickerHeartPatch, StickerPolaroid, StickerSakuraBranch,
  StickerSakuraFlower, StickerTicket, StickerWaxSeal,
} from '@/components/deco/Stickers';

// The built-in sticker set used by DecoBar (Love Letter / Storyline) and
// mirrored read-only in the Settings sticker collection screen.
export const BUILTIN_STICKERS: { key: string; label: string; El: ComponentType<{ size?: number }> }[] = [
  { key: 'envelope',     label: 'envelope',      El: StickerEnvelope },
  { key: 'sakura',       label: 'sakura branch', El: StickerSakuraBranch },
  { key: 'polaroid',     label: 'polaroid',      El: StickerPolaroid },
  { key: 'ticket',       label: 'ticket',        El: StickerTicket },
  { key: 'waxseal',      label: 'wax seal',      El: StickerWaxSeal },
  { key: 'heartpatch',   label: 'heart patch',   El: StickerHeartPatch },
  { key: 'sakuraflower', label: 'sakura flower', El: StickerSakuraFlower },
];
