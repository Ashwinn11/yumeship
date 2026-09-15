import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MEDIA_IMAGE } from '@/lib/imageProps';
import { FontFamily, Radius, sf } from '@/constants/theme';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;

type Photo = { uri: string };

function ZoomablePage({
  uri,
  width,
  height,
  onZoomChange,
  onRequestClose,
}: {
  uri: string;
  width: number;
  height: number;
  onZoomChange: (zoomed: boolean) => void;
  onRequestClose: () => void;
}) {
  // local, in addition to the parent's onZoomChange — gesture objects are
  // plain JS rebuilt every render, so `pan.enabled(isZoomed)` below is what
  // actually stops the pan recognizer from ever claiming the touch (and
  // starving the outer FlatList's native swipe) while sitting at scale 1
  const [isZoomed, setIsZoomed] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const setZoomed = useCallback(
    (v: boolean) => {
      setIsZoomed(v);
      onZoomChange(v);
    },
    [onZoomChange],
  );

  const reset = useCallback(() => {
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setZoomed(false);
  }, [setZoomed, scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), MAX_ZOOM);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        runOnJS(reset)();
      } else {
        runOnJS(setZoomed)(true);
      }
    });

  // enabled(isZoomed): with pan always-on, RNGH claims every drag on this
  // page before the outer FlatList's native scroll responder ever sees it,
  // which silently eats the swipe-between-photos gesture at scale 1
  const pan = Gesture.Pan()
    .enabled(isZoomed)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > 1) {
        runOnJS(reset)();
        return;
      }
      scale.value = withTiming(DOUBLE_TAP_ZOOM);
      savedScale.value = DOUBLE_TAP_ZOOM;
      runOnJS(setZoomed)(true);
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .requireExternalGestureToFail(doubleTap)
    .onEnd(() => {
      runOnJS(onRequestClose)();
    });

  const composed = Gesture.Simultaneous(Gesture.Exclusive(doubleTap, singleTap), Gesture.Simultaneous(pinch, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedImage
          source={{ uri }}
          style={[{ width, height }, animatedStyle]}
          contentFit="contain"
          {...MEDIA_IMAGE}
        />
      </View>
    </GestureDetector>
  );
}

type Props = {
  visible: boolean;
  photos: Photo[];
  /** which photo to open on */
  initialIndex?: number;
  onClose: () => void;
};

/**
 * Full-screen lightbox — pinch/double-tap to zoom, pan while zoomed, swipe
 * between photos while not zoomed, single tap or the ✕ to dismiss. Shared
 * across posts, activity responses, group chat, and vault chat rather than
 * each screen growing its own bespoke tap-to-view handling.
 */
export function PhotoViewer({ visible, photos, initialIndex = 0, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <FlatList
          data={photos}
          keyExtractor={(p: Photo, i: number) => p.uri || String(i)}
          horizontal
          pagingEnabled
          scrollEnabled={!zoomed}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(e) => {
            const next = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(next);
            setZoomed(false);
          }}
          renderItem={({ item, index: i }: { item: Photo; index: number }) => (
            <ZoomablePage
              uri={item.uri}
              width={width}
              height={height}
              onZoomChange={i === index ? setZoomed : () => {}}
              onRequestClose={onClose}
            />
          )}
        />

        <Pressable style={[styles.closeBtn, { top: insets.top + 10 }]} onPress={onClose} hitSlop={10}>
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>

        {photos.length > 1 && (
          <View style={[styles.counter, { bottom: insets.bottom + 16 }]} pointerEvents="none">
            <Text style={styles.counterTxt}>{index + 1}/{photos.length}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000' },
  closeBtn: {
    position: 'absolute', right: 16,
    width: 34, height: 34, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontFamily: FontFamily.ui, fontSize: sf(15), color: '#fff', lineHeight: sf(16) },
  counter: {
    position: 'absolute', alignSelf: 'center',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  counterTxt: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: '#fff' },
});
