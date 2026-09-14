import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { Polaroid } from '@/components/templates/primitives';
import { Colors, Spacing } from '@/constants/theme';
import type { GalleryPhoto } from '@/store/fo';
import { SectionLabel } from './SectionLabel';
import { SongDiscCard } from './SongDiscCard';
import type { ProfileSong } from './cardTheme';

const POLAROID_TAPES = [Colors.sakura, Colors.lavender, Colors.butter, Colors.sage, Colors.peach];
// galleryGrid's own paddingHorizontal:4 on each side, plus a couple px of
// rounding slack — without it, two cards computed to fill the row exactly
// come out a hair too wide and flexWrap quietly drops to one per row
const GALLERY_GRID_PADDING = 4 * 2 + 2;

/** Songs + gallery, as its own card below the profile hero (and below
 *  about) — both are card-shaped now (a spinning disc, a polaroid), two per
 *  row, sized to fill the row rather than a small fixed square with room to
 *  spare beside it. Renders nothing when both are empty. */
export function ProfileMediaGrid({ songs = [], gallery = [] }: { songs?: ProfileSong[]; gallery?: GalleryPhoto[] }) {
  // onLayout reports the grid's own border-box width — its horizontal padding
  // has to come out before dividing, or the computed card width is a few px
  // too wide for two to fit and flexWrap silently drops to one per row
  const [galleryWidth, setGalleryWidth] = useState(0);
  const onGalleryLayout = (e: LayoutChangeEvent) => setGalleryWidth(e.nativeEvent.layout.width);
  const galleryCardSize = galleryWidth ? (galleryWidth - GALLERY_GRID_PADDING - Spacing.s3) / 2 : 150;

  if (songs.length === 0 && gallery.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionLabel>scrapbook</SectionLabel>
      <View style={styles.galleryGrid} onLayout={onGalleryLayout}>
        {songs.map((s) => (
          <SongDiscCard key={s.id} song={s} size={galleryCardSize} />
        ))}
        {gallery.map((photo, i) => (
          <Polaroid
            key={`${photo.uri}-${i}`}
            uri={photo.uri}
            caption={photo.caption}
            size={galleryCardSize}
            rotate={0}
            tapeColor={POLAROID_TAPES[i % POLAROID_TAPES.length]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // this used to be a section inside ProfileCard's own gap-based wrapper —
  // now a sibling of it (and of AboutSection), it needs its own spacing
  section: { gap: 6, marginTop: Spacing.s5 },
  galleryGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing.s3, paddingVertical: 10, paddingHorizontal: 4,
  },
});
