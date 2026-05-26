import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MarkerCard, TitleHeader, BlankPill, Check, INK,
} from '@/components/templates/primitives';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

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

export function ThisOrThatContent({ editing = false }: { editing?: boolean }) {
  const [name, setName] = useState('');
  const [choices, setChoices] = useState<('left' | 'right' | null)[]>(PAIRS.map(() => null));
  const e = editing;

  const pick = (i: number, side: 'left' | 'right') =>
    setChoices((prev) => prev.map((c, j) => (j === i ? side : c)));

  return (
    <MarkerCard tint="#fffbf6">
      <TitleHeader title="THIS or THAT" subtitle="how do they choose?" by="@softfangs" />

      <View style={s.nameRow}>
        <Text style={s.themLabel}>♡ THEM:</Text>
        <View style={s.namePill}>
          <BlankPill value={e ? name : undefined} onChangeText={e ? setName : undefined} />
        </View>
      </View>

      <View style={s.grid}>
        {PAIRS.map(([a, b], i) => (
          <View key={i} style={s.pairCard}>
            <Text style={s.pairIndex}>0{i + 1}</Text>
            <View style={s.pairRow}>
              <Pressable onPress={e ? () => pick(i, 'left') : undefined} disabled={!e}>
                <Text style={[s.pairText, choices[i] === 'left' && s.pairChosen]}>{a}</Text>
              </Pressable>
              <Check on={choices[i] === 'left'} size={11} />
              <Text style={s.pairSlash}>/</Text>
              <Check on={choices[i] === 'right'} size={11} />
              <Pressable onPress={e ? () => pick(i, 'right') : undefined} disabled={!e}>
                <Text style={[s.pairText, choices[i] === 'right' && s.pairChosen]}>{b}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={s.noteBox}>
        <Text style={s.noteText} />
      </View>
    </MarkerCard>
  );
}

export default function TemplateThisOrThat() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.appBar}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ThisOrThatContent editing />
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
  pairRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  pairText: { fontFamily: FontFamily.marker, fontWeight: '500', fontSize: 12, color: INK, flexShrink: 1 },
  pairChosen: { fontFamily: FontFamily.markerBold, fontWeight: '700', textDecorationLine: 'underline' },
  pairSlash: { fontFamily: FontFamily.marker, fontSize: 9, color: INK, opacity: 0.5 },
  noteBox: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: INK,
    borderStyle: 'dashed',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  noteText: { fontFamily: FontFamily.script, fontSize: 13, color: INK },
  noteBold: { fontFamily: FontFamily.scriptBold, fontWeight: '700' },
});
