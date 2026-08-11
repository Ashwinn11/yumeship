import { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Radius } from '@/constants/theme';

/**
 * A single pulsing placeholder block. Guidance for content that takes 1–3s to
 * arrive (a feed page, a profile) is a skeleton matching the real layout, not a
 * spinner — a spinner communicates "something is happening" where a skeleton
 * communicates "this is what's coming."
 */
export function SkeletonBlock({ style }: { style?: ViewStyle }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.block, style, animatedStyle]} />;
}

const styles = StyleSheet.create({
  block: { backgroundColor: Colors.line, borderRadius: Radius.r2 },
});
