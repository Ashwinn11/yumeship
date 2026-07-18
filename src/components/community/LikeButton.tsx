import { Pressable, StyleSheet, Text } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, sf } from '@/constants/theme';

type Props = {
  liked: boolean;
  count: number;
  onToggle: () => void;
  size?: number;
};

export function LikeButton({ liked, count, onToggle, size = 16 }: Props) {
  return (
    <Pressable style={styles.row} onPress={onToggle} hitSlop={8}>
      <Heart size={size} color={liked ? Colors.sakuraDeep : Colors.ink3} outline={!liked} />
      <Text style={[styles.count, liked && styles.countActive]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  count: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },
  countActive: { color: Colors.sakuraDeep },
});
