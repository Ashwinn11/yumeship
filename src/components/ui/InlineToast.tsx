import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { FontFamily, Radius, Spacing, sf } from '@/constants/theme';

const VISIBLE_MS = 2200;

type Props = {
  /** re-shown each time this changes to a non-empty string, so the same message can repeat */
  message: string;
  /** bump to force a re-show of the same message twice in a row */
  nonce?: number;
};

/**
 * A brief, dismiss-itself failure notice for actions that revert silently
 * otherwise — a like or follow that bounces back with no explanation reads as a
 * broken button, not a rejected request.
 *
 * Absolutely positioned by the caller (top or bottom of the screen); this only
 * owns the fade/slide and auto-hide.
 */
export function InlineToast({ message, nonce }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    if (!message) return;
    opacity.value = withSequence(
      withTiming(1, { duration: 160 }),
      withDelay(VISIBLE_MS, withTiming(0, { duration: 220 })),
    );
    translateY.value = withTiming(0, { duration: 160 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, nonce]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  return (
    <Animated.View style={[styles.wrap, style]} pointerEvents="none">
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

/** State + trigger for InlineToast. `nonce` lets the same string re-show twice in a row. */
export function useInlineToast() {
  const [message, setMessage] = useState('');
  const [nonce, setNonce] = useState(0);
  const show = useCallback((m: string) => {
    setMessage(m);
    setNonce((n) => n + 1);
  }, []);
  return { message, nonce, show };
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    backgroundColor: 'rgba(31,18,25,0.92)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.s4,
    paddingVertical: 9,
    maxWidth: '86%',
  },
  text: { fontFamily: FontFamily.uiMedium, fontSize: sf(12.5), color: '#fff', textAlign: 'center' },
});
