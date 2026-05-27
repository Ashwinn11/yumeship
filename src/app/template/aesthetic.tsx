import { useState } from 'react';
import { Modal, Pressable, TouchableWithoutFeedback, View, Text, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  MarkerCard, ScriptCredit, PhotoBox, Polaroid, WindowFrame, MusicPlayer, INK,
} from '@/components/templates/primitives';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { getShip } from '@/store/ships';

const PALETTE_OPTIONS = [
  '#8b3a4a', '#d77a8d', '#f3b6c4', '#fadde5',
  '#6b4da3', '#9b7fd4', '#c9b8e8', '#ece4f7',
  '#b76b48', '#e8a07a', '#f4c09a', '#fde0ce',
  '#4a7050', '#7aad82', '#b4cba5', '#e0ebd4',
  '#9b7c20', '#d4a830', '#f0daa0', '#fdf3d0',
  '#1a2a4a', '#3a6fa8', '#b8d4f0', '#e8f2fc',
  '#1f1219', '#4a3a40', '#9a8a90', '#f5f0f2',
];

const DEFAULT_PALETTE = ['#8b3a4a', '#d77a8d', '#f3b6c4', '#fadde5', '#1f1219'];

export function AestheticContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const e = editing;

  const [vals, setVals] = useState(() => ({
    song:   ctx.get('song'),
    cap0:   ctx.get('cap0', 'rainy tuesday'),
    cap1:   ctx.get('cap1', 'green coat day'),
    cap2:   ctx.get('cap2', 'first scene'),
    photo0: ctx.get('photo0'),
    photo1: ctx.get('photo1'),
    photo2: ctx.get('photo2'),
    polPh0: ctx.get('polPh0'),
    polPh1: ctx.get('polPh1'),
    polPh2: ctx.get('polPh2'),
    pal0:   ctx.get('pal0', DEFAULT_PALETTE[0]),
    pal1:   ctx.get('pal1', DEFAULT_PALETTE[1]),
    pal2:   ctx.get('pal2', DEFAULT_PALETTE[2]),
    pal3:   ctx.get('pal3', DEFAULT_PALETTE[3]),
    pal4:   ctx.get('pal4', DEFAULT_PALETTE[4]),
  }));

  const [pickingIdx, setPickingIdx] = useState<number | null>(null);

  const set = (key: keyof typeof vals) => (v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const palette = [vals.pal0, vals.pal1, vals.pal2, vals.pal3, vals.pal4];
  const palKeys = ['pal0', 'pal1', 'pal2', 'pal3', 'pal4'] as const;

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
        <View style={{ padding: 2 }}>
          {e ? (
            <TextInput
              value={song ?? ''}
              onChangeText={set('song')}
              placeholder="song title..."
              placeholderTextColor={INK + '88'}
              underlineColorAndroid="transparent"
              style={{ fontFamily: FontFamily.ui, fontSize: 14, color: INK, marginBottom: 6, padding: 0 }}
            />
          ) : (
            song ? <Text style={{ fontFamily: FontFamily.ui, fontSize: 14, color: INK, marginBottom: 6 }}>{song}</Text> : null
          )}
          <MusicPlayer />
        </View>
      </WindowFrame>

      <View style={s.gap12} />

      <View style={s.polaroidArea}>
        <Polaroid size={120} rotate={-7} tapeColor="#fadde5" style={s.pol1} editing={e} caption={cap0} onCaptionChange={e ? set('cap0') : undefined} uri={polPh0} onUriChange={e ? set('polPh0') : undefined} />
        <Polaroid size={125} rotate={5}  tapeColor="#ece4f7" style={s.pol2} editing={e} caption={cap1} onCaptionChange={e ? set('cap1') : undefined} uri={polPh1} onUriChange={e ? set('polPh1') : undefined} />
        <Polaroid size={115} rotate={-4} tapeColor="#fbecc4" style={s.pol3} editing={e} caption={cap2} onCaptionChange={e ? set('cap2') : undefined} uri={polPh2} onUriChange={e ? set('polPh2') : undefined} />
      </View>

      <View style={s.gap12} />

      <WindowFrame title="Palette">
        <View style={s.paletteRow}>
          {palette.map((c, i) => (
            <Pressable
              key={i}
              style={[s.swatch, { backgroundColor: c }]}
              onPress={e ? () => setPickingIdx(i) : undefined}
            >
              {e && <View style={s.swatchEdit}><Text style={s.swatchEditDot}>·</Text></View>}
            </Pressable>
          ))}
        </View>
        {e && <Text style={s.palHint}>tap a swatch to change its color</Text>}
      </WindowFrame>

      <View style={s.footer}>
        <ScriptCredit by="@cloudbloom.kr" />
        <Heart size={20} color={INK} outline />
      </View>

      {/* Color picker modal */}
      <Modal visible={pickingIdx !== null} transparent animationType="fade" onRequestClose={() => setPickingIdx(null)}>
        <TouchableWithoutFeedback onPress={() => setPickingIdx(null)}>
          <View style={s.pickerOverlay} />
        </TouchableWithoutFeedback>
        <View style={s.pickerSheet}>
          <View style={s.pickerHandle} />
          <Text style={s.pickerTitle}>pick a color</Text>
          <View style={s.pickerGrid}>
            {PALETTE_OPTIONS.map((c) => (
              <Pressable
                key={c}
                style={[
                  s.pickerSwatch,
                  { backgroundColor: c },
                  pickingIdx !== null && palette[pickingIdx] === c && s.pickerSwatchActive,
                ]}
                onPress={() => {
                  if (pickingIdx !== null) {
                    set(palKeys[pickingIdx])(c);
                  }
                  setPickingIdx(null);
                }}
              />
            ))}
          </View>
        </View>
      </Modal>
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
  polaroidArea: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 4, paddingVertical: 8 },
  pol1: { marginTop: 0, marginRight: -15, zIndex: 1 },
  pol2: { marginTop: 18, zIndex: 3 },
  pol3: { marginTop: 40, marginLeft: -15, zIndex: 2 },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 28, height: 28, borderWidth: 1.5, borderColor: INK, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  swatchEdit: { position: 'absolute', bottom: 1, right: 2 },
  swatchEditDot: { fontSize: 8, color: 'rgba(255,255,255,0.8)' },
  palHint: { fontFamily: FontFamily.ui, fontSize: 9, color: INK + '60', marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 },

  // Picker
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerSheet: {
    backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5,
    padding: Spacing.s5, paddingBottom: 40,
  },
  pickerHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.s4 },
  pickerTitle: { fontFamily: FontFamily.displayItalic, fontSize: 16, color: Colors.ink, marginBottom: Spacing.s4 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pickerSwatch: { width: 36, height: 36, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.line },
  pickerSwatchActive: { borderColor: Colors.ink, borderWidth: 2.5 },
});
