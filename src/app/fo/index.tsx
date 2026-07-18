import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/deco/Sparkle';
import { IconPlus } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { useFos } from '@/store/fo';
import { usePremium } from '@/store/premium';
import { shipTitle, useShips } from '@/store/ships';

export default function FoListScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const fos = useFos();
  const ships = useShips();
  const premium = usePremium();

  function handleAdd() {
    if (!premium && fos.length >= 1) {
      router.push('/paywall?reason=add-fo' as any);
      return;
    }
    router.push('/fo/new' as any);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>your F/Os</Text>
        </View>
        <Pressable onPress={handleAdd} style={styles.headerBtn}>
          <IconPlus size={14} color={Colors.ink2} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, column]} showsVerticalScrollIndicator={false}>
        {fos.length === 0 ? (
          <View style={styles.empty}>
            <Sparkle size={20} color={Colors.lavenderDeep} />
            <Text style={styles.emptyTitle}>no F/Os yet</Text>
            <Text style={styles.emptyBody}>everyone you love can have a soft little profile here.</Text>
            <Pressable onPress={handleAdd} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>+ add your first F/O</Text>
            </Pressable>
          </View>
        ) : (
          fos.map((fo) => {
            const linked = ships.find((s) => s.foId === fo.id);
            return (
              <Pressable key={fo.id} style={styles.row} onPress={() => router.push(`/fo/${fo.id}` as any)}>
                <View style={[styles.avatar, { backgroundColor: Colors.sakura }]}>
                  {fo.photoUri ? (
                    <Image source={{ uri: fo.photoUri }} style={styles.avatarImg} contentFit="cover" />
                  ) : (
                    <Text style={styles.avatarInitial}>{fo.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
                  )}
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{fo.name || 'untitled'}</Text>
                  <Text style={styles.rowMeta}>
                    {[fo.pronouns, linked ? shipTitle(linked) : 'not linked to a ship'].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(20), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(22) },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s5, gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
    ...Shadow.s1,
  },
  avatar: {
    width: 48, height: 48, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 48, height: 48, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(20), color: '#fff' },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink },
  rowMeta: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },
  chevron: { fontSize: sf(18), color: Colors.ink3 },
  empty: {
    alignItems: 'center', gap: 8,
    paddingTop: Spacing.s7, paddingHorizontal: Spacing.s5,
  },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(20), color: Colors.ink, marginTop: 4 },
  emptyBody: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, textAlign: 'center', lineHeight: 17 },
  emptyBtn: {
    marginTop: 10, paddingVertical: 10, paddingHorizontal: 18,
    backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill,
  },
  emptyBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum },
});
