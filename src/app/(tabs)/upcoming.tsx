import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mark } from '@/components/ui/Mark';
import { IconBell } from '@/components/ui/Icon';
import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type FilterKey = 'next30' | 'allUpcoming' | 'allTime';

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: 'next30', label: 'next 30 days' },
  { key: 'allUpcoming', label: 'all upcoming' },
  { key: 'allTime', label: 'all time' },
];

import { useState } from 'react';

export default function UpcomingScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('next30');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Mark size={26} />
          <Pressable style={styles.iconBtn}>
            <IconBell size={14} color={Colors.ink2} />
          </Pressable>
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

      {/* Empty state */}
      <View style={styles.emptyState}>
        <View style={styles.emptyDeco}>
          <Sparkle size={10} color={Colors.sakura} />
          <Sakura size={28} color={Colors.sakuraSoft} />
          <Sparkle size={7} color={Colors.lavender} />
        </View>
        <Text style={styles.emptyTitle}>nothing coming up</Text>
        <Text style={styles.emptySub}>add dates to your ships to see them here</Text>
      </View>
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
    fontSize: FontSize.h4,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.meta,
    color: Colors.ink3,
    textAlign: 'center',
    paddingHorizontal: Spacing.s8,
  },
});
