import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, sf } from '@/constants/theme';

type Props = {
  liked: boolean;
  count: number;
  onToggle: () => void;
  size?: number;
};

export function LikeButton({ liked, count, onToggle, size = 16 }: Props) {
  const scale = useSharedValue(1);
  // first render shouldn't pop — only react to a change the user (or realtime) made
  const mounted = useSharedValue(false);

  useEffect(() => {
    if (!mounted.value) {
      mounted.value = true;
      return;
    }
    scale.value = liked
      ? withSequence(
          withTiming(0.8, { duration: 90 }),
          withSpring(1, { damping: 5, stiffness: 260, mass: 0.5 }),
        )
      : withSpring(1, { damping: 14, stiffness: 220 });
  }, [liked]);

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable style={styles.row} onPress={onToggle} hitSlop={10}>
      <Animated.View style={heartStyle}>
        <Heart size={size} color={liked ? Colors.sakuraDeep : Colors.ink3} outline={!liked} />
      </Animated.View>
      <Text style={[styles.count, liked && styles.countActive]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  count: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },
  countActive: { color: Colors.sakuraDeep },
});
