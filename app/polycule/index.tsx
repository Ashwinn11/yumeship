import React from 'react';
import { View, Text, Pressable, FlatList,
  StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Sparkle, Sakura, Heart } from '@/deco';
import { Mark } from '@/components';

const MOCK_POLYCULES = [
  {
    id: '1',
    name: 'The Hunters',
    members: ['Kafka', 'Silver Wolf', 'Blade'],
    notes: 'cosmic chaos and a lot of tension',
    tint: colors.plum,
  },
];

export default function PolyculeIndex() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Mark size={24} />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>polycules</Text>
          <Sakura size={16} color={colors.lavender} />
        </View>
        <Text style={styles.subtitle}>{MOCK_POLYCULES.length} constellation{MOCK_POLYCULES.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={MOCK_POLYCULES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/polycule/${item.id}` as any)}>
            <View style={[styles.card, { borderColor: item.tint + '40' }]}>
              <Text style={[styles.cardWatermark, { color: item.tint }]}>群</Text>

              <View style={styles.cardHeader}>
                <Sparkle size={11} color={item.tint} />
                <Text style={[styles.cardKind, { color: item.tint }]}>polycule</Text>
              </View>

              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMembers}>{item.members.join(' · ')}</Text>
              <Text style={styles.cardNotes}>{item.notes}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.cardCount}>{item.members.length} members</Text>
                <Text style={[styles.cardCta, { color: item.tint }]}>view ›</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable onPress={() => {}}>
            <View style={styles.addCard}>
              <Text style={styles.addCardJa}>群</Text>
              <Heart size={20} color={colors.line} outline />
              <Text style={styles.addCardText}>start a new constellation</Text>
            </View>
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.s5, paddingTop: spacing.s4, paddingBottom: spacing.s3 },
  headerRow: { paddingVertical: spacing.s2 },
  titleRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.s2,
    marginTop: spacing.s3, marginBottom: spacing.s1,
  },
  title: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 34, lineHeight: 32, letterSpacing: -0.5, color: colors.ink,
  },
  subtitle: {
    fontFamily: 'JetBrainsMono', fontSize: 10, color: colors.ink3,
    letterSpacing: 1.2, marginBottom: spacing.s2,
  },

  list: { paddingHorizontal: spacing.s4, gap: spacing.s3, paddingBottom: spacing.s6 },

  card: {
    backgroundColor: colors.vellum,
    borderWidth: 1,
    borderRadius: radii.r4,
    padding: spacing.s5,
    position: 'relative', overflow: 'hidden',
    ...shadows.sm,
  },
  cardWatermark: {
    position: 'absolute', right: -8, top: -14,
    fontSize: 72, lineHeight: 72,
    fontFamily: 'KleeOne', fontWeight: '600',
    opacity: 0.08,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2, marginBottom: spacing.s2 },
  cardKind: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '600',
  },
  cardName: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 22, lineHeight: 24, color: colors.ink, marginBottom: 2,
  },
  cardMembers: {
    fontFamily: 'JetBrainsMono',
    fontSize: 10, color: colors.ink2, letterSpacing: 0.4, marginBottom: spacing.s2,
  },
  cardNotes: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 13, color: colors.ink2, lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.s3,
  },
  cardCount: { fontFamily: 'JetBrainsMono', fontSize: 9, color: colors.ink3 },
  cardCta: { fontSize: 11, fontWeight: '600' },

  addCard: {
    borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed',
    borderRadius: radii.r4,
    padding: spacing.s5,
    alignItems: 'center', gap: spacing.s3,
    backgroundColor: colors.paperDeep,
    position: 'relative', overflow: 'hidden',
  },
  addCardJa: {
    position: 'absolute', right: -8, top: -14,
    fontSize: 72, lineHeight: 72,
    fontFamily: 'KleeOne', fontWeight: '600',
    color: colors.line,
    opacity: 0.3,
  },
  addCardText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 15, color: colors.ink3,
  },
});
