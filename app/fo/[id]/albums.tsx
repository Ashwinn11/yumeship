import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { QuoteMark } from '@/deco';

export default function Albums() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <QuoteMark size={36} color={colors.lavenderDeep} />
        </View>
        <Text style={styles.emptyTitle}>no albums yet.</Text>
        <Text style={styles.emptyQuote}>"Add your first memory"</Text>
        <Pressable style={styles.emptyCta}>
          <Text style={styles.emptyCtaText}>add photo</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.s7 },
  emptyIcon: {
    width: 76, height: 76, borderRadius: radii.pill,
    backgroundColor: colors.vellum,
    borderWidth: 1.5, borderColor: colors.lavenderDeep + '80', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.s3,
  },
  emptyTitle: { fontFamily: 'InstrumentSerif_Italic', fontSize: 22, color: colors.lavenderDeep, marginBottom: spacing.s2 },
  emptyQuote: { fontFamily: 'InstrumentSerif_Italic', fontSize: 13, color: colors.ink2, textAlign: 'center', lineHeight: 20, marginBottom: spacing.s4 },
  emptyCta: { paddingHorizontal: spacing.s5, paddingVertical: spacing.s2, backgroundColor: colors.lavenderDeep, borderRadius: radii.pill },
  emptyCtaText: { color: colors.vellum, fontSize: 12, fontWeight: '600' },
});
