import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShipCard } from '@/components/cards/ShipCard';
import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';

import { StickerSakuraFlower, StickerSparkle, WashiTape } from '@/components/deco';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconPlus, IconSearch } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { resetOnb } from '@/store/onboarding';
import { daysTogetherLabel, daysAgo, deleteShip, useShips } from '@/store/ships';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const ships = useShips();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [shipToDelete, setShipToDelete] = useState<string | null>(null);

  const filteredShips = ships.filter((ship) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (ship.name && ship.name.toLowerCase().includes(q)) ||
      (ship.shipName && ship.shipName.toLowerCase().includes(q)) ||
      (ship.myName && ship.myName.toLowerCase().includes(q)) ||
      (ship.fandom && ship.fandom.toLowerCase().includes(q))
    );
  });

  const shipToDeleteData = ships.find((s) => s.id === shipToDelete);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <CozyModal
        visible={!!shipToDelete}
        title="let them go?"
        message={shipToDeleteData ? `Remove ${shipToDeleteData.shipName || shipToDeleteData.name} and all their memories.` : undefined}
        confirmText="Delete"
        cancelText="keep them"
        isDestructive
        onConfirm={() => { if (shipToDelete) deleteShip(shipToDelete); setShipToDelete(null); }}
        onClose={() => setShipToDelete(null)}
      />
      {/* Background accents */}
      <View style={styles.decoTR} pointerEvents="none">
        <Sparkle size={20} color={Colors.sakura} />
      </View>
      <View style={styles.decoBL} pointerEvents="none">
        <Heart size={24} color={Colors.lavenderDeep} outline />
      </View>

      <View style={styles.header}>
        <View style={styles.headerRow}>
          {showSearch ? (
            <View style={styles.searchContainer}>
              <IconSearch size={14} color={Colors.ink3} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="search ship..."
                placeholderTextColor={Colors.ink3}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
              <Pressable
                style={styles.clearBtn}
                onPress={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                }}
                id="search-close-btn"
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Mark size={26} />
              {ships.length > 0 && (
                <View style={styles.iconRow}>
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() => setShowSearch(true)}
                    id="search-toggle-btn"
                  >
                    <IconSearch size={14} color={Colors.ink2} />
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>your ships</Text>
          <Sparkle size={16} color={Colors.sakuraDeep} />
        </View>

        <Text style={styles.meta}>
          {filteredShips.length} F/Os · {filteredShips.length * 0} ENTRIES
        </Text>
      </View>

      {ships.length === 0 ? (
        <View style={[styles.emptyState, { paddingVertical: 60, paddingHorizontal: 20, gap: 12 }]}>
          <StickerSakuraFlower size={88} />
          <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: 26, color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
            no ships yet
          </Text>
          <Text style={{ fontFamily: FontFamily.script, fontSize: 18, lineHeight: 22, color: Colors.ink2, textAlign: 'center', marginVertical: 8 }}>
            your first F/O is waiting —{"\n"}let's build your notebook.
          </Text>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: Colors.sakuraDeep,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 99,
              shadowColor: 'rgba(110, 58, 90, 0.12)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 3,
              elevation: 1,
              marginTop: 10,
            }}
            onPress={() => { resetOnb(); router.push({ pathname: '/onboarding/fo', params: { mode: 'new' } }); }}
          >
            <IconPlus size={12} color={Colors.vellum} />
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: 14, color: Colors.vellum }}>start a new ship</Text>
          </Pressable>
        </View>
      ) : filteredShips.length === 0 ? (
        <Pressable
          style={styles.pressableBg}
          onPress={() => {
            if (showSearch) {
              setSearchQuery('');
              setShowSearch(false);
            }
          }}
        >
          <View style={[styles.emptyState, { paddingVertical: 60, paddingHorizontal: 20, gap: 12 }]}>
            <StickerSakuraFlower size={88} />
            <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: 26, color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
              no ships found
            </Text>
            <Text style={{ fontFamily: FontFamily.script, fontSize: 18, lineHeight: 22, color: Colors.ink2, textAlign: 'center', marginVertical: 8 }}>
              try adjusting your search term —{"\n"}they are out there.
            </Text>
          </View>
        </Pressable>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          <Pressable
            style={styles.gridPressable}
            onPress={() => {
              if (showSearch) {
                setSearchQuery('');
                setShowSearch(false);
              }
            }}
          >
            {filteredShips.map((ship) => (
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
                onLongPress={() => setShipToDelete(ship.id)}
              />
            ))}
            {/* Add new card */}
            <Pressable style={styles.addCard} onPress={() => { resetOnb(); router.push({ pathname: '/onboarding/fo', params: { mode: 'new' } }); }}>
              <View style={{ position: 'absolute', top: 0, left: -8, zIndex: 10 }}>
                <WashiTape width={56} height={14} pattern="floral" color={Colors.sakura} rotate={-6} />
              </View>
              <View style={styles.addIcon}>
                <IconPlus size={18} color={Colors.sakuraDeep} />
              </View>
              <Text style={styles.addText}>start a new ship</Text>
            </Pressable>
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
  iconBtnActive: {
    borderColor: Colors.sakuraDeep,
    backgroundColor: Colors.sakuraSoft,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: Spacing.s4 },
  title: { fontFamily: FontFamily.displayItalic, fontSize: 38, lineHeight: 38, letterSpacing: -0.4, color: Colors.ink },
  meta: { fontFamily: FontFamily.marker, fontSize: 10, color: Colors.ink3, letterSpacing: 1.2, marginTop: Spacing.s2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.vellum,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.ui,
    fontSize: FontSize.caption,
    color: Colors.ink,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontFamily: FontFamily.uiMedium,
    fontSize: 10,
    color: Colors.ink3,
  },
  pressableBg: {
    flex: 1,
  },
  grid: {
    padding: Spacing.s5, paddingBottom: Spacing.s9,
  },
  gridPressable: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  card: { width: '47%' },
  addCard: {
    width: '47%',
    aspectRatio: 3 / 4,
    borderWidth: 1,
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
  decoTR: {
    position: 'absolute',
    top: 150,
    right: 24,
  },
  decoBL: {
    position: 'absolute',
    bottom: 140,
    left: 24,
  },
});
