import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MarkerCard, TitleHeader, TemplateField, SharingRow, TwinProfile, HeartClipPhoto, BlankPill, INK, FILL_GRAY,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

export function HeartFrameContent({ editing = false }: { editing?: boolean }) {
  const [sharing, setSharing] = useState<'Yes' | 'No' | 'Selective' | undefined>(undefined);
  const [meName, setMeName] = useState('');
  const [themName, setThemName] = useState('');
  const [meInfo, setMeInfo] = useState(['', '', '', '']);
  const [themInfo, setThemInfo] = useState(['', '', '', '']);
  const [metText, setMetText] = useState('');
  const [anniv, setAnniv] = useState('');
  const e = editing;

  const INFO_LABELS = ['age', 'pronouns', 'pet name', 'love language'];
  const meInfoPairs: [string, string?][] = INFO_LABELS.map((l, i) => [l, meInfo[i]]);
  const themInfoPairs: [string, string?][] = INFO_LABELS.map((l, i) => [l, themInfo[i]]);

  return (
    <MarkerCard tint="#fff5f6">
      <TitleHeader title="GET TO KNOW MY YUMESHIP!!" subtitle="our love in one page" by="@bunny.thoughts" />

      <View style={s.mt6}>
        <SharingRow choice={sharing} onChoiceChange={e ? setSharing : undefined} />
      </View>

      <View style={s.heartPhotoRow}>
        <HeartClipPhoto width={180} height={160} />
      </View>

      <View style={s.namesRow}>
        <TemplateField
          label="me"
          value={e ? meName : undefined}
          onChangeText={e ? setMeName : undefined}
          valueWidth={80}
        />
        <Heart size={16} color={INK} />
        <TemplateField
          label="them"
          value={e ? themName : undefined}
          onChangeText={e ? setThemName : undefined}
          valueWidth={80}
        />
      </View>

      <View style={s.twinGrid}>
        <View style={s.twinCol}>
          <TwinProfile
            who="ME"
            info={meInfoPairs}
            onInfoChange={e ? (i, v) => setMeInfo((p) => p.map((x, j) => (j === i ? v : x))) : undefined}
          />
        </View>
        <View style={s.twinCol}>
          <TwinProfile
            who="THEM"
            info={themInfoPairs}
            onInfoChange={e ? (i, v) => setThemInfo((p) => p.map((x, j) => (j === i ? v : x))) : undefined}
          />
        </View>
      </View>

      <View style={s.metBox}>
        <Text style={s.metLabel}>how we met</Text>
        {e ? (
          <TextInput
            value={metText}
            onChangeText={setMetText}
            placeholder="our story..."
            placeholderTextColor={INK + '33'}
            multiline
            style={s.metText}
          />
        ) : (
          <View style={{ minHeight: 40 }} />
        )}
      </View>

      <View style={s.anniversaryPill}>
        <Text style={s.anniversaryLabel}>♡ anniversary</Text>
        <View style={{ flex: 1 }}>
          <BlankPill value={e ? anniv : undefined} onChangeText={e ? setAnniv : undefined} />
        </View>
      </View>
    </MarkerCard>
  );
}

export default function TemplateHeartFrame() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.appBar}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <HeartFrameContent editing />
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
  mt6: { marginTop: 6, marginBottom: 12 },
  heartPhotoRow: { alignItems: 'center', marginVertical: 10 },
  namesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 },
  twinGrid: { flexDirection: 'row', gap: 10 },
  twinCol: { flex: 1 },
  metBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
  },
  metLabel: {
    fontFamily: FontFamily.markerBold,
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: INK,
    opacity: 0.7,
    marginBottom: 4,
  },
  metText: {
    fontFamily: FontFamily.ja,
    fontSize: 12,
    color: INK,
    lineHeight: 18,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  anniversaryPill: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: FILL_GRAY,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 999,
    gap: 10,
  },
  anniversaryLabel: { fontFamily: FontFamily.markerBold, fontWeight: '700', fontSize: 10, color: INK, letterSpacing: 0.8, textTransform: 'uppercase' },
});
