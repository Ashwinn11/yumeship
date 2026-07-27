import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  Check, INK, useThemedInk,
  TitleHeader
} from '@/components/templates/primitives';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { getMembers, isPoly, Ship, useShip } from '@/store/ships';
import { MemberPicker } from '@/components/nav/MemberPicker';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const DEFAULT_PAIRS: [string, string][] = [
  ['coffee', 'tea'],
  ['morning', 'night'],
  ['listener', 'talker'],
  ['sweet', 'savory'],
  ['sun', 'moon'],
  ['forehead kiss', 'hand kiss'],
  ['loud laugh', 'quiet smile'],
  ['letters', 'calls'],
  ['winter', 'summer'],
  ['roses', 'wildflowers'],
];

export function ThisOrThatContent({ editing = false, getPairs, onEdit, ship }: { editing?: boolean; getPairs?: () => [string, string][]; onEdit?: () => void; ship?: Ship }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = useThemedInk();

  const resolvePairs = (): [string, string][] => {
    if (getPairs) return getPairs();
    const raw = ctx.get('pairs');
    if (raw) { try { return JSON.parse(raw); } catch (_) {} }
    return DEFAULT_PAIRS;
  };

  const pairs = resolvePairs();

  const [vals, setVals] = useState<{ name: string; choices: ('left' | 'right' | null)[]; note: string }>(() => ({
    name: ctx.get('name'),
    choices: JSON.parse(ctx.get('choices', 'null')) ?? pairs.map(() => null),
    note: ctx.get('note'),
  }));

  const e = editing;

  const setNote = (v: string) => { setVals((p) => ({ ...p, note: v })); ctx.set('note', v); };
  const setName = (v: string) => { setVals((p) => ({ ...p, name: v })); ctx.set('name', v); };
  const pick = (i: number, side: 'left' | 'right') => {
    setVals((prev) => {
      const next = prev.choices.map((c, j) => (j === i ? side : c)) as ('left' | 'right' | null)[];
      ctx.set('choices', JSON.stringify(next));
      return { ...prev, choices: next };
    });
  };

  const { name, choices, note } = vals;

  return (
    <View style={{ padding: 10, backgroundColor: customBg ? 'transparent' : undefined }}>
      <View style={s.titleRow}>
        <TitleHeader title="THIS or THAT" subtitle="how do they choose?" />
        {onEdit && (
          <Pressable style={[s.editBtn, { borderColor: ink }]} onPress={onEdit}>
            <Text style={[s.editBtnText, { color: ink }]}>edit pairs</Text>
          </Pressable>
        )}
      </View>

      {e && isPoly(ship) && getMembers(ship).some((m) => !m.isMe) && (
        <View style={{ marginBottom: 10 }}>
          <MemberPicker
            ship={ship}
            label="whose picks are these?"
            selectedId={getMembers(ship).find((m) => m.name === name)?.id}
            onSelect={(_, n) => setName(n)}
          />
        </View>
      )}

      <View style={s.nameRow}>
        <Text style={[s.themLabel, { color: ink }]}>♡ THEM:</Text>
        <Text style={[s.themName, { color: ink }]}>{name || '——'}</Text>
      </View>

      <View style={s.grid}>
        {pairs.map(([a, b], i) => (
          <View key={i} style={[s.pairCard, { borderColor: ink }]}>
            <Text style={[s.pairIndex, { color: ink }]}>0{i + 1}</Text>
            <View style={s.pairRow}>
              <Pressable style={s.pairHalf} onPress={e ? () => pick(i, 'left') : undefined} disabled={!e}>
                <Text style={[s.pairText, { color: ink }, choices[i] === 'left' && s.pairChosen]}>{a}</Text>
                <Check on={choices[i] === 'left'} size={11} />
              </Pressable>
              <Text style={[s.pairSlash, { color: ink }]}>/</Text>
              <Pressable style={[s.pairHalf, s.pairHalfRight]} onPress={e ? () => pick(i, 'right') : undefined} disabled={!e}>
                <Check on={choices[i] === 'right'} size={11} />
                <Text style={[s.pairText, { color: ink }, choices[i] === 'right' && s.pairChosen]}>{b}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function TemplateThisOrThat() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  const ship = useShip(shipId);
  return (
    <TemplateScreenWrapper templateKey="this-or-that" shipId={shipId}>
      <ThisOrThatContent editing ship={ship} />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 5, marginTop: 4, borderRadius: Radius.pill, borderWidth: 1, backgroundColor: Colors.vellum },
  editBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12) },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  themLabel: { fontFamily: FontFamily.markerBold, fontSize: sf(12) },
  themName: { fontFamily: FontFamily.ja, fontSize: sf(12) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pairCard: {
    width: '48.5%',
    borderWidth: 1.5,
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
    gap: 4,
  },
  pairIndex: { fontFamily: FontFamily.markerBold, fontSize: sf(9), opacity: 0.85, letterSpacing: 0.8 },
  pairRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pairHalf: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 },
  pairHalfRight: { justifyContent: 'flex-end' },
  pairText: { fontFamily: FontFamily.marker, fontSize: sf(11), flexShrink: 1 },
  pairChosen: { fontFamily: FontFamily.markerBold, textDecorationLine: 'underline' },
  pairSlash: { fontFamily: FontFamily.marker, fontSize: sf(9), opacity: 0.7, marginHorizontal: 2 },
  noteWrap: { marginTop: 14, alignItems: 'center' },
  noteText: {
    fontFamily: FontFamily.script,
    fontSize: sf(16),
    lineHeight: 18,
    textAlign: 'center',
    minWidth: 180,
  },
});
