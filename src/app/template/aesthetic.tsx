import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MarkerCard, ScriptCredit, PhotoBox, Polaroid, WindowFrame, MusicPlayer, BlankPill, INK,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

const SWATCHES = ['#8b3a4a', '#d77a8d', '#f3b6c4', '#fadde5', '#1f1219'];

export function AestheticContent({ editing = false }: { editing?: boolean }) {
  const [song, setSong] = useState('');
  const e = editing;

  return (
    <MarkerCard tint="#fffbf6">
      <WindowFrame title="My Yumeship Aesthetic">
        <View style={s.photoGrid}>
          <PhotoBox width="31%" height={90} style={s.gridPhoto} onPress={e ? () => {} : undefined} />
          <PhotoBox width="31%" height={90} style={s.gridPhoto} onPress={e ? () => {} : undefined} />
          <PhotoBox width="31%" height={90} style={s.gridPhoto} onPress={e ? () => {} : undefined} />
        </View>
      </WindowFrame>

      <View style={s.gap12} />

      <WindowFrame title="Our song">
        {e && (
          <View style={s.songPill}>
            <BlankPill value={song} onChangeText={setSong} placeholder="song title" />
          </View>
        )}
        <MusicPlayer track={song || undefined} />
      </WindowFrame>

      <View style={s.gap12} />

      <View style={s.polaroidArea}>
        <Polaroid size={130} rotate={-7} tapeColor="#fadde5" style={s.pol1} />
        <Polaroid size={140} rotate={6}  tapeColor="#ece4f7" style={s.pol2} />
        <Polaroid size={120} rotate={-3} tapeColor="#fbecc4" style={s.pol3} />
      </View>

      <View style={s.gap12} />

      <WindowFrame title="Palette">
        <View style={s.paletteRow}>
          {SWATCHES.map((c) => (
            <View key={c} style={[s.swatch, { backgroundColor: c }]} />
          ))}
        </View>
      </WindowFrame>

      <View style={s.footer}>
        <ScriptCredit by="@cloudbloom.kr" />
        <Heart size={20} color={INK} outline />
      </View>
    </MarkerCard>
  );
}

export default function TemplateAesthetic() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.appBar}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <AestheticContent editing />
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
  photoGrid: { flexDirection: 'row', gap: 8 },
  gridPhoto: { flex: 1 },
  gap12: { height: 12 },
  songPill: { marginBottom: 8 },
  polaroidArea: { height: 240, position: 'relative', marginTop: 4 },
  pol1: { position: 'absolute', top: 10, left: 10 },
  pol2: { position: 'absolute', top: 30, left: 150 },
  pol3: { position: 'absolute', top: 60, right: 10 },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  swatch: { width: 26, height: 26, borderWidth: 1.5, borderColor: INK, borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 },
});
