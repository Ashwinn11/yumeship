import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, MarkerHeader, BlankPill, AttrSlider, INK,
} from '@/components/templates/primitives';
import Svg, { Path, Defs, ClipPath, Image as SvgImage } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { Ribbon } from '@/components/deco/Ribbon';
import { useTemplateCtx } from '@/store/templateData';
import { Colors, FontFamily ,sf } from '@/constants/theme';
import { DateField, calcElapsed } from '@/components/ui/DateField';

const SLIDERS = [
  { l: 'Friendly', r: 'Aloof' },
  { l: 'Emotional', r: 'Logical' },
  { l: 'Romantic', r: 'Allergic' },
  { l: 'Pure', r: 'Spicy' },
  { l: 'Clingy', r: 'Distant' },
  { l: 'Jealous', r: 'Chill' },
] as const;

export function BondBannerContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = ctx.textColor || INK;

  const [vals, setVals] = useState<Record<string, string>>(() => ({
    meName:      ctx.get('meName', ''),
    mePronouns:  ctx.get('mePronouns', ''),
    meMBTI:      ctx.get('meMBTI', ''),
    meVibe:      ctx.get('meVibe', ''),
    foName:      ctx.get('foName', ''),
    foPronouns:  ctx.get('foPronouns', ''),
    foMBTI:      ctx.get('foMBTI', ''),
    foVibe:      ctx.get('foVibe', ''),
    anniv:      ctx.get('anniv', ''),
    shieldPhoto: ctx.get('shieldPhoto', ''),
    sliders: ctx.get('sliders', JSON.stringify(SLIDERS.map(() => 0.5))),
  }));

  const setVal = (key: string, v: string) => {
    setVals(p => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const sliderVals = JSON.parse(vals.sliders) as number[];
  const e = editing;

  return (
    <MarkerCard tint={customBg ? 'transparent' : Colors.sakuraSoft} style={s.root}>
      {/* Twinkle dots */}
      <View style={s.twinkles} pointerEvents="none">
        <Svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <Path
              key={i}
              d={`M${(i * 73) % 280} ${(i * 41) % 300} m-1-1 l2 2 m-2 0 l2-2`}
              stroke="#fff"
              strokeWidth="1.5"
              opacity="0.5"
            />
          ))}
        </Svg>
      </View>

      {/* Banner + ribbon */}
      <View style={s.bannerWrap}>
        <View style={[s.banner, { borderColor: ink }, customBg ? { backgroundColor: 'transparent' } : null]}>
          <Text style={[s.bannerSmall, { color: ink }]}>all about my</Text>
          <Text style={[s.bannerBig, { color: ink }]}>♡ YumeShip ♡</Text>
        </View>
        <View style={s.ribbonRow}>
          <Ribbon size={22} color={ink} />
          <Ribbon size={22} color={ink} />
          <Ribbon size={22} color={ink} />
        </View>
      </View>

      {/* Heart shield — photo picker */}
      <View style={s.shieldWrap}>
        <Pressable
          onPress={e ? async () => {
            const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as ImagePicker.MediaType[], allowsEditing: true, aspect: [1,1], quality: 0.85 });
            if (!res.canceled && res.assets[0]) setVal('shieldPhoto', res.assets[0].uri);
          } : undefined}
        >
          <Svg width={100} height={116} viewBox="0 0 120 140">
            <Defs>
              <ClipPath id="heartClip">
                <Path d="M60 130 C 20 100 6 70 6 40 C 6 22 18 14 30 14 C 44 14 54 22 60 32 C 66 22 76 14 90 14 C 102 14 114 22 114 40 C 114 70 100 100 60 130 Z" />
              </ClipPath>
            </Defs>
            {vals.shieldPhoto ? (
              <SvgImage
                href={vals.shieldPhoto}
                x={6} y={14} width={108} height={116}
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#heartClip)"
              />
            ) : (
              <Path
                d="M60 130 C 20 100 6 70 6 40 C 6 22 18 14 30 14 C 44 14 54 22 60 32 C 66 22 76 14 90 14 C 102 14 114 22 114 40 C 114 70 100 100 60 130 Z"
                fill={Colors.sakura + 'aa'}
              />
            )}
            <Path
              d="M60 130 C 20 100 6 70 6 40 C 6 22 18 14 30 14 C 44 14 54 22 60 32 C 66 22 76 14 90 14 C 102 14 114 22 114 40 C 114 70 100 100 60 130 Z"
              fill="none" stroke={ink} strokeWidth="2"
            />
          </Svg>
          {e && !vals.shieldPhoto && (
            <View style={s.shieldHint}><Text style={s.shieldHintText}>📷</Text></View>
          )}
        </Pressable>
      </View>

      {/* About columns — above shield via zIndex */}
      <View style={s.aboutCols}>
        {[
          { header: 'ME / MY OC', pfx: 'me' },
          { header: 'MY F/O', pfx: 'fo' },
        ].map(({ header, pfx }) => (
          <View key={pfx} style={s.aboutCol}>
            <Text style={[s.aboutHeader, { color: ink }]}>♡ About {header}</Text>
            {(['Name', 'Pronouns', 'MBTI', 'Vibe'] as const).map((f) => {
              const key = `${pfx}${f}`;
              return (
                <View key={key} style={[s.aboutField, { borderColor: ink }, customBg ? { backgroundColor: 'transparent' } : null]}>
                  <Text style={[s.aboutFieldLabel, { color: ink }]}>{f}:</Text>
                  {e ? (
                    <BlankPill value={vals[key]} onChangeText={v => setVal(key, v)} placeholder="——" style={s.aboutFieldVal} />
                  ) : (
                    <Text style={[s.aboutFieldValText, { color: ink }]}>{vals[key] || '——'}</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Anniversary */}
      <View style={[s.annivBox, { borderColor: ink }, customBg ? { backgroundColor: 'transparent' } : null]}>
        <Text style={[s.annivLabel, { color: ink }]}>♡ Anniversary ♡</Text>
        <DateField
          value={vals.anniv}
          onChange={v => setVal('anniv', v)}
          editing={e}
          placeholder="pick a date"
          style={{ borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0, height: 'auto', justifyContent: 'center' }}
          textStyle={{ fontFamily: FontFamily.script, fontSize: sf(18), color: ink }}
          displayValue={(() => {
            const el = calcElapsed(vals.anniv);
            return el ? `${el.since}  ·  ${el.label}` : undefined;
          })()}
        />
      </View>

      {/* Slider grid — 2 columns */}
      <View style={s.sliderGrid}>
        {SLIDERS.map((sl, i) => (
          <View key={i} style={s.sliderItem}>
            <View style={s.sliderLabelRow}>
              <Text style={[s.sliderSide, { color: ink }]}>{sl.l}</Text>
              <Text style={[s.sliderSide, { color: ink }]}>{sl.r}</Text>
            </View>
            <AttrSlider
              label=""
              value={sliderVals[i] ?? 0.5}
              onValueChange={e ? (v) => {
                const next = [...sliderVals];
                next[i] = v;
                setVal('sliders', JSON.stringify(next));
              } : undefined}
            />
          </View>
        ))}
      </View>
    </MarkerCard>
  );
}

export default function TemplateBondBanner() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="bond-banner" shipId={shipId}>
      <BondBannerContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  root: { gap: 10, overflow: 'hidden' },
  twinkles: { position: 'absolute', inset: 0, pointerEvents: 'none' as any },
  bannerWrap: { alignItems: 'center', gap: 2 },
  banner: {
    paddingHorizontal: 18, paddingVertical: 8,
    backgroundColor: Colors.sakura,
    borderWidth: 2, borderColor: INK, // overridden inline with live ink
    borderRadius: 14,
    alignItems: 'center',
  },
  bannerSmall: { fontFamily: FontFamily.markerBold, fontSize: sf(10), color: INK },
  bannerBig: { fontFamily: FontFamily.markerBold, fontSize: sf(13), color: INK },
  ribbonRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  shieldWrap: { alignSelf: 'center', marginVertical: -30, zIndex: 0 },
  aboutCols: { flexDirection: 'row', gap: 10, zIndex: 2, position: 'relative' },
  aboutCol: { flex: 1, gap: 4 },
  aboutHeader: { fontFamily: FontFamily.markerBold, fontSize: sf(9), color: INK },
  aboutField: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: INK, borderRadius: 8, padding: 6, gap: 2 }, // borderColor overridden inline
  aboutFieldLabel: { fontFamily: FontFamily.markerBold, fontSize: sf(7), color: INK, letterSpacing: 0.4 },
  aboutFieldVal: { height: 16, backgroundColor: 'transparent', borderWidth: 0 },
  aboutFieldValText: { fontFamily: FontFamily.script, fontSize: sf(14), color: INK },
  annivBox: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1.5, borderColor: INK, // borderColor overridden inline
    borderRadius: 10, padding: 10,
    alignItems: 'center',
  },
  annivLabel: { fontFamily: FontFamily.markerBold, fontSize: sf(9), color: INK },
  annivInput: { marginTop: 2, alignSelf: 'center' },
  annivText: { fontFamily: FontFamily.script, fontSize: sf(18), color: INK, marginTop: 2 },
  shieldHint:     { position: 'absolute', top: '35%', alignSelf: 'center' },
  shieldHintText: { fontSize: sf(18) },
  sliderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sliderItem: { width: '47%' },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  sliderSide: { fontFamily: FontFamily.markerBold, fontSize: sf(8), color: INK },
});
