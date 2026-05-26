import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShipCard } from '@/components/cards/ShipCard';
import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { IconPlus, IconSearch } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { TEMPLATE_CONFIG } from '@/constants/templateConfig';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { daysAgo, deleteShip, useShips } from '@/store/ships';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const ships = useShips();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
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

        <Text style={styles.meta}>{ships.length} F/Os · 0 ENTRIES</Text>
      </View>

      {ships.length === 0 ? (
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
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {ships.map((ship) => {
            const cfg = TEMPLATE_CONFIG[ship.templateKey];
            return (
              <View key={ship.id} style={styles.cardWrap}>
                <ShipCard
                  name={ship.foName}
                  src={cfg?.title ?? ship.templateKey}
                  initial={ship.foName.charAt(0).toUpperCase() || '♡'}
                  gradStart={cfg?.gradStart ?? '#f3b6c4'}
                  gradEnd={cfg?.gradEnd ?? '#d77a8d'}
                  type="romantic"
                  days={daysAgo(ship.createdAt)}
                  tapePattern={cfg?.tapePattern ?? 'heart'}
                  tapeColor={cfg?.tapeColor ?? 'rgba(255,255,255,0.9)'}
                  onPress={() => router.push({ pathname: `/template/${ship.templateKey}` as any, params: { shipId: ship.id } })}
                />
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => deleteShip(ship.id)}
                  hitSlop={8}
                >
                  <Text style={styles.deleteBtnText}>×</Text>
                </Pressable>
              </View>
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
    fontFamily: FontFamily.marker,
    fontSize: 10,
    color: Colors.ink3,
    letterSpacing: 1.2,
    marginTop: Spacing.s2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: Spacing.s5,
    paddingBottom: Spacing.s9,
  },
  cardWrap: {
    width: '47%',
    position: 'relative',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(31,18,25,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: FontFamily.ui,
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
