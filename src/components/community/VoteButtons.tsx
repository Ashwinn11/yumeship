import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Colors, FontFamily, sf } from '@/constants/theme';

// same shaft + chevron language as the comment composer's send icon
// (social/post/[id].tsx), just reusable and flippable for up/down
function Arrow({ size, color, flip }: { size: number; color: string; flip?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" style={flip ? styles.flip : undefined}>
      <Path
        d="M8 13V3M8 3L3.8 7.2M8 3l4.2 4.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

type Props = {
  score: number;
  myVote: -1 | 0 | 1;
  onVote: (direction: -1 | 1) => void;
  size?: number;
};

/** Up/down vote control for an activity prompt — one vote per person, tapping the active direction again clears it. */
export function VoteButtons({ score, myVote, onVote, size = 15 }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => onVote(1)} hitSlop={10} style={styles.btn}>
        <Arrow size={size} color={myVote === 1 ? Colors.sakuraDeep : Colors.ink3} />
      </Pressable>
      <Text style={[styles.score, myVote === 1 && styles.scoreUp, myVote === -1 && styles.scoreDown]}>{score}</Text>
      <Pressable onPress={() => onVote(-1)} hitSlop={10} style={styles.btn}>
        <Arrow size={size} color={myVote === -1 ? Colors.lavenderDeep : Colors.ink3} flip />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btn: { padding: 2 },
  score: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ink3, minWidth: sf(20), textAlign: 'center' },
  scoreUp: { color: Colors.sakuraDeep },
  scoreDown: { color: Colors.lavenderDeep },
  flip: { transform: [{ rotate: '180deg' }] },
});
