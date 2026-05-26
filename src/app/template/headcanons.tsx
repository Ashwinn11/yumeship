import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MarkerCard, TitleHeader, MarkerHeader, TemplateField, BlankPill, Check, INK, FILL_GRAY,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

const CATS = [
  { ja: '性', name: 'PERSONALITY' },
  { ja: '癖', name: 'HABITS' },
  { ja: '好', name: 'FAVORITES' },
];
const ITEMS_PER_CAT = 4;

export function HeadcanonsContent({ editing = false }: { editing?: boolean }) {
  const [fo, setFo] = useState('');
  const [source, setSource] = useState('');
  const [catItems, setCatItems] = useState<string[][]>(() =>
    CATS.map(() => Array(ITEMS_PER_CAT).fill(''))
  );
  const e = editing;

  const setItem = (cat: number, idx: number) =>
    e
      ? (v: string) =>
          setCatItems((p) =>
            p.map((c, ci) => (ci === cat ? c.map((x, xi) => (xi === idx ? v : x)) : c))
          )
      : undefined;

  return (
    <MarkerCard tint="#fffbf6">
      <TitleHeader title="HEADCANONS" subtitle="the things only I'd notice" by="@daydreamr" />

      <View style={s.fieldRow}>
        <TemplateField
          label="F/O"
          value={e ? fo : undefined}
          onChangeText={e ? setFo : undefined}
          valueWidth={90}
        />
        <TemplateField
          label="Source"
          value={e ? source : undefined}
          onChangeText={e ? setSource : undefined}
          valueWidth={70}
        />
      </View>

      <View style={s.cats}>
        {CATS.map((c, ci) => (
          <View key={ci} style={s.catCard}>
            <View style={s.catHeader}>
              <Text style={s.catJa}>{c.ja}</Text>
              <MarkerHeader size={13}>{c.name}</MarkerHeader>
              <View style={s.countBadge}>
                <Text style={s.countText}>
                  {catItems[ci].filter((x) => x.length > 0).length}
                </Text>
              </View>
            </View>
            <View style={s.catBody}>
              {catItems[ci].map((item, idx) => (
                <View
                  key={idx}
                  style={[s.item, idx < catItems[ci].length - 1 && s.itemBorder]}
                >
                  {item ? (
                    <Heart size={10} color={INK} outline />
                  ) : (
                    <Check on={false} size={11} />
                  )}
                  <View style={s.itemPillWrap}>
                    <BlankPill
                      value={e ? item : undefined}
                      onChangeText={setItem(ci, idx)}
                      placeholder="headcanon..."
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </MarkerCard>
  );
}

export default function TemplateHeadcanons() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.appBar}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <HeadcanonsContent editing />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  appBar: { paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: Colors.ink2, fontFamily: FontFamily.ui },
  scroll: { padding: Spacing.s5, paddingBottom: Spacing.s8 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cats: { marginTop: 14, gap: 10 },
  catCard: { borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: '#fff', overflow: 'hidden' },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: FILL_GRAY,
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
  },
  catJa: { fontFamily: FontFamily.jaSemiBold, fontSize: 18, fontWeight: '600', color: INK },
  countBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: INK,
    borderRadius: 999,
  },
  countText: { fontFamily: FontFamily.markerBold, fontSize: 10, color: INK },
  catBody: { paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  item: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 4 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: INK + '30' },
  itemPillWrap: { flex: 1 },
});
