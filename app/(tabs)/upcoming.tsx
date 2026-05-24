import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Mark } from '@/components';
import { Sparkle, Heart, Sakura } from '@/deco';

type Filter = 'next30' | 'upcoming' | 'alltime';

const ANNIVERSARIES = [
  { id: '1', days: 3,   title: 'Our anniversary',    fo: 'Kafka',  tint: colors.sakuraDeep,  featured: true },
  { id: '2', days: 14,  title: 'The day I found him', fo: 'Childe', tint: colors.peachDeep },
  { id: '3', days: 41,  title: 'Our song day',        fo: 'Kafka',  tint: colors.lavenderDeep },
  { id: '4', days: 78,  title: 'Birthday — Childe',   fo: 'Childe', tint: colors.butterDeep },
  { id: '5', days: 112, title: 'In memoriam',          fo: 'Basil',  tint: colors.ember, muted: true },
];

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <View style={[
        styles.filterChip,
        { backgroundColor: active ? colors.sakuraDeep : colors.vellum, borderColor: active ? 'transparent' : colors.line },
      ]}>
        <Text style={[styles.filterChipText, { color: active ? colors.vellum : colors.ink2 }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

function UpcomingRow({ item }: { item: typeof ANNIVERSARIES[0] }) {
  return (
    <View style={[
      styles.row,
      item.featured && { backgroundColor: colors.sakuraSoft + '88', borderColor: item.tint },
      item.muted && { opacity: 0.75 },
    ]}>
      {item.featured && (
        <View style={styles.featuredHeart}>
          <Heart size={12} color={item.tint} />
        </View>
      )}
      <View style={[styles.daysBox, { backgroundColor: item.tint + '18', borderColor: item.tint + '40' }]}>
        <Text style={[styles.daysNum, { color: item.tint }]}>{item.days}</Text>
        <Text style={[styles.daysLabel, { color: item.tint }]}>DAYS</Text>
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowFo}>{item.fo}</Text>
      </View>
      <Sparkle size={10} color={item.tint} />
    </View>
  );
}

export default function Upcoming() {
  const [filter, setFilter] = useState<Filter>('next30');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Mark size={26} />
          <View style={styles.iconBtn}>
            {/* bell icon */}
            <Text style={{ fontSize: 14 }}>🔔</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>upcoming</Text>
          <Sakura size={20} color={colors.sakura} />
        </View>

        <View style={styles.filterRow}>
          <FilterChip label="next 30 days" active={filter === 'next30'} onPress={() => setFilter('next30')} />
          <FilterChip label="all upcoming" active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
          <FilterChip label="all time" active={filter === 'alltime'} onPress={() => setFilter('alltime')} />
        </View>

        <View style={styles.list}>
          {ANNIVERSARIES.map((item) => (
            <UpcomingRow key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.s5 + 2, paddingTop: spacing.s2, paddingBottom: spacing.s5 },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: spacing.s2,
  },
  iconBtn: {
    width: 32, height: 32, borderRadius: radii.pill,
    backgroundColor: colors.vellum, borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
  },

  titleRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.s2 + 2,
    marginTop: spacing.s3, marginBottom: spacing.s2,
  },
  title: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 34, lineHeight: 32, letterSpacing: -0.5, color: colors.ink,
  },

  filterRow: {
    flexDirection: 'row', gap: spacing.s1,
    flexWrap: 'wrap', marginBottom: spacing.s2 + 2,
  },
  filterChip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radii.pill, borderWidth: 1,
  },
  filterChipText: { fontSize: 10, fontWeight: '500', letterSpacing: 0.2 },

  list: { gap: spacing.s2 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.s2 + 2,
    padding: spacing.s2 + 2,
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r3,
    position: 'relative',
    ...shadows.sm,
  },
  featuredHeart: { position: 'absolute', top: -5, left: 12 },

  daysBox: {
    width: 46, alignItems: 'center',
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: radii.r2,
    flexShrink: 0,
  },
  daysNum: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 19, lineHeight: 20, fontWeight: '600',
  },
  daysLabel: { fontFamily: 'JetBrainsMono', fontSize: 7, letterSpacing: 1, marginTop: 2 },

  rowMeta: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: 'InstrumentSerif_Italic', fontSize: 15, lineHeight: 17, color: colors.ink },
  rowFo: { fontSize: 10, color: colors.ink2 },
});
