import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MarkerCard, TitleHeader, MarkerHeader, BlankPill, INK,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

export function LoveLetterContent({ editing = false }: { editing?: boolean }) {
  const [dearName, setDearName] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [signName, setSignName] = useState('');
  const [things, setThings] = useState(['', '', '', '', '']);
  const e = editing;

  const setThing = (i: number) =>
    e ? (v: string) => setThings((p) => p.map((t, j) => (j === i ? v : t))) : undefined;

  return (
    <MarkerCard tint="#fff5f0">
      <View style={s.watermark} pointerEvents="none">
        <Heart size={140} color={INK} />
      </View>

      <TitleHeader title="A LOVE LETTER" subtitle="for the one i never got to send" by="@inkdrop.diary" />

      <View style={s.letterBox}>
        <View style={s.dearLabel}>
          <View style={s.dearRow}>
            <Text style={s.dearText}>DEAR </Text>
            {e ? (
              <TextInput
                value={dearName}
                onChangeText={setDearName}
                placeholder="name"
                placeholderTextColor={INK + '44'}
                style={s.dearNameInput}
              />
            ) : (
              <Text style={s.dearName}> — </Text>
            )}
            <Text style={s.dearText}>,</Text>
          </View>
        </View>

        {e ? (
          <TextInput
            value={letterBody}
            onChangeText={setLetterBody}
            placeholder="write your letter here..."
            placeholderTextColor={INK + '33'}
            multiline
            style={s.letterBody}
          />
        ) : (
          <View style={{ minHeight: 120 }} />
        )}

        <Text style={s.signoff}>yours, always —</Text>
        <View style={s.signName}>
          <BlankPill
            value={e ? signName : undefined}
            onChangeText={e ? setSignName : undefined}
            width={120}
          />
        </View>
      </View>

      <View style={s.thingsSection}>
        <MarkerHeader size={13} style={s.thingsTitle}>5 THINGS I LOVE</MarkerHeader>
        <View style={s.thingsGrid}>
          {things.map((_, i) => (
            <View key={i} style={s.thingCard}>
              <Heart size={11} color={INK} outline={i === 4} />
              <View style={s.thingTextBox}>
                <BlankPill value={e ? things[i] : undefined} onChangeText={setThing(i)} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </MarkerCard>
  );
}

export default function TemplateLoveLetter() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.appBar}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <LoveLetterContent editing />
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
  watermark: { position: 'absolute', top: 28, right: 24, opacity: 0.08 },
  letterBox: {
    marginTop: 12,
    padding: 16,
    paddingTop: 20,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 200,
    position: 'relative',
  },
  dearLabel: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
  },
  dearRow: { flexDirection: 'row', alignItems: 'center' },
  dearText: {
    fontFamily: FontFamily.markerBold,
    fontWeight: '700',
    fontSize: 11,
    color: INK,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dearName: {
    fontFamily: FontFamily.ja,
    fontWeight: '400',
    fontSize: 11,
    color: INK,
  },
  dearNameInput: {
    fontFamily: FontFamily.ja,
    fontSize: 11,
    color: INK,
    minWidth: 60,
    borderBottomWidth: 1,
    borderBottomColor: INK + '66',
    padding: 0,
    paddingHorizontal: 2,
  },
  letterBody: {
    fontFamily: FontFamily.ja,
    fontSize: 12,
    color: INK,
    lineHeight: 20,
    marginTop: 4,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  signoff: {
    fontFamily: FontFamily.script,
    fontSize: 16,
    color: INK,
    marginTop: 12,
  },
  signName: { marginTop: 8 },
  thingsSection: { marginTop: 14 },
  thingsTitle: { marginBottom: 8 },
  thingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  thingCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: INK,
    borderRadius: 4,
  },
  thingTextBox: { flex: 1 },
});
