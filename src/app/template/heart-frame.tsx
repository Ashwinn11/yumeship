import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, TitleHeader, SharingRow, TwinProfile, HeartClipPhoto, BlankPill, PolarSlider, MemoriesPhotoRow, INK, FILL_GRAY,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { FontFamily ,sf, type SharingTemplateLabel } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { DateField, calcElapsed } from '@/components/ui/DateField';

const BLANK_INFO = ['', '', '', ''];
const INFO_LABELS = ['pronouns', 'mbti', 'relationship vibe', 'sexuality'];
const BLANK_SLIDERS = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
const SLIDER_PAIRS = [
  ['Friendly', 'Aloof'],
  ['Emotional', 'Logical'],
  ['Romantic', 'Allergic to Affection'],
  ['Pure', 'High Libido'],
  ['Clingy', 'Distant'],
  ['Jealous', 'Chill'],
] as const;

export function HeartFrameContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = ctx.textColor || INK;

  const [vals, setVals] = useState<{
    sharing: SharingTemplateLabel | undefined;
    meName: string;
    themName: string;
    meInfo: string[];
    themInfo: string[];
    meSliders: string;
    themSliders: string;
    anniv: string;
    mePhoto: string;
    themPhoto: string;
    memPhoto0: string; memPhoto1: string; memPhoto2: string;
    memCap0: string; memCap1: string; memCap2: string;
  }>(() => {
    const sharingRaw = ctx.get('sharing');
    return {
      sharing: (sharingRaw as SharingTemplateLabel) || undefined,
      meName: ctx.get('meName'),
      themName: ctx.get('themName'),
      meInfo: JSON.parse(ctx.get('meInfo', 'null')) ?? [...BLANK_INFO],
      themInfo: JSON.parse(ctx.get('themInfo', 'null')) ?? [...BLANK_INFO],
      meSliders: ctx.get('meSliders', JSON.stringify(BLANK_SLIDERS)),
      themSliders: ctx.get('themSliders', JSON.stringify(BLANK_SLIDERS)),
      anniv: ctx.get('anniv'),
      mePhoto: ctx.get('mePhoto'),
      themPhoto: ctx.get('themPhoto'),
      memPhoto0: ctx.get('memPhoto0'), memPhoto1: ctx.get('memPhoto1'), memPhoto2: ctx.get('memPhoto2'),
      memCap0: ctx.get('memCap0'), memCap1: ctx.get('memCap1'), memCap2: ctx.get('memCap2'),
    };
  });

  const setMem = (key: string, v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const e = editing;

  const set = (key: 'meName' | 'themName' | 'anniv') => (v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const setSharing = (v: SharingTemplateLabel) => {
    setVals((p) => ({ ...p, sharing: v }));
    ctx.set('sharing', v);
  };

  const setMeInfo = (i: number, v: string) => {
    setVals((p) => {
      const next = p.meInfo.map((x, j) => (j === i ? v : x));
      ctx.set('meInfo', JSON.stringify(next));
      return { ...p, meInfo: next };
    });
  };

  const setThemInfo = (i: number, v: string) => {
    setVals((p) => {
      const next = p.themInfo.map((x, j) => (j === i ? v : x));
      ctx.set('themInfo', JSON.stringify(next));
      return { ...p, themInfo: next };
    });
  };

  const { sharing, meName, themName, meInfo, themInfo, anniv, mePhoto, themPhoto } = vals;

  const meInfoPairs: [string, string?][] = INFO_LABELS.map((l, i) => [l, meInfo[i]]);
  const themInfoPairs: [string, string?][] = INFO_LABELS.map((l, i) => [l, themInfo[i]]);

  const meSliders = JSON.parse(vals.meSliders || JSON.stringify(BLANK_SLIDERS)) as number[];
  const themSliders = JSON.parse(vals.themSliders || JSON.stringify(BLANK_SLIDERS)) as number[];
  const setMeSlider = (i: number, v: number) => {
    const next = [...meSliders];
    next[i] = v;
    setMem('meSliders', JSON.stringify(next));
  };
  const setThemSlider = (i: number, v: number) => {
    const next = [...themSliders];
    next[i] = v;
    setMem('themSliders', JSON.stringify(next));
  };

  return (
    <MarkerCard tint={customBg ? 'transparent' : '#fff5f6'}>
      <TitleHeader title="ALL ABOUT MY YUMESHIP!!" subtitle="our love in one page" />

      <View style={s.mt6}>
        <SharingRow choice={sharing} onChoiceChange={e ? setSharing : undefined} />
      </View>

      <View style={s.heartPhotoRow}>
        <Svg width={90} height={56} viewBox="0 0 90 56" style={s.bowDeco}>
          <Path d="M6 26 Q 24 4, 45 22 Q 66 4, 84 26 L 45 42 Z" fill={ink} opacity={0.85} />
          <Path d="M45 42 L 35 56 L 45 49 L 55 56 Z" fill={ink} opacity={0.85} />
        </Svg>
        <HeartClipPhoto
          width={180}
          height={160}
          editing={e}
          leftUri={mePhoto || undefined}
          rightUri={themPhoto || undefined}
          onLeftUriChange={e ? (u) => { setVals((p) => ({ ...p, mePhoto: u })); ctx.set('mePhoto', u); } : undefined}
          onRightUriChange={e ? (u) => { setVals((p) => ({ ...p, themPhoto: u })); ctx.set('themPhoto', u); } : undefined}
        />
      </View>

      <View style={s.namesRow}>
        <View style={s.namePillContainer}>
          <BlankPill value={meName} onChangeText={e ? set('meName') : undefined} placeholder="your name" width={92} style={customBg ? { backgroundColor: 'transparent' } : undefined} />
        </View>
        <Heart size={16} color={ink} />
        <View style={s.namePillContainer}>
          <BlankPill value={themName} onChangeText={e ? set('themName') : undefined} placeholder="their name" width={92} style={customBg ? { backgroundColor: 'transparent' } : undefined} />
        </View>
      </View>

      <View style={s.twinGrid}>
        <View style={s.twinCol}>
          <TwinProfile
            who={meName || 'ME'}
            info={meInfoPairs}
            onInfoChange={e ? (i, v) => setMeInfo(i, v) : undefined}
            transparent={!!customBg}
          />
        </View>

        <View style={s.twinCol}>
          <TwinProfile
            who={themName || 'THEM'}
            info={themInfoPairs}
            onInfoChange={e ? (i, v) => setThemInfo(i, v) : undefined}
            transparent={!!customBg}
          />
        </View>
      </View>

      <View style={s.sliderDivider}>
        <Heart size={12} color={ink} outline />
      </View>

      <View style={s.annivRow}>
        <Text style={[s.annivLabel, { color: ink }]}>♥ anniversary ♥</Text>
        <View style={[s.annivBox, { borderColor: ink }, customBg ? { backgroundColor: 'transparent' } : null]}>
          {e ? (
            <DateField
              value={anniv}
              onChange={set('anniv')}
              editing={e}
              placeholder="pick a date"
              style={{
                borderWidth: 0,
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
                height: 'auto',
                justifyContent: 'center',
              }}
              textStyle={{
                fontFamily: FontFamily.ja,
                fontSize: sf(12),
                color: ink,
                textAlign: 'center',
              }}
              displayValue={(() => {
                const el = calcElapsed(anniv);
                return el ? `${el.since} · ${el.label}` : undefined;
              })()}
            />
          ) : (
            <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(12), color: ink, textAlign: 'center' }}>
              {anniv ? `${calcElapsed(anniv)?.since} · ${calcElapsed(anniv)?.label}` : '——'}
            </Text>
          )}
        </View>
      </View>

      <View style={s.sliderDivider}>
        <Heart size={12} color={ink} outline />
      </View>

      <View style={s.slidersBlock}>
        <Text style={[s.nameLabel, { color: ink }]}>♥ about me ♥</Text>
        <View style={s.slidersCol}>
          {SLIDER_PAIRS.map(([l, r], i) => (
            <PolarSlider key={l} left={l} right={r} value={meSliders[i]} onValueChange={e ? (v) => setMeSlider(i, v) : undefined} />
          ))}
        </View>
      </View>

      <View style={s.slidersBlock}>
        <Text style={[s.nameLabel, { color: ink }]}>♥ about my f/o ♥</Text>
        <View style={s.slidersCol}>
          {SLIDER_PAIRS.map(([l, r], i) => (
            <PolarSlider key={l} left={l} right={r} value={themSliders[i]} onValueChange={e ? (v) => setThemSlider(i, v) : undefined} />
          ))}
        </View>
      </View>

      <View style={s.sliderDivider}>
        <Heart size={12} color={ink} outline />
      </View>

      <MemoriesPhotoRow
        editing={e}
        photos={[
          { uri: vals.memPhoto0, caption: vals.memCap0 },
          { uri: vals.memPhoto1, caption: vals.memCap1 },
          { uri: vals.memPhoto2, caption: vals.memCap2 },
        ]}
        onPhotoChange={e ? (i, u) => setMem(`memPhoto${i}`, u) : undefined}
        onCaptionChange={e ? (i, c) => setMem(`memCap${i}`, c) : undefined}
      />
    </MarkerCard>
  );
}

export default function TemplateHeartFrame() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="heart-frame" shipId={shipId}>
      <HeartFrameContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  mt6: { marginTop: 6, marginBottom: 12 },
  heartPhotoRow: { alignItems: 'center', marginVertical: 10, position: 'relative' },
  bowDeco: { position: 'absolute', top: -14, left: '50%', marginLeft: -45, zIndex: 5 },
  namesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 },
  twinGrid: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  twinCol: { flex: 1 },
  annivRow: { alignItems: 'center' },
  annivLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(10),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: INK,
    textAlign: 'center',
    marginBottom: 6,
  },
  annivBox: {
    width: 180,
    minHeight: 56,
    backgroundColor: FILL_GRAY,
    borderWidth: 1.5,
    borderColor: INK, // overridden inline with live ink
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  sliderDivider: { alignItems: 'center', marginVertical: 12 },
  slidersBlock: { marginBottom: 6 },
  slidersCol: { gap: 8, marginTop: 6 },
  nameLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(12),
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  namePillContainer: {
    width: 80,
    height: 18,
  },
});
