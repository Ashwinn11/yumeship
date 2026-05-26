import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  MarkerCard, ScriptCredit, PhotoBox, Polaroid, WindowFrame, MusicPlayer, BlankPill, INK,
} from '@/components/templates/primitives';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { Heart } from '@/components/deco/Heart';
import { FontFamily } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';

const SWATCHES = ['#8b3a4a', '#d77a8d', '#f3b6c4', '#fadde5', '#1f1219'];

export function AestheticContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const [vals, setVals] = useState(() => ({
    song:     ctx.get('song'),
    cap0:     ctx.get('cap0', 'rainy tuesday'),
    cap1:     ctx.get('cap1', 'green coat day'),
    cap2:     ctx.get('cap2', 'first scene'),
    photo0:   ctx.get('photo0'),
    photo1:   ctx.get('photo1'),
    photo2:   ctx.get('photo2'),
    polPh0:   ctx.get('polPh0'),
    polPh1:   ctx.get('polPh1'),
    polPh2:   ctx.get('polPh2'),
  }));
  const e = editing;

  const set = (key: keyof typeof vals) => (v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };
  const { song, cap0, cap1, cap2, photo0, photo1, photo2, polPh0, polPh1, polPh2 } = vals;

  return (
    <MarkerCard tint="#fffbf6">
      <WindowFrame title="My Yumeship Aesthetic">
        <View style={s.photoGrid}>
          <PhotoBox width="31%" height={90} style={s.gridPhoto} editing={e} uri={photo0} onUriChange={e ? set('photo0') : undefined} />
          <PhotoBox width="31%" height={90} style={s.gridPhoto} editing={e} uri={photo1} onUriChange={e ? set('photo1') : undefined} />
          <PhotoBox width="31%" height={90} style={s.gridPhoto} editing={e} uri={photo2} onUriChange={e ? set('photo2') : undefined} />
        </View>
      </WindowFrame>

      <View style={s.gap12} />

      <WindowFrame title="Our song">
        {e && (
          <View style={s.songPill}>
            <BlankPill value={song} onChangeText={set('song')} placeholder="song title" />
          </View>
        )}
        <MusicPlayer track={song || undefined} />
      </WindowFrame>

      <View style={s.gap12} />

      <View style={s.polaroidArea}>
        <Polaroid size={110} rotate={-7} tapeColor="#fadde5" style={s.pol1} editing={e} caption={cap0} onCaptionChange={e ? set('cap0') : undefined} uri={polPh0} onUriChange={e ? set('polPh0') : undefined} />
        <Polaroid size={115} rotate={5}  tapeColor="#ece4f7" style={s.pol2} editing={e} caption={cap1} onCaptionChange={e ? set('cap1') : undefined} uri={polPh1} onUriChange={e ? set('polPh1') : undefined} />
        <Polaroid size={105} rotate={-4} tapeColor="#fbecc4" style={s.pol3} editing={e} caption={cap2} onCaptionChange={e ? set('cap2') : undefined} uri={polPh2} onUriChange={e ? set('polPh2') : undefined} />
      </View>

      <View style={s.gap12} />

      <WindowFrame title="Palette">
        <View style={s.paletteRow}>
          {SWATCHES.map((c) => (
            <View key={c} style={[s.swatch, { backgroundColor: c }]} />
          ))}
          <Text style={s.paletteLabel}>sakura · wine</Text>
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
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="aesthetic" shipId={shipId}>
      <AestheticContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  photoGrid: { flexDirection: 'row', gap: 8 },
  gridPhoto: { flex: 1 },
  gap12: { height: 12 },
  songPill: { marginBottom: 8 },
  polaroidArea: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', marginTop: 4, paddingVertical: 8 },
  pol1: { marginTop: 0 },
  pol2: { marginTop: 24 },
  pol3: { marginTop: 10 },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  swatch: { width: 26, height: 26, borderWidth: 1.5, borderColor: INK, borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 },
  paletteLabel: { marginLeft: 8, fontFamily: FontFamily.script, fontSize: 13, color: INK },
});
