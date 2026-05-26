import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MarkerCard, MarkerHeader, ScriptCredit, SharingRow,
  BlankPill, ProfileBlock, PhotoBox, INK,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

type FilledState = Partial<{ age: string; height: string; occupation: string; good: string }>;
type DichoState = Partial<{ spoon: 'left' | 'right'; energy: 'left' | 'right'; pda: 'left' | 'right' }>;

export function GetToKnowContent({ editing = false }: { editing?: boolean }) {
  const [meName, setMeName] = useState('');
  const [themName, setThemName] = useState('');
  const [sharing, setSharing] = useState<'Yes' | 'No' | 'Selective' | undefined>(undefined);
  const [meFilled, setMeFilled] = useState<FilledState>({});
  const [meDicho, setMeDicho] = useState<DichoState>({});
  const [themFilled, setThemFilled] = useState<FilledState>({});
  const [themDicho, setThemDicho] = useState<DichoState>({});

  const e = editing;

  return (
    <MarkerCard tint="#fffbf6">
      <View style={s.heartCorner}>
        <Heart size={20} color={INK} outline />
      </View>

      <View style={s.headerRow}>
        <View style={s.portraitBox}>
          <PhotoBox size={120} onPress={e ? () => {} : undefined} />
          <View style={s.portraitInner}>
            <PhotoBox size={80} round onPress={e ? () => {} : undefined} />
          </View>
        </View>
        <View style={s.headerText}>
          <MarkerHeader size={20}>GET TO KNOW</MarkerHeader>
          <MarkerHeader size={20} style={s.mt4}>MY YUMESHIP</MarkerHeader>
          <View style={s.mt8}><ScriptCredit by="@reversiblekisses" /></View>
        </View>
      </View>

      <View style={s.namePills}>
        <View style={s.pillHalf}>
          <BlankPill value={e ? meName : undefined} onChangeText={e ? setMeName : undefined} placeholder="your name" />
        </View>
        <Heart size={18} color={INK} outline />
        <View style={s.pillHalf}>
          <BlankPill value={e ? themName : undefined} onChangeText={e ? setThemName : undefined} placeholder="their name" />
        </View>
      </View>

      <View style={s.mt14}>
        <SharingRow choice={sharing} onChoiceChange={e ? setSharing : undefined} />
      </View>

      <ProfileBlock
        who="ME"
        filled={meFilled}
        onFilledChange={e ? (f, v) => setMeFilled(p => ({ ...p, [f]: v })) : undefined}
        dicho={meDicho}
        onDichoChange={e ? (f, c) => setMeDicho(p => ({ ...p, [f]: c })) : undefined}
        showPhoto
      />

      <ProfileBlock
        who="THEM"
        filled={themFilled}
        onFilledChange={e ? (f, v) => setThemFilled(p => ({ ...p, [f]: v })) : undefined}
        dicho={themDicho}
        onDichoChange={e ? (f, c) => setThemDicho(p => ({ ...p, [f]: c })) : undefined}
      />
    </MarkerCard>
  );
}

export default function TemplateGetToKnow() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.appBar}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <GetToKnowContent editing />
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
  heartCorner: { position: 'absolute', top: 14, right: 16 },
  headerRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  portraitBox: { position: 'relative', width: 120, height: 120 },
  portraitInner: { position: 'absolute', top: 20, left: 20 },
  headerText: { flex: 1, paddingTop: 4 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt14: { marginTop: 14 },
  namePills: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 14 },
  pillHalf: { flex: 1 },
});
