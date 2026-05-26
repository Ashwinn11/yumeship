import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, TitleHeader, BlankPill, Check, INK,
} from '@/components/templates/primitives';
import { FontFamily } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';

const PAIRS: [string, string][] = [
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

const BLANK_CHOICES: ('left' | 'right' | null)[] = PAIRS.map(() => null);

export function ThisOrThatContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();

  const [vals, setVals] = useState<{ name: string; choices: ('left' | 'right' | null)[]; note: string }>(() => ({
    name: ctx.get('name'),
    choices: JSON.parse(ctx.get('choices', 'null')) ?? BLANK_CHOICES,
    note: ctx.get('note'),
  }));

  const e = editing;

  const setName = (v: string) => { setVals((p) => ({ ...p, name: v })); ctx.set('name', v); };
  const setNote = (v: string) => { setVals((p) => ({ ...p, note: v })); ctx.set('note', v); };
  const pick = (i: number, side: 'left' | 'right') => {
    setVals((prev) => {
      const next = prev.choices.map((c, j) => (j === i ? side : c)) as ('left' | 'right' | null)[];
      ctx.set('choices', JSON.stringify(next));
      return { ...prev, choices: next };
    });
  };

  const { name, choices, note } = vals;

  return (
    <MarkerCard tint="#fffbf6">
      <TitleHeader title="THIS or THAT" subtitle="how do they choose?" by="@softfangs" />

      <View style={s.nameRow}>
        <Text style={s.themLabel}>♡ THEM:</Text>
        <View style={s.namePill}>
          <BlankPill value={name} onChangeText={e ? setName : undefined} />
        </View>
      </View>

      <View style={s.grid}>
        {PAIRS.map(([a, b], i) => (
          <View key={i} style={s.pairCard}>
            <Text style={s.pairIndex}>0{i + 1}</Text>
            <View style={s.pairRow}>
              <Pressable style={s.pairHalf} onPress={e ? () => pick(i, 'left') : undefined} disabled={!e}>
                <Text style={[s.pairText, choices[i] === 'left' && s.pairChosen]}>{a}</Text>
                <Check on={choices[i] === 'left'} size={11} />
              </Pressable>
              <Text style={s.pairSlash}>/</Text>
              <Pressable style={[s.pairHalf, s.pairHalfRight]} onPress={e ? () => pick(i, 'right') : undefined} disabled={!e}>
                <Check on={choices[i] === 'right'} size={11} />
                <Text style={[s.pairText, choices[i] === 'right' && s.pairChosen]}>{b}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={s.noteBox}>
        {e ? (
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="add a note..."
            placeholderTextColor={INK + '33'}
            multiline
            style={s.noteText}
          />
        ) : (
          note ? <Text style={s.noteText}>{note}</Text> : null
        )}
      </View>
    </MarkerCard>
  );
}

export default function TemplateThisOrThat() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="this-or-that" shipId={shipId}>
      <ThisOrThatContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  themLabel: { fontFamily: FontFamily.markerBold, fontWeight: '700', fontSize: 12, color: INK },
  namePill: { width: 110 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pairCard: {
    width: '47%',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
    gap: 4,
  },
  pairIndex: { fontFamily: FontFamily.markerBold, fontWeight: '600', fontSize: 9, color: INK, opacity: 0.6, letterSpacing: 0.8 },
  pairRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  pairHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  pairHalfRight: { justifyContent: 'flex-end' },
  pairText: { fontFamily: FontFamily.marker, fontWeight: '500', fontSize: 12, color: INK, flexShrink: 1 },
  pairChosen: { fontFamily: FontFamily.markerBold, fontWeight: '700', textDecorationLine: 'underline' },
  pairSlash: { fontFamily: FontFamily.marker, fontSize: 9, color: INK, opacity: 0.5 },
  noteBox: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  noteText: { fontFamily: FontFamily.script, fontSize: 13, color: INK },
});
