import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShipCard } from '@/components/cards/ShipCard';
import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { IconPlus, IconSearch } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { resetOnb } from '@/store/onboarding';
import { daysTogetherLabel, daysAgo, deleteShip, useShips } from '@/store/ships';

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
            <Pressable style={styles.iconBtn} onPress={() => { resetOnb(); router.push({ pathname: '/onboarding/fo', params: { mode: 'new' } }); }}>
              <IconPlus size={14} color={Colors.ink2} />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>your ships</Text>
          <Sparkle size={16} color={Colors.sakuraDeep} />
        </View>

        <Text style={styles.meta}>{ships.length} F/Os · {ships.length * 0} ENTRIES</Text>
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
          <Pressable style={styles.emptyBtn} onPress={() => { resetOnb(); router.push({ pathname: '/onboarding/fo', params: { mode: 'new' } }); }}>
            <IconPlus size={13} color={Colors.vellum} />
            <Text style={styles.emptyBtnText}>start a new ship</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {ships.map((ship) => (
            <ShipCard
              key={ship.id}
              style={styles.card}
              name={ship.name}
              shipName={ship.shipName}
              myName={ship.myName}
              src={ship.fandom || '—'}
              initial={(ship.shipName || ship.name).charAt(0).toUpperCase() || '♡'}
              gradStart={ship.gradStart}
              gradEnd={ship.gradEnd}
              type={ship.relType}
              days={daysTogetherLabel(ship.startDate) || daysAgo(ship.createdAt)}
              tapePattern={ship.tapePattern as any}
              tapeColor={ship.tapeColor}
              pinned={ship.pinned}
              onPress={() => router.push(`/template/${ship.templateKey ?? 'get-to-know'}?shipId=${ship.id}` as any)}
              onLongPress={() => Alert.alert(
                `Remove ${ship.shipName || ship.name}?`,
                'This will delete the ship and all its data.',
                [
                  { text: 'Delete', style: 'destructive', onPress: () => deleteShip(ship.id) },
                  { text: 'Cancel', style: 'cancel' },
                ],
              )}
            />
          ))}
          {/* Add new card */}
          <Pressable style={styles.addCard} onPress={() => { resetOnb(); router.push({ pathname: '/onboarding/fo', params: { mode: 'new' } }); }}>
            <View style={styles.addIcon}>
              <IconPlus size={18} color={Colors.sakuraDeep} />
            </View>
            <Text style={styles.addText}>start a new ship</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s1,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconRow: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: Spacing.s4 },
  title: { fontFamily: FontFamily.displayItalic, fontSize: 38, lineHeight: 38, letterSpacing: -0.4, color: Colors.ink },
  meta: { fontFamily: FontFamily.marker, fontSize: 10, color: Colors.ink3, letterSpacing: 1.2, marginTop: Spacing.s2 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    padding: Spacing.s5, paddingBottom: Spacing.s9,
  },
  card: { width: '47%' },
  addCard: {
    width: '47%',
    aspectRatio: 3 / 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.lineStrong,
    borderRadius: Radius.r4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(243,182,196,0.08)',
  },
  addIcon: {
    width: 36, height: 36, borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraSoft, alignItems: 'center', justifyContent: 'center',
  },
  addText: {
    fontFamily: FontFamily.displayItalic, fontSize: 14, fontStyle: 'italic',
    color: Colors.ink2, textAlign: 'center', paddingHorizontal: 8, lineHeight: 18,
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.s3, paddingBottom: Spacing.s9 },
  emptyDeco: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s3, marginBottom: Spacing.s2 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h4, color: Colors.ink, letterSpacing: -0.3 },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink3 },
  emptyBtn: {
    marginTop: Spacing.s3, flexDirection: 'row', alignItems: 'center', gap: Spacing.s2,
    backgroundColor: Colors.sakuraDeep, paddingHorizontal: Spacing.s5, paddingVertical: 12, borderRadius: Radius.pill,
  },
  emptyBtnText: { fontFamily: FontFamily.uiMedium, fontSize: FontSize.body, color: Colors.vellum },
});
