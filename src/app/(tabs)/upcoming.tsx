import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';

import { Mark } from '@/components/ui/Mark';
import { Cloud } from '@/components/deco/Cloud';
import { StickerEnvelope } from '@/components/deco/Stickers';
import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { Star } from '@/components/deco/Star';
import { Colors, FontFamily, FontSize, Radius, Spacing, RelationshipColors } from '@/constants/theme';
import { useAllUpcomingDates, daysUntil } from '@/store/dates';
import { MiniUpcoming } from '@/components/cards/MiniUpcoming';

type FilterKey = 'next30' | 'allUpcoming' | 'allTime';

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: 'next30', label: 'next 30 days' },
  { key: 'allUpcoming', label: 'all upcoming' },
  { key: 'allTime', label: 'all time' },
];

export default function UpcomingScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('next30');
  const allDates = useAllUpcomingDates();

  const filteredDates = allDates.filter((d) => {
    const days = daysUntil(d.date, d.yearly);
    if (days === null) return false;
    
    if (filter === 'next30') {
      return days >= 0 && days <= 30;
    }
    if (filter === 'allUpcoming') {
      return days >= 0;
    }
    return true;
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Background accents */}
      <View style={styles.decoTL} pointerEvents="none">
        <Star size={18} color={Colors.butter} />
      </View>
      <View style={styles.decoBR} pointerEvents="none">
        <Cloud size={28} color={Colors.sakura} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Mark size={26} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>upcoming</Text>
          <Sakura size={20} color={Colors.sakura} />
        </View>

        <View style={styles.filterRow}>
          {FILTER_LABELS.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.filterChip,
                filter === key ? styles.filterChipActive : styles.filterChipInactive,
              ]}
            >
              <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* List or Empty state */}
      {filteredDates.length === 0 ? (
        <View style={styles.emptyState}>
          <StickerEnvelope size={88} />
          <Text style={styles.emptyTitle}>nothing coming up</Text>
          <Text style={styles.emptySub}>
            add a ship and set an anniversary{"\n"}or birthday to see it here.
          </Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() => router.push('/' as any)}
          >
            <Text style={styles.emptyBtnTxt}>go to my ships</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredDates.map((d) => {
            const days = daysUntil(d.date, d.yearly) ?? 0;
            const tint = RelationshipColors[d.relType as keyof typeof RelationshipColors] || Colors.sakuraDeep;
            
            const featured = d.title === 'Our Anniversary' || days <= 7;
            const muted = days > 60 && d.title !== 'Our Anniversary';

            return (
              <MiniUpcoming
                key={d.id}
                days={days}
                title={d.title}
                fo={d.shipName}
                tint={tint}
                featured={featured}
                muted={muted}
                dateStr={d.date}
                yearly={d.yearly}
                subtitle={d.subtitle}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  header: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: Spacing.s4,
  },
  title: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 34,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: Spacing.s3,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
  },
  filterChipActive: {
    backgroundColor: Colors.sakuraDeep,
  },
  filterChipInactive: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  filterText: {
    fontSize: 10,
    fontFamily: FontFamily.ui,
    color: Colors.ink2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: Colors.vellum,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s3,
    paddingBottom: Spacing.s8,
    gap: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s3,
    paddingBottom: Spacing.s9,
  },
  emptyDeco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    marginBottom: Spacing.s2,
  },
  emptyTitle: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 26,
    color: Colors.ink,
    textAlign: 'center',
    marginTop: 10,
  },
  emptySub: {
    fontFamily: FontFamily.script,
    fontSize: 18,
    lineHeight: 22,
    color: Colors.ink2,
    textAlign: 'center',
    paddingHorizontal: Spacing.s8,
    marginVertical: 8,
  },
  emptyBtn: {
    backgroundColor: Colors.sakuraDeep,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 10,
    shadowColor: 'rgba(110,58,90,0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  emptyBtnTxt: {
    fontFamily: FontFamily.uiMedium,
    fontSize: 14,
    color: Colors.vellum,
  },
  decoTL: {
    position: 'absolute',
    top: 130,
    left: 20,
  },
  decoBR: {
    position: 'absolute',
    bottom: 120,
    right: 30,
  },
});
