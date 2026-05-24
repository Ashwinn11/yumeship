import React from 'react';
import { View, Text, ScrollView, Pressable,
  StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { WashiTape, Sparkle, Pin, Heart } from '@/deco';

const HEADCANON_CATS = [
  { ja: '性', label: 'Personality', count: 8,  color: colors.sakuraDeep },
  { ja: '癖', label: 'Habits',      count: 5,  color: colors.lavenderDeep },
  { ja: '好', label: 'Favorites',   count: 12, color: colors.butterDeep },
  { ja: '逢', label: 'How met',     count: 1,  color: colors.peachDeep },
];

export default function FOProfile() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* App bar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹</Text>
        </Pressable>
        <Text style={styles.appBarFandom}>HONKAI STAR RAIL</Text>
        <Pressable>
          <Text style={styles.editBtn}>✎</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Hero cover */}
        <View style={styles.hero}>
          <View style={styles.heroGrad} />
          <Text style={styles.heroInitial}>K</Text>

          <View style={styles.washiWrap}>
            <WashiTape width={90} height={18} pattern="heart" color={colors.vellum} rotate={-5} />
          </View>
          <View style={styles.pinWrap}>
            <Pin size={13} color={colors.sakuraDeep} />
          </View>
          <View style={styles.sparkle1}>
            <Sparkle size={14} color={colors.butter} />
          </View>

          <View style={styles.chipsRow}>
            <View style={styles.heroChip}>
              <Text style={[styles.heroChipText, { color: colors.sakuraDeep }]}>♡ romantic</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={[styles.heroChipText, { color: colors.lavenderDeep }]}>mirror</Text>
            </View>
          </View>
        </View>

        {/* Name */}
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>Kafka</Text>
            <View style={styles.polyculeTag}>
              <Text style={styles.polyculeText}>✶ THE HUNTERS</Text>
            </View>
          </View>
          <Text style={styles.nameJa}>カフカ · "my whole problem"</Text>
        </View>

        {/* Anniversary strip */}
        <View style={styles.anniversaryStrip}>
          <View style={styles.anniversaryLeft}>
            <Heart size={11} color={colors.sakuraDeep} />
            <Text style={styles.anniversaryText}>together 1 year, 47 days</Text>
          </View>
          <Text style={styles.anniversaryDate}>since 2024.04.11</Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>about</Text>
          <Text style={styles.about}>
            "she calls me when she shouldn't. I always pick up."
          </Text>
        </View>

        {/* Headcanons */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>headcanons · 35</Text>
            <Pressable>
              <Text style={styles.viewAll}>view all ›</Text>
            </Pressable>
          </View>
          <View style={styles.hcRow}>
            {HEADCANON_CATS.map((cat) => (
              <View key={cat.ja} style={[styles.hcChip, { borderColor: cat.color + '30' }]}>
                <Text style={[styles.hcJa, { color: cat.color }]}>{cat.ja}</Text>
                <Text style={styles.hcLabel}>{cat.label}</Text>
                <Text style={[styles.hcCount, { color: cat.color, fontFamily: 'JetBrainsMono' }]}>{cat.count}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  appBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.s5, paddingVertical: spacing.s2,
  },
  backBtn: { fontSize: 20, color: colors.ink2 },
  appBarFandom: { fontFamily: 'JetBrainsMono', fontSize: 10, color: colors.ink3, letterSpacing: 1.4 },
  editBtn: { fontSize: 14, color: colors.ink2 },

  scroll: { flex: 1 },
  content: { paddingBottom: spacing.s7 },

  hero: {
    marginHorizontal: spacing.s4,
    height: 180, borderRadius: radii.r4,
    overflow: 'hidden', position: 'relative',
    ...shadows.md,
  },
  heroGrad: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.sakura,
    opacity: 0.8,
  },
  heroInitial: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    textAlign: 'center', textAlignVertical: 'center',
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 100, color: 'rgba(255,255,255,0.95)', lineHeight: 180,
  },
  washiWrap: { position: 'absolute', top: -2, left: 14 },
  pinWrap: {
    position: 'absolute', top: 12, right: 12,
    width: 28, height: 28, borderRadius: radii.pill,
    backgroundColor: colors.vellum,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  sparkle1: { position: 'absolute', top: 30, right: 50 },
  chipsRow: { position: 'absolute', bottom: 10, left: 12, flexDirection: 'row', gap: 6 },
  heroChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.pill,
  },
  heroChipText: { fontSize: 11, fontWeight: '600' },

  nameSection: { paddingHorizontal: spacing.s5, paddingTop: spacing.s3 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: 'InstrumentSerif_Italic', fontSize: 32, lineHeight: 32, color: colors.ink },
  polyculeTag: {
    paddingHorizontal: spacing.s2, paddingVertical: 3,
    backgroundColor: 'rgba(110,58,90,0.1)',
    borderRadius: radii.pill,
  },
  polyculeText: { fontSize: 9, color: colors.plum, fontWeight: '600', letterSpacing: 0.4 },
  nameJa: { fontFamily: 'KleeOne', fontSize: 12, color: colors.ink2, marginTop: 2 },

  anniversaryStrip: {
    marginHorizontal: spacing.s5, marginTop: spacing.s3,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.s3,
    backgroundColor: colors.sakuraSoft,
    borderWidth: 1, borderColor: colors.sakura,
    borderRadius: radii.r3,
  },
  anniversaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  anniversaryText: { fontFamily: 'InstrumentSerif_Italic', fontSize: 14, color: colors.sakuraDeep },
  anniversaryDate: { fontFamily: 'JetBrainsMono', fontSize: 9, color: colors.sakuraDeep },

  section: { paddingHorizontal: spacing.s5, marginTop: spacing.s3 + 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s2 },
  sectionLabel: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3,
    letterSpacing: 1.4, textTransform: 'uppercase',
  },
  viewAll: { fontSize: 10, color: colors.sakuraDeep, fontWeight: '600' },
  about: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 14, lineHeight: 21,
    color: colors.ink2, marginTop: spacing.s1,
  },

  hcRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.s2 },
  hcChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: colors.vellum,
    borderWidth: 1, borderRadius: radii.pill,
  },
  hcJa: { fontFamily: 'KleeOne', fontSize: 11, fontWeight: '600' },
  hcLabel: { fontSize: 10, color: colors.ink2, fontWeight: '500' },
  hcCount: { fontSize: 9, fontWeight: '600' },
});
