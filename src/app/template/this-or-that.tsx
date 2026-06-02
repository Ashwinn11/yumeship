import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, TitleHeader, Check, INK,
} from '@/components/templates/primitives';
import { CalloutBubble } from '@/components/ui/Callouts';
import { FontFamily ,sf } from '@/constants/theme';
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
    <View style={{ padding: 10 }}>
      <TitleHeader title="THIS or THAT" subtitle="how do they choose?" by="@softfangs" />

      <View style={s.nameRow}>
        <Text style={s.themLabel}>♡ THEM:</Text>
        <Text style={s.themName}>{name || '——'}</Text>
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

      <View style={s.noteWrap}>
        <CalloutBubble tone="pink" raw>
          <TextInput
            value={note}
            onChangeText={e ? setNote : undefined}
            editable={e}
            placeholder="she pretends to be the talker. she's not."
            placeholderTextColor="#d77a8d88"
            multiline
            underlineColorAndroid="transparent"
            style={s.noteText}
          />
        </CalloutBubble>
      </View>
    </View>
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  themLabel: { fontFamily: FontFamily.markerBold, fontWeight: '700', fontSize: sf(12), color: INK },
  themName: { fontFamily: FontFamily.ja, fontWeight: '600', fontSize: sf(12), color: INK },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pairCard: {
    width: '48.5%',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
    gap: 4,
  },
  pairIndex: { fontFamily: FontFamily.markerBold, fontWeight: '600', fontSize: sf(9), color: INK, opacity: 0.85, letterSpacing: 0.8 },
  pairRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pairHalf: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pairHalfRight: {},
  pairText: { fontFamily: FontFamily.marker, fontWeight: '500', fontSize: sf(11), color: INK },
  pairChosen: { fontFamily: FontFamily.markerBold, fontWeight: '700', textDecorationLine: 'underline' },
  pairSlash: { fontFamily: FontFamily.marker, fontSize: sf(9), color: INK, opacity: 0.7, marginHorizontal: 2 },
  noteWrap: { marginTop: 14, alignItems: 'center' },
  noteText: {
    fontFamily: FontFamily.script,
    fontSize: sf(16),
    color: '#8b3a4a',
    lineHeight: 18,
    textAlign: 'center',
    minWidth: 180,
  },
});
