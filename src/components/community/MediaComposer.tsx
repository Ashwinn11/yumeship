import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { FlatList, Pressable, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';
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

const keyExtractor = (m: LocalPickedMedia, i: number) => m.uri || String(i);
const ASPECT = 4 / 3;
// with more than one photo, the current one takes 84% of the width so the
// next one visibly peeks in at the edge — signals "there's more, swipe" the
// way a single edge-to-edge page never can. A lone photo just gets the full
// width, since there's nothing to peek at.
const PEEK_RATIO = 0.84;
const GAP = 10;

/**
 * Preview mirrors the real post's `MediaCarousel` sizing — big enough to
 * actually see, not a grid of small tiles — but peeks the next photo's edge
 * rather than going full-bleed one-per-page, so multiple attachments read as
 * swipeable instead of looking like a single flat photo. Each page carries
 * its own remove button; "add more" is a separate control below the
 * carousel rather than a tile inside it, since a picker affordance stretched
 * to post-preview size would look nothing like the button it's supposed to be.
 */
export function MediaComposer({ media, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const hasGif = media.some((m) => m.type === 'gif');
  const multi = media.length > 1;
  const itemWidth = multi ? width * PEEK_RATIO : width;
  const height = itemWidth / ASPECT;
  const stride = itemWidth + GAP;

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
    setPage(0);
  }

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<LocalPickedMedia>) => (
      <View style={[styles.page, { width: itemWidth, height, marginRight: multi ? GAP : 0 }]}>
        <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        {item.type === 'gif' && (
          <View style={styles.gifBadge}>
            <Text style={styles.gifBadgeText}>GIF</Text>
          </View>
        )}
        <Pressable style={styles.removeBadge} onPress={() => removeItem(item.uri)} hitSlop={8}>
          <Text style={styles.removeText}>✕</Text>
        </Pressable>
      </View>
    ),
    [itemWidth, height, multi],
  );

  if (media.length === 0) return null;

  return (
    <View>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 &&
          (media.length === 1 ? (
            renderItem({ item: media[0], index: 0 } as ListRenderItemInfo<LocalPickedMedia>)
          ) : (
            <>
              <FlatList
                data={media}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={stride}
                decelerationRate="fast"
                initialNumToRender={2}
                windowSize={3}
                maxToRenderPerBatch={2}
                getItemLayout={(_, i) => ({ length: stride, offset: stride * i, index: i })}
                onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / stride))}
              />
              <View style={styles.countBadge} pointerEvents="none">
                <Text style={styles.countText}>{page + 1}/{media.length}</Text>
              </View>
            </>
          ))}
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
  page: { borderRadius: Radius.r3, backgroundColor: Colors.paperDeep, overflow: 'hidden' },
  gifBadge: {
    position: 'absolute', left: 8, bottom: 8,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.r1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  gifBadgeText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(9), color: '#fff', letterSpacing: 0.4 },
  removeBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: sf(13), fontFamily: FontFamily.ui },
  countBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  countText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: '#fff' },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.pill, borderWidth: 1.2, borderColor: Colors.line, borderStyle: 'dashed',
    backgroundColor: Colors.paperDeep,
  },
  addMoreText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.sakuraDeep },
});
