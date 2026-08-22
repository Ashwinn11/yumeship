import { useState } from 'react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { MAX_IMAGES, type LocalPickedMedia } from '@/store/community';

function ImageIcon({ size = 22, color = Colors.ink3 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M2 3.5C2 2.7 2.7 2 3.5 2h9c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-9C2.7 14 2 13.3 2 12.5v-9z" stroke={color} strokeWidth={1.2} />
      <Circle cx="5.6" cy="6" r="1.1" stroke={color} strokeWidth={1.1} />
      <Path d="M2.5 11.5l3.3-3.3c.4-.4 1-.4 1.4 0L8 9l2.3-2.3c.4-.4 1-.4 1.4 0l2 2" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function isGifAsset(a: ImagePicker.ImagePickerAsset): boolean {
  return a.mimeType === 'image/gif' || a.uri.toLowerCase().endsWith('.gif');
}

/**
 * The system photo picker can't be restricted to "stills only" or "gifs
 * only" — there is no such OS-level filter — so instead of rejecting a
 * selection that doesn't match whichever button opened it, this just reads
 * the real type off each asset and routes it correctly. A gif picked from
 * "add photos" quietly becomes the post's one gif; a still picked from the
 * gif button quietly becomes a normal photo. Nothing is ever turned away.
 *
 * `existing` is merged in rather than replaced — picking again (the "add
 * more" row, or re-tapping the toolbar button) adds to what's already
 * attached, up to MAX_IMAGES, deduping anything picked twice. A gif always
 * replaces outright, since it's a single exclusive attachment.
 */
export function mediaFromAssets(
  assets: ImagePicker.ImagePickerAsset[],
  existing: LocalPickedMedia[] = [],
): LocalPickedMedia[] {
  const stills = assets.filter((a) => !isGifAsset(a));
  if (stills.length > 0) {
    const newStills = stills.map((a) => ({ type: 'image' as const, uri: a.uri, width: a.width ?? 0, height: a.height ?? 0 }));
    const merged = [...existing.filter((m) => m.type === 'image'), ...newStills];
    const deduped = merged.filter((m, i) => merged.findIndex((x) => x.uri === m.uri) === i);
    return deduped.slice(0, MAX_IMAGES);
  }
  const gif = assets[0];
  return gif ? [{ type: 'gif' as const, uri: gif.uri, width: gif.width ?? 0, height: gif.height ?? 0 }] : existing;
}

type Props = {
  media: LocalPickedMedia[];
  onChange: (media: LocalPickedMedia[]) => void;
};

const SINGLE_ASPECT = 4 / 3;
// 2/3/4-photo grids read shorter and wider than a single full photo, same as
// Twitter/Instagram's compose grid — this is the ratio of that shorter box.
const GRID_HEIGHT_RATIO = 0.62;

function Tile({
  uri,
  isGif,
  style,
  onRemove,
}: {
  uri: string;
  isGif: boolean;
  style: StyleProp<ViewStyle>;
  onRemove: () => void;
}) {
  return (
    <View style={[styles.tile, style]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      {isGif && (
        <View style={styles.gifBadge}>
          <Text style={styles.gifBadgeText}>GIF</Text>
        </View>
      )}
      <Pressable style={styles.removeBadge} onPress={onRemove} hitSlop={8}>
        <Text style={styles.removeText}>✕</Text>
      </Pressable>
    </View>
  );
}

/**
 * Mirrors Twitter/Instagram's compose grid: every attached photo is visible
 * at once, sized by count (1 full-width, 2 side by side, 3 one-large-two-
 * stacked, 4 in a 2x2), each large enough to actually see and each with its
 * own remove button — rather than a swipeable pager, which would hide
 * photos behind a swipe while still deciding what to post. Swiping is for
 * viewing a published post (`MediaCarousel`), not composing one.
 */
export function MediaComposer({ media, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const hasGif = media.some((m) => m.type === 'gif');

  async function pickImages() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_IMAGES - media.length),
      quality: 0.9,
    });
    if (res.canceled) return;
    onChange(mediaFromAssets(res.assets, media));
  }

  function removeItem(uri: string) {
    onChange(media.filter((m) => m.uri !== uri));
  }

  if (media.length === 0) return null;

  const singleHeight = width / SINGLE_ASPECT;
  const gridHeight = width * GRID_HEIGHT_RATIO;

  return (
    <View>
      <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && media.length === 1 && (
          <Tile
            uri={media[0].uri}
            isGif={media[0].type === 'gif'}
            style={{ width, height: singleHeight }}
            onRemove={() => removeItem(media[0].uri)}
          />
        )}

        {width > 0 && media.length === 2 && (
          <View style={[styles.row, { width, height: gridHeight }]}>
            {media.map((m) => (
              <Tile key={m.uri} uri={m.uri} isGif={false} style={styles.flexTile} onRemove={() => removeItem(m.uri)} />
            ))}
          </View>
        )}

        {width > 0 && media.length === 3 && (
          <View style={[styles.row, { width, height: gridHeight }]}>
            <Tile uri={media[0].uri} isGif={false} style={styles.flexTile} onRemove={() => removeItem(media[0].uri)} />
            <View style={[styles.col, styles.flexTile]}>
              <Tile uri={media[1].uri} isGif={false} style={styles.flexTile} onRemove={() => removeItem(media[1].uri)} />
              <Tile uri={media[2].uri} isGif={false} style={styles.flexTile} onRemove={() => removeItem(media[2].uri)} />
            </View>
          </View>
        )}

        {width > 0 && media.length >= 4 && (
          <View style={[styles.col, { width, height: gridHeight }]}>
            <View style={[styles.row, styles.flexTile]}>
              <Tile uri={media[0].uri} isGif={false} style={styles.flexTile} onRemove={() => removeItem(media[0].uri)} />
              <Tile uri={media[1].uri} isGif={false} style={styles.flexTile} onRemove={() => removeItem(media[1].uri)} />
            </View>
            <View style={[styles.row, styles.flexTile]}>
              <Tile uri={media[2].uri} isGif={false} style={styles.flexTile} onRemove={() => removeItem(media[2].uri)} />
              <Tile uri={media[3].uri} isGif={false} style={styles.flexTile} onRemove={() => removeItem(media[3].uri)} />
            </View>
          </View>
        )}
      </View>

      {/* a gif is a single, exclusive attachment — no "add more" once one is set */}
      {!hasGif && media.length < MAX_IMAGES && (
        <Pressable style={styles.addMoreBtn} onPress={pickImages}>
          <ImageIcon size={15} color={Colors.sakuraDeep} />
          <Text style={styles.addMoreText}>add more ({media.length}/{MAX_IMAGES})</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.r3, overflow: 'hidden', backgroundColor: Colors.paperDeep },
  row: { flexDirection: 'row', gap: 2 },
  col: { flexDirection: 'column', gap: 2 },
  flexTile: { flex: 1 },
  tile: { position: 'relative', backgroundColor: Colors.paperDeep },
  gifBadge: {
    position: 'absolute', left: 8, bottom: 8,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.r1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  gifBadgeText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(9), color: '#fff', letterSpacing: 0.4 },
  removeBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 24, height: 24, borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: sf(12), fontFamily: FontFamily.ui },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.pill, borderWidth: 1.2, borderColor: Colors.line, borderStyle: 'dashed',
    backgroundColor: Colors.paperDeep,
  },
  addMoreText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.sakuraDeep },
});
