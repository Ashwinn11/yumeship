import { Heart } from '@/components/deco/Heart';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  BlankPill, Check,
  FILL_GRAY,
  INK,
  MarkerCard,
  MarkerHeader, TemplateField,
  TitleHeader,
} from '@/components/templates/primitives';
import { FontFamily ,sf } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const CATS = [
  { ja: '性', name: 'PERSONALITY' },
  { ja: '癖', name: 'HABITS' },
  { ja: '好', name: 'FAVORITES' },
];
const ITEMS_PER_CAT = 4;
const BLANK_CAT_ITEMS = CATS.map(() => Array(ITEMS_PER_CAT).fill('') as string[]);

export function HeadcanonsContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;

  const [vals, setVals] = useState<{ fo: string; source: string; catItems: string[][] }>(() => ({
    fo: ctx.get('fo'),
    source: ctx.get('source'),
    catItems: JSON.parse(ctx.get('catItems', 'null')) ?? BLANK_CAT_ITEMS,
  }));

  const e = editing;

  const setFo = (v: string) => { setVals((p) => ({ ...p, fo: v })); ctx.set('fo', v); };
  const setSource = (v: string) => { setVals((p) => ({ ...p, source: v })); ctx.set('source', v); };

  const setItem = (cat: number, idx: number) =>
    e ? (v: string) => {
      setVals((p) => {
        const next = p.catItems.map((c, ci) =>
          ci === cat ? c.map((x, xi) => (xi === idx ? v : x)) : c
        );
        ctx.set('catItems', JSON.stringify(next));
        return { ...p, catItems: next };
      });
    } : undefined;

  const { fo, source, catItems } = vals;

  return (
    <MarkerCard tint={customBg ? 'transparent' : '#fffbf6'}>
      <TitleHeader title="HEADCANONS" subtitle="the things only I'd notice" />

      <View style={s.fieldRow}>
        <TemplateField
          label="F/O"
          value={fo}
          onChangeText={e ? setFo : undefined}
          valueWidth={90}
        />
        <TemplateField
          label="Source"
          value={source}
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
                    {e ? (
                      <TextInput
                        value={item}
                        onChangeText={setItem(ci, idx)}
                        placeholder="something you know..."
                        placeholderTextColor={INK + '88'}
                        underlineColorAndroid="transparent"
                        style={{ fontFamily: FontFamily.ja, fontSize: sf(11), color: INK, padding: 0, minHeight: 18, fontWeight: '600' }}
                      />
                    ) : (
                      item ? (
                        <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(11), color: INK, fontWeight: '600' }}>{item}</Text>
                      ) : (
                        <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(11), color: INK + '44' }}>——</Text>
                      )
                    )}
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
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="headcanons" shipId={shipId}>
      <HeadcanonsContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
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
  catJa: { fontFamily: FontFamily.ja, fontSize: sf(18), fontWeight: '600', color: INK },
  countBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: INK,
    borderRadius: 999,
  },
  countText: { fontFamily: FontFamily.markerBold, fontSize: sf(10), color: INK },
  catBody: { paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  item: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 4 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: INK + '30' },
  itemPillWrap: { flex: 1 },
});
