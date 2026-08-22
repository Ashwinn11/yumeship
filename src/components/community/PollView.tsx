import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import type { Poll } from '@/store/community';

type Props = {
  poll: Poll;
  onVote: (optionIndex: number) => void;
};

/** Before voting: plain tappable rows. After: percentage bars, your pick outlined. */
export function PollView({ poll, onVote }: Props) {
  const total = poll.counts.reduce((sum, c) => sum + c, 0);
  const voted = poll.myVote !== null;

  return (
    <View style={styles.wrap}>
      {poll.options.map((label, i) => {
        const count = poll.counts[i] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const mine = poll.myVote === i;
        return (
          <Pressable key={i} onPress={() => onVote(i)} style={[styles.option, mine && styles.optionMine]}>
            {voted && (
              <View style={styles.track} pointerEvents="none">
                <View style={[styles.fill, { width: `${pct}%` }, mine && styles.fillMine]} />
              </View>
            )}
            <View style={styles.optionContent}>
              <Text style={[styles.optionLabel, mine && styles.optionLabelMine]} numberOfLines={1}>
                {label}
              </Text>
              {voted && (
                <Text style={[styles.optionPct, mine && styles.optionLabelMine]}>{pct}%</Text>
              )}
            </View>
          </Pressable>
        );
      })}
      {voted && (
        <Text style={styles.total}>{total} {total === 1 ? 'vote' : 'votes'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 4 },
  option: {
    height: 38, borderRadius: Radius.r3, borderWidth: 1.4, borderColor: Colors.line,
    backgroundColor: Colors.paperDeep, overflow: 'hidden',
  },
  optionMine: { borderColor: Colors.sakuraDeep },
  // a zero-padding overlay matching the option's exact bounds — the fill's
  // percentage width has to resolve against this, not the padded content row,
  // or 100% falls short of the real edge
  track: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  fill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: Colors.sakuraSoft,
  },
  fillMine: { backgroundColor: Colors.sakura },
  optionContent: {
    flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 12,
  },
  optionLabel: { flex: 1, fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ink2 },
  optionLabelMine: { color: Colors.sakuraInk },
  optionPct: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: Colors.ink3 },
  total: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, marginTop: 2 },
});
