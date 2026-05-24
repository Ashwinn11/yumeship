import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Sparkle, QuoteMark, Heart } from '@/deco';

export default function Scenarios() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.emptyTile}>
          <Text style={[styles.watermark, { color: colors.lavenderDeep }]}>話</Text>
          <View style={styles.sparkleA}><Sparkle size={11} color={colors.lavenderDeep} /></View>
          <View style={styles.sparkleB}><Sparkle size={7} color={colors.lavenderDeep} opacity={0.6} /></View>

          <View style={[styles.iconCircle, { borderColor: colors.lavenderDeep + '80' }]}>
            <QuoteMark size={36} color={colors.lavenderDeep} />
          </View>

          <Text style={[styles.emptyTitle, { color: colors.lavenderDeep }]}>no scenarios written.</Text>
          <Text style={styles.emptyQuote}>
            "what would happen if she walked into the room right now?"
          </Text>

          <Pressable style={[styles.cta, { backgroundColor: colors.lavenderDeep }]}>
            <Heart size={11} color={colors.vellum} />
            <Text style={styles.ctaText}>start with a prompt</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  container: { flex: 1, padding: spacing.s4, justifyContent: 'center' },
  emptyTile: {
    padding: spacing.s7,
    paddingTop: spacing.s6,
    backgroundColor: colors.lavenderSoft,
    borderWidth: 1, borderColor: colors.lavenderDeep + '40',
    borderRadius: radii.r4,
    position: 'relative', overflow: 'hidden',
    alignItems: 'center',
    ...shadows.sm,
  },
  watermark: {
    position: 'absolute', top: -10, right: -8,
    fontSize: 84, lineHeight: 84,
    fontFamily: 'KleeOne', fontWeight: '600',
    opacity: 0.1,
  },
  sparkleA: { position: 'absolute', top: 14, left: 16 },
  sparkleB: { position: 'absolute', top: 30, left: 28 },
  iconCircle: {
    width: 76, height: 76, borderRadius: radii.pill,
    backgroundColor: colors.vellum,
    borderWidth: 1.5, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.s2, marginBottom: spacing.s4,
  },
  emptyTitle: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 22, lineHeight: 24, letterSpacing: -0.1,
    marginBottom: spacing.s2,
  },
  emptyQuote: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 13, color: colors.ink2, lineHeight: 20,
    textAlign: 'center', marginBottom: spacing.s4,
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.s5, paddingVertical: spacing.s2,
    borderRadius: radii.pill,
    ...shadows.sm,
  },
  ctaText: { color: colors.vellum, fontSize: 12, fontWeight: '600' },
});
