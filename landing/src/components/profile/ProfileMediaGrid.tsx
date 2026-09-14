import { useEffect, useRef, useState } from 'react';

import { Colors } from '../../constants/theme';
import type { GalleryPhoto, ProfileSong } from '../../lib/profile';
import { Polaroid } from './Polaroid';
import { SectionLabel } from './SectionLabel';
import { SongDiscCard } from './SongDiscCard';

const POLAROID_TAPES = [Colors.sakura, Colors.lavender, Colors.butter, Colors.sage, Colors.peach];
const GALLERY_GAP = 14;

/** Songs + gallery, as their own block below the profile hero (and below
 *  about) — both are card-shaped now (a spinning disc, a polaroid), two per
 *  row, sized to fill the row rather than a small fixed square with room to
 *  spare beside it. Renders nothing when both are empty. */
export function ProfileMediaGrid({
  songs = [],
  gallery = [],
  textColor,
}: {
  songs?: ProfileSong[];
  gallery?: GalleryPhoto[];
  textColor?: string;
}) {
  // clientWidth already excludes the grid's own horizontal padding, unlike
  // RN's onLayout — no padding subtraction needed here.
  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryWidth, setGalleryWidth] = useState(0);
  useEffect(() => {
    if (!galleryRef.current) return;
    const update = () => setGalleryWidth(galleryRef.current?.clientWidth ?? 0);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, []);
  const galleryCardSize = galleryWidth ? (galleryWidth - GALLERY_GAP) / 2 : 110;

  if (songs.length === 0 && gallery.length === 0) return null;

  return (
    <div className="profile-section-block">
      <SectionLabel>scrapbook</SectionLabel>
      <div className="gallery-grid" ref={galleryRef}>
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
            textColor={textColor}
          />
        ))}
      </div>
    </div>
  );
}
