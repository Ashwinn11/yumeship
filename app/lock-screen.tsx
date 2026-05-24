import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/tokens/theme';

type Props = { onUnlock: () => void };

export default function LockScreen({ onUnlock }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>yumeship</Text>
      <Text style={styles.sub}>夢 · ゆめしっぷ</Text>
      <Pressable style={styles.btn} onPress={onUnlock}>
        <Text style={styles.btnText}>unlock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s4,
  },
  title: {
    fontFamily: 'serif',
    fontSize: fontSize.h2,
    fontStyle: 'italic',
    color: colors.ink,
    letterSpacing: -1,
  },
  sub: {
    fontSize: fontSize.meta,
    color: colors.ink3,
    letterSpacing: 4,
  },
  btn: {
    marginTop: spacing.s6,
    paddingHorizontal: spacing.s8,
    paddingVertical: spacing.s3,
    backgroundColor: colors.sakuraDeep,
    borderRadius: radii.pill,
  },
  btnText: {
    color: colors.vellum,
    fontSize: fontSize.body,
    fontWeight: '600',
  },
});
