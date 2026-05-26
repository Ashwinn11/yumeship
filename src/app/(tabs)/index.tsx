import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mark } from '@/components/ui/Mark';
import { IconSearch, IconPlus } from '@/components/ui/Icon';
import { Sparkle } from '@/components/deco/Sparkle';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Mark size={26} />
          <View style={styles.iconRow}>
            <Pressable style={styles.iconBtn}>
              <IconSearch size={14} color={Colors.ink2} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/new-ship')}>
              <IconPlus size={14} color={Colors.ink2} />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>your ships</Text>
          <Sparkle size={16} color={Colors.sakuraDeep} />
        </View>

        <Text style={styles.meta}>0 F/Os · 0 ENTRIES</Text>
      </View>

      {/* Empty state */}
      <View style={styles.emptyState}>
        <View style={styles.emptyDeco}>
          <Sparkle size={12} color={Colors.sakura} />
          <Heart size={32} color={Colors.sakuraSoft} outline />
          <Sparkle size={8} color={Colors.lavender} />
        </View>
        <Text style={styles.emptyTitle}>no ships yet</Text>
        <Text style={styles.emptySub}>your first F/O is waiting</Text>
        <Pressable style={styles.emptyBtn} onPress={() => router.push('/new-ship')}>
          <IconPlus size={13} color={Colors.vellum} />
          <Text style={styles.emptyBtnText}>start a new ship</Text>
        </Pressable>
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
    paddingBottom: Spacing.s1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 6,
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
    fontSize: 38,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  meta: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.ink3,
    letterSpacing: 1.2,
    marginTop: Spacing.s2,
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
  },
  emptyBtn: {
    marginTop: Spacing.s3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
    backgroundColor: Colors.sakuraDeep,
    paddingHorizontal: Spacing.s5,
    paddingVertical: 12,
    borderRadius: Radius.pill,
  },
  emptyBtnText: {
    fontFamily: FontFamily.uiMedium,
    fontSize: FontSize.body,
    color: Colors.vellum,
  },
});
