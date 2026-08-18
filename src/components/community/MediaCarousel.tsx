import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import type { PostMedia } from '@/store/community';

import { DoubleTapLike } from './DoubleTapLike';

type Props = {
  media: PostMedia[];
  /** feed/profile use the small thumbnail; detail uses the full photo */
  variant: 'thumb' | 'full';
  likedByMe: boolean;
  onDoubleTap: () => void;
  /** feed only — a plain single tap opens the post; detail has nowhere
   * further to go, so it's omitted there */
  onSingleTap?: () => void;
  aspectRatio?: number;
};

const keyExtractor = (m: PostMedia, i: number) => m.url || String(i);

function uriFor(m: PostMedia, variant: Props['variant']): string {
  return variant === 'thumb' ? m.thumbnailUrl || m.url : m.url;
}

/**
 * One photo fills the frame at a time, swipe for the next — not a grid or a
 * strip. Rendered through a FlatList rather than a mapped ScrollView, so only
 * the current (and adjacent) page ever mounts: a 4-photo post costs about one
 * photo's worth of network and decode, not all four up front regardless of
 * whether anyone swipes to see them.
 *
 * Sizing is measured pixels, never the `aspectRatio` CSS property against a
 * percentage width — that combination silently fails to resolve a height
 * inside a flex row (see PostCard's media fix), so it's avoided here from
 * the start rather than risking the same failure in a new place.
 */
export function MediaCarousel({ media, variant, likedByMe, onDoubleTap, onSingleTap, aspectRatio = 4 / 3 }: Props) {
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const height = width / aspectRatio;

  const handleDoubleTap = useCallback(() => {
    if (!likedByMe) onDoubleTap();
  }, [likedByMe, onDoubleTap]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PostMedia>) => {
      const uri = uriFor(item, variant);
      return (
        <DoubleTapLike style={[styles.page, { width, height }]} onSingleTap={onSingleTap} onDoubleTap={handleDoubleTap}>
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" recyclingKey={uri} {...MEDIA_IMAGE} />
        </DoubleTapLike>
      );
    },
    [variant, width, height, onSingleTap, handleDoubleTap],
  );

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 &&
        (media.length === 1 ? (
          <DoubleTapLike style={[styles.page, { width, height }]} onSingleTap={onSingleTap} onDoubleTap={handleDoubleTap}>
            <Image
              source={{ uri: uriFor(media[0], variant) }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              recyclingKey={uriFor(media[0], variant)}
              {...MEDIA_IMAGE}
            />
          </DoubleTapLike>
        ) : (
          <>
            <FlatList
              data={media}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialNumToRender={1}
              windowSize={2}
              maxToRenderPerBatch={1}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            />
            <View style={styles.countBadge} pointerEvents="none">
              <Text style={styles.countText}>{page + 1}/{media.length}</Text>
            </View>
          </>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { borderRadius: Radius.r3, backgroundColor: Colors.paperDeep, overflow: 'hidden' },
  countBadge: {
    position: 'absolute', top: 8, right: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  countText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: '#fff' },
});
