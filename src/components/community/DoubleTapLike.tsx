import { useCallback } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Heart } from '@/components/deco/Heart';

type Props = {
  children: React.ReactNode;
  /** always fires the burst; caller decides whether to actually toggle (e.g. only like, never unlike) */
  onDoubleTap: () => void;
  /**
   * When set, a plain single tap fires this instead of being absorbed by the
   * gesture — the feed card needs its media to keep opening the post on a
   * normal tap. Omit on the post-detail screen, where media has no single-tap
   * action to preserve, so double-tap can be the only recognizer.
   */
  onSingleTap?: () => void;
  style?: ViewStyle;
};

const MAX_TAP_DELAY = 250;

/**
 * Standard feed gesture: double-tap the photo to like. The single/double
 * disambiguation is RNGH's documented pattern for this exact case —
 * `requireExternalGestureToFail` makes the single-tap wait up to
 * MAX_TAP_DELAY to see if a second tap turns it into a double-tap first. That
 * delay is only paid when onSingleTap is provided; the post-detail screen has
 * nothing competing with the double-tap there, so it skips the composition
 * entirely.
 */
export function DoubleTapLike({ children, onDoubleTap, onSingleTap, style }: Props) {
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);

  const playBurst = useCallback(() => {
    burstScale.value = 0;
    burstOpacity.value = withSequence(withTiming(1, { duration: 70 }), withTiming(0, { duration: 260 }));
    burstScale.value = withSequence(
      withSpring(1.15, { damping: 6, stiffness: 220, mass: 0.6 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
  }, []);

  const handleDoubleTap = useCallback(() => {
    playBurst();
    onDoubleTap();
  }, [playBurst, onDoubleTap]);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(MAX_TAP_DELAY)
    .onEnd(() => {
      runOnJS(handleDoubleTap)();
    });

  const gesture = onSingleTap
    ? Gesture.Exclusive(
        doubleTap,
        Gesture.Tap()
          .numberOfTaps(1)
          .maxDelay(MAX_TAP_DELAY)
          .requireExternalGestureToFail(doubleTap)
          .onEnd(() => {
            runOnJS(onSingleTap)();
          }),
      )
    : doubleTap;

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={style}>
        {children}
        <Animated.View style={[styles.burstWrap, burstStyle]} pointerEvents="none">
          <View style={styles.burstShadow}>
            <Heart size={72} color="#fff" />
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  burstWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  burstShadow: {
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
});
