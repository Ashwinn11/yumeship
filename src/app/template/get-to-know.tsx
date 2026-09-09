import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, MarkerHeader, SharingRow,
  BlankPill, ProfileBlock, PhotoBox, INK, useThemedInk,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco';
import { StickerCassette } from '@/components/deco/Stickers';
import { useTemplateCtx } from '@/store/templateData';
import { FontFamily, Spacing, type SharingTemplateLabel } from '@/constants/theme';

const STICKER_ROTATE = [-6, 4, -3];
const STICKER_BADGE = ['★', '♡', '✧'];

type FilledState = Partial<{ age: string; height: string; occupation: string; good: string }>;
type DichoState = Partial<{ spoon: 'left' | 'right'; energy: 'left' | 'right'; pda: 'left' | 'right' }>;

export function GetToKnowContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = useThemedInk();

  const [vals, setVals] = useState<Record<string, string>>(() => ({
    meName:      ctx.get('meName'),
    themName:    ctx.get('themName'),
    sharing:     ctx.get('sharing'),
    meFilled:    ctx.get('meFilled', '{}'),
    meDicho:     ctx.get('meDicho', '{}'),
    themFilled:  ctx.get('themFilled', '{}'),
    themDicho:   ctx.get('themDicho', '{}'),
    meSliders:   ctx.get('meSliders', '[0.5,0.5,0.5]'),
    themSliders: ctx.get('themSliders', '[0.5,0.5,0.5]'),
    photo0:      ctx.get('photo0'),
    bannerPhoto: ctx.get('bannerPhoto'),
    mePhoto:     ctx.get('mePhoto'),
    themPhoto:   ctx.get('themPhoto'),
    memPhoto0:   ctx.get('memPhoto0'),
    memPhoto1:   ctx.get('memPhoto1'),
    memPhoto2:   ctx.get('memPhoto2'),
    memCap0:     ctx.get('memCap0'),
    memCap1:     ctx.get('memCap1'),
    memCap2:     ctx.get('memCap2'),
    song:        ctx.get('song'),
  }));

  const setVal = (key: string, v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const e = editing;
  const sharing = (vals.sharing || undefined) as SharingTemplateLabel | undefined;
  const meFilled: FilledState  = JSON.parse(vals.meFilled  || '{}');
  const meDicho:  DichoState   = JSON.parse(vals.meDicho   || '{}');
  const themFilled: FilledState = JSON.parse(vals.themFilled || '{}');
  const themDicho:  DichoState  = JSON.parse(vals.themDicho  || '{}');
  const meSliders  = JSON.parse(vals.meSliders)   as [number, number, number];
  const themSliders = JSON.parse(vals.themSliders) as [number, number, number];

  const SLIDER_LABELS = ['TRUST', 'CLINGY', 'JEALOUSY'] as const;

  const makeSliderChange = (key: 'meSliders' | 'themSliders') => (label: string, v: number) => {
    const idx = SLIDER_LABELS.indexOf(label as typeof SLIDER_LABELS[number]);
    if (idx === -1) return;
    const next = JSON.parse(vals[key]) as [number, number, number];
    next[idx] = v;
    setVal(key, JSON.stringify(next));
  };

  return (
    <MarkerCard tint={customBg ? 'transparent' : '#fffbf6'}>
      <View style={s.heartCorner}>
        <Heart size={20} color={ink} outline />
      </View>

      <View style={s.bannerBox}>
        <PhotoBox width="100%" height={100} style={s.bannerPhoto} editing={e} uri={vals.bannerPhoto} onUriChange={e ? (u) => setVal('bannerPhoto', u) : undefined} />
      </View>

      <View style={s.headerRow}>
        <View style={[s.avatarWrap, { shadowColor: ink }]}>
          <PhotoBox size={104} round style={s.avatarPhoto} editing={e} uri={vals.photo0} onUriChange={e ? (u) => setVal('photo0', u) : undefined} />
        </View>
        <View style={s.headerText}>
          <MarkerHeader size={20}>ALL ABOUT</MarkerHeader>
          <MarkerHeader size={20} style={s.mt4}>MY YUMESHIP</MarkerHeader>
        </View>
      </View>

      <View style={s.namePills}>
        <View style={s.pillHalf}>
          <BlankPill value={vals.meName} onChangeText={e ? (v) => setVal('meName', v) : undefined} placeholder="your name" style={customBg ? { backgroundColor: 'transparent' } : undefined} />
        </View>
        <Heart size={18} color={ink} outline />
        <View style={s.pillHalf}>
          <BlankPill value={vals.themName} onChangeText={e ? (v) => setVal('themName', v) : undefined} placeholder="their name" style={customBg ? { backgroundColor: 'transparent' } : undefined} />
        </View>
      </View>

      <View style={s.mt14}>
        <SharingRow
          choice={sharing}
          onChoiceChange={e ? (c) => setVal('sharing', c) : undefined}
        />
      </View>

      <ProfileBlock
        who="ME"
        filled={meFilled}
        onFilledChange={e ? (f, v) => setVal('meFilled', JSON.stringify({ ...meFilled, [f]: v })) : undefined}
        dicho={meDicho}
        onDichoChange={e ? (f, c) => {
          const next = { ...meDicho };
          if (c === null) {
            delete next[f];
          } else {
            next[f] = c;
          }
          setVal('meDicho', JSON.stringify(next));
        } : undefined}
        sliders={SLIDER_LABELS.map((l, i) => [l, meSliders[i]] as [string, number])}
        onSliderChange={e ? makeSliderChange('meSliders') : undefined}
        photoUri={vals.mePhoto}
        onPhotoUriChange={e ? (u) => setVal('mePhoto', u) : undefined}
        photoSide="right"
        transparent={!!customBg}
      />

      <ProfileBlock
        who="THEM"
        filled={themFilled}
        onFilledChange={e ? (f, v) => setVal('themFilled', JSON.stringify({ ...themFilled, [f]: v })) : undefined}
        dicho={themDicho}
        onDichoChange={e ? (f, c) => {
          const next = { ...themDicho };
          if (c === null) {
            delete next[f];
          } else {
            next[f] = c;
          }
          setVal('themDicho', JSON.stringify(next));
        } : undefined}
        sliders={SLIDER_LABELS.map((l, i) => [l, themSliders[i]] as [string, number])}
        onSliderChange={e ? makeSliderChange('themSliders') : undefined}
        photoUri={vals.themPhoto}
        onPhotoUriChange={e ? (u) => setVal('themPhoto', u) : undefined}
        transparent={!!customBg}
      />

      <View style={s.boothWrap}>
        <MarkerHeader size={13} style={s.boothLabel}>♡ photo booth ✧</MarkerHeader>
        <View style={s.boothStrip}>
          <View style={s.sparkTL} pointerEvents="none"><Sparkle size={12} color={ink} /></View>
          <View style={s.sparkBR} pointerEvents="none"><Sparkle size={16} color={ink} /></View>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[s.sticker, { transform: [{ rotate: `${STICKER_ROTATE[i]}deg` }] }]}>
              <View style={[s.stickerBadge, { borderColor: ink }]}>
                <Text style={{ fontSize: 10 }}>{STICKER_BADGE[i]}</Text>
              </View>
              <PhotoBox
                size={78}
                style={s.stickerPhoto}
                editing={e}
                uri={vals[`memPhoto${i}`]}
                onUriChange={e ? (u) => setVal(`memPhoto${i}`, u) : undefined}
              />
              {e ? (
                <TextInput
                  value={vals[`memCap${i}`] ?? ''}
                  onChangeText={(v) => setVal(`memCap${i}`, v)}
                  placeholder="caption~"
                  placeholderTextColor={ink + '77'}
                  style={[s.stickerCaption, { color: ink }]}
                />
              ) : vals[`memCap${i}`] ? (
                <Text style={[s.stickerCaption, { color: ink }]} numberOfLines={1}>{vals[`memCap${i}`]}</Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View style={s.nudgeWrap}>
        <View style={[s.nudgeBubble, { borderColor: ink }, customBg ? { backgroundColor: 'transparent' } : null]}>
          <StickerCassette size={22} />
          {e ? (
            <TextInput
              value={vals.song}
              onChangeText={(v) => setVal('song', v)}
              placeholder="our song..."
              placeholderTextColor={ink + '77'}
              style={[s.nudgeText, { color: ink }]}
            />
          ) : (
            <Text style={[s.nudgeText, { color: ink }]}>{vals.song || 'our song...'}</Text>
          )}
        </View>
        <View style={[s.nudgeTail, { borderTopColor: ink }]} />
      </View>
    </MarkerCard>
  );
}

export default function TemplateGetToKnow() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="get-to-know" shipId={shipId}>
      <GetToKnowContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  heartCorner: { position: 'absolute', top: 14, right: 16 },
  bannerBox: { marginHorizontal: -20, marginTop: -20 },
  bannerPhoto: { borderRadius: 0, borderWidth: 0 },
  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end', marginTop: -40 },
  avatarWrap: {
    borderWidth: 3, borderColor: '#fffbf6', borderRadius: 999,
    shadowColor: INK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  avatarPhoto: { borderWidth: 0 },
  headerText: { flex: 1, paddingBottom: 4 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt14: { marginTop: 14 },
  namePills: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 14 },
  pillHalf: { flex: 1 },
  boothWrap: { marginTop: 18, position: 'relative' },
  boothLabel: { fontSize: 13, textAlign: 'center', marginBottom: 10 },
  boothStrip: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingVertical: 10, position: 'relative' },
  sparkTL: { position: 'absolute', top: -4, left: 8 },
  sparkBR: { position: 'absolute', bottom: -2, right: 10 },
  sticker: {
    backgroundColor: '#fff',
    padding: 5,
    paddingBottom: 8,
    borderRadius: 4,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  stickerPhoto: { borderRadius: 2, borderWidth: 0 },
  stickerBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stickerCaption: { fontFamily: FontFamily.script, fontSize: 13, marginTop: 2, maxWidth: 78, textAlign: 'center' },
  nudgeWrap: { alignItems: 'center', marginTop: 16 },
  nudgeBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 140,
  },
  nudgeText: { flex: 1, fontFamily: FontFamily.ja, fontSize: 12 },
  nudgeTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
