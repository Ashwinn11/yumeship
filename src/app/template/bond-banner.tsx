import { useState } from 'react';
import { persistImage } from '@/lib/localMedia';
import { View, Text, TextInput, Pressable, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, BlankPill, DualPolarSlider, SharingRow, INK,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import Svg, { Path, Defs, ClipPath, Image as SvgImage } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { Ribbon } from '@/components/deco/Ribbon';
import { useTemplateCtx } from '@/store/templateData';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';
import { DateField, calcElapsed } from '@/components/ui/DateField';

const ABOUT_FIELDS = ['Name', 'Pronouns', 'Age', 'Birthday', 'Gender', 'Sexuality'] as const;

const PALETTE_OPTIONS = [
  '#8b3a4a', '#d77a8d', '#f3b6c4', '#fadde5',
  '#6b4da3', '#9b7fd4', '#c9b8e8', '#ece4f7',
  '#b76b48', '#e8a07a', '#f4c09a', '#fde0ce',
  '#4a7050', '#7aad82', '#b4cba5', '#e0ebd4',
  '#1a2a4a', '#3a6fa8', '#b8d4f0', '#e8f2fc',
  '#1f1219', '#4a3a40', '#9a8a90', '#f5f0f2',
];
const ME_DEFAULT_PAL = ['#d77a8d', '#f3b6c4', '#fadde5'];
const FO_DEFAULT_PAL = ['#6b4da3', '#9b7fd4', '#c9b8e8'];

const WHO_STATES = ['', 'Me', 'Them', 'Both'] as const;
function HeartCycle({ value, onChange, ink }: { value: string; onChange?: (v: string) => void; ink: string }) {
  const cur = (WHO_STATES as readonly string[]).includes(value) ? value : '';
  return (
    <Pressable
      disabled={!onChange}
      hitSlop={8}
      onPress={onChange ? () => {
        const i = WHO_STATES.indexOf(cur as any);
        onChange(WHO_STATES[(i + 1) % WHO_STATES.length]);
      } : undefined}
      style={hs.row}
    >
      <Heart size={13} color={ink} outline={!cur} />
      {cur ? <Text style={[hs.text, { color: ink }]}>{cur}</Text> : null}
    </Pressable>
  );
}
const hs = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontFamily: FontFamily.markerBold, fontSize: sf(8), textTransform: 'uppercase' },
});

const WHO_FIRST = ['Approach the other first', 'Confess their feelings first', 'Ask the other on a first date', 'Initiate the first kiss'];
const WHO_LIKELY = ['Spoil the other', 'Apologize first after an argument', 'Initiate any form of PDA', "Beg for the other's attention"];
const WHO_IS = ['More approachable', 'More adventurous', 'More responsible', 'More popular / well-liked'];

const LOVE_SLIDERS = [
  ['Oblivious To It', 'Realized Immediately'],
  ['Fell In Love At First Sight', 'Slowly Developed Feelings'],
] as const;

const TRAIT_SLIDERS = [
  ['Extrovert', 'Introvert'],
  ['Independent', 'Dependent'],
  ['Expresses Emotions', 'Represses Emotions'],
  ['Big Spoon', 'Little Spoon'],
  ['Thinks Before Acting', 'Impulsive'],
  ['Loves PDA', 'Hates PDA'],
  ['Early Bird', 'Night Owl'],
  ['Always On Schedule', 'Always Late'],
  ['Confrontational', 'Avoids Any Confrontation'],
  ['Organized', 'A Mess'],
] as const;

const BLANK4 = ['', '', '', ''];
// Me/F.O. defaults start offset (not both at 0.5) so the two dots never land
// on top of each other before anyone's touched the slider.
const ME_DEFAULT2 = [0.4, 0.4];
const FO_DEFAULT2 = [0.6, 0.6];
const ME_DEFAULT10 = [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4];
const FO_DEFAULT10 = [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6];

export function BondBannerContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = ctx.textColor || INK;

  const [vals, setVals] = useState<Record<string, string>>(() => ({
    meName:      ctx.get('meName', ''),
    mePronouns:  ctx.get('mePronouns', ''),
    meAge:       ctx.get('meAge', ''),
    meBday:      ctx.get('meBday', ''),
    meGender:    ctx.get('meGender', ''),
    meSexuality: ctx.get('meSexuality', ''),
    foName:      ctx.get('foName', ''),
    foPronouns:  ctx.get('foPronouns', ''),
    foAge:       ctx.get('foAge', ''),
    foBday:      ctx.get('foBday', ''),
    foGender:    ctx.get('foGender', ''),
    foSexuality: ctx.get('foSexuality', ''),
    meEmoji: ctx.get('meEmoji', ''),
    foEmoji: ctx.get('foEmoji', ''),
    mePal0: ctx.get('mePal0', ME_DEFAULT_PAL[0]),
    mePal1: ctx.get('mePal1', ME_DEFAULT_PAL[1]),
    mePal2: ctx.get('mePal2', ME_DEFAULT_PAL[2]),
    foPal0: ctx.get('foPal0', FO_DEFAULT_PAL[0]),
    foPal1: ctx.get('foPal1', FO_DEFAULT_PAL[1]),
    foPal2: ctx.get('foPal2', FO_DEFAULT_PAL[2]),
    tropes: ctx.get('tropes', ''),
    sharing: ctx.get('sharing', ''),
    anniv:      ctx.get('anniv', ''),
    shieldPhoto: ctx.get('shieldPhoto', ''),
    whoFirst:  ctx.get('whoFirst', JSON.stringify(BLANK4)),
    whoLikely: ctx.get('whoLikely', JSON.stringify(BLANK4)),
    whoIs:     ctx.get('whoIs', JSON.stringify(BLANK4)),
    meLoveSliders: ctx.get('meLoveSliders', JSON.stringify(ME_DEFAULT2)),
    foLoveSliders: ctx.get('foLoveSliders', JSON.stringify(FO_DEFAULT2)),
    meTraitSliders: ctx.get('meTraitSliders', JSON.stringify(ME_DEFAULT10)),
    foTraitSliders: ctx.get('foTraitSliders', JSON.stringify(FO_DEFAULT10)),
  }));

  const setVal = (key: string, v: string) => {
    setVals(p => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const [picking, setPicking] = useState<{ pfx: 'me' | 'fo'; idx: number } | null>(null);

  const e = editing;
  const sharing = (vals.sharing || undefined) as 'Yes' | 'No' | 'Selective' | undefined;

  const whoFirst = JSON.parse(vals.whoFirst || JSON.stringify(BLANK4)) as string[];
  const whoLikely = JSON.parse(vals.whoLikely || JSON.stringify(BLANK4)) as string[];
  const whoIs = JSON.parse(vals.whoIs || JSON.stringify(BLANK4)) as string[];
  const meLoveSliders = JSON.parse(vals.meLoveSliders || JSON.stringify(ME_DEFAULT2)) as number[];
  const foLoveSliders = JSON.parse(vals.foLoveSliders || JSON.stringify(FO_DEFAULT2)) as number[];
  const meTraitSliders = JSON.parse(vals.meTraitSliders || JSON.stringify(ME_DEFAULT10)) as number[];
  const foTraitSliders = JSON.parse(vals.foTraitSliders || JSON.stringify(FO_DEFAULT10)) as number[];

  const setWho = (key: 'whoFirst' | 'whoLikely' | 'whoIs', arr: string[], i: number, v: string) => {
    const next = [...arr];
    next[i] = v;
    setVal(key, JSON.stringify(next));
  };
  const setSlider = (key: 'meLoveSliders' | 'foLoveSliders' | 'meTraitSliders' | 'foTraitSliders', arr: number[], i: number, v: number) => {
    const next = [...arr];
    next[i] = v;
    setVal(key, JSON.stringify(next));
  };

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
            if (!res.canceled && res.assets[0]) setVal('shieldPhoto', await persistImage(res.assets[0].uri));
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
        {(['me', 'fo'] as const).map((pfx) => (
          <View key={pfx} style={s.aboutCol}>
            <Text style={[s.aboutHeader, { color: ink }]}>♡ About {pfx === 'me' ? 'Me' : 'F/O'}</Text>
            {ABOUT_FIELDS.map((f) => {
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
            <View style={s.miniRow}>
              <Text style={[s.aboutFieldLabel, { color: ink }]}>Palette</Text>
              <View style={s.palRow}>
                {[0, 1, 2].map((i) => {
                  const palKey = `${pfx}Pal${i}`;
                  return (
                    <Pressable
                      key={i}
                      disabled={!e}
                      onPress={e ? () => setPicking({ pfx, idx: i }) : undefined}
                      style={[s.palDot, { backgroundColor: vals[palKey], borderColor: ink }]}
                    />
                  );
                })}
              </View>
            </View>
            <View style={s.miniRow}>
              <Text style={[s.aboutFieldLabel, { color: ink }]}>Emoji</Text>
              <View style={[s.emojiBox, { borderColor: ink }, customBg ? { backgroundColor: 'transparent' } : null]}>
                <TextInput
                  value={vals[`${pfx}Emoji`]}
                  onChangeText={e ? (v) => setVal(`${pfx}Emoji`, v) : undefined}
                  editable={e}
                  placeholder="🍒"
                  placeholderTextColor={ink + '55'}
                  style={[s.emojiInput, { color: ink }]}
                  textAlign="center"
                />
              </View>
            </View>
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

      {/* Trope & Dynamic */}
      <View style={[s.tropesBox, { borderColor: ink }, customBg ? { backgroundColor: 'transparent' } : null]}>
        <Text style={[s.tropesLabel, { color: ink }]}>♡ Trope & Dynamic ♡</Text>
        {e ? (
          <TextInput
            value={vals.tropes}
            onChangeText={v => setVal('tropes', v)}
            placeholder="enemies to lovers, protector × healer..."
            placeholderTextColor={ink + '77'}
            multiline
            style={[s.tropesText, { color: ink }]}
          />
        ) : (
          <Text style={[s.tropesText, { color: ink }]}>{vals.tropes || '——'}</Text>
        )}
      </View>

      {/* Sharing status */}
      <View style={s.sharingWrap}>
        <SharingRow choice={sharing} onChoiceChange={e ? (c) => setVal('sharing', c) : undefined} />
      </View>

      {/* Who checklists */}
      <View style={s.whoGrid}>
        <View style={s.whoCol}>
          <Text style={[s.whoTitle, { color: ink }]}>Who Was The One to...</Text>
          {WHO_FIRST.map((label, i) => (
            <View key={label} style={s.whoRow}>
              <HeartCycle value={whoFirst[i]} onChange={e ? (v) => setWho('whoFirst', whoFirst, i, v) : undefined} ink={ink} />
              <Text style={[s.whoLabel, { color: ink }]}>{label}</Text>
            </View>
          ))}
          <Text style={[s.whoTitle, { color: ink, marginTop: 8 }]}>Who Is More Likely to...</Text>
          {WHO_LIKELY.map((label, i) => (
            <View key={label} style={s.whoRow}>
              <HeartCycle value={whoLikely[i]} onChange={e ? (v) => setWho('whoLikely', whoLikely, i, v) : undefined} ink={ink} />
              <Text style={[s.whoLabel, { color: ink }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={s.whoCol}>
          <Text style={[s.whoTitle, { color: ink }]}>Which of Them Is...</Text>
          {WHO_IS.map((label, i) => (
            <View key={label} style={s.whoRow}>
              <HeartCycle value={whoIs[i]} onChange={e ? (v) => setWho('whoIs', whoIs, i, v) : undefined} ink={ink} />
              <Text style={[s.whoLabel, { color: ink }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* How did they fall in love — full width so the slider track has room */}
      <View style={s.sliderSection}>
        <Text style={[s.whoTitle, { color: ink }]}>How Did They Fall In Love?</Text>
        <View style={s.legendRow}>
          <View style={[s.legendDot, { backgroundColor: vals.mePal0, borderColor: ink }]} />
          <Text style={[s.legendText, { color: ink }]}>me</Text>
          <View style={[s.legendDot, { backgroundColor: vals.foPal0, borderColor: ink }]} />
          <Text style={[s.legendText, { color: ink }]}>f/o</Text>
        </View>
        <View style={s.sliderCol}>
          {LOVE_SLIDERS.map(([l, r], i) => (
            <DualPolarSlider
              key={l}
              left={l}
              right={r}
              meValue={meLoveSliders[i]}
              foValue={foLoveSliders[i]}
              meColor={vals.mePal0}
              foColor={vals.foPal0}
              markerShape="dot"
              onMeChange={e ? (v) => setSlider('meLoveSliders', meLoveSliders, i, v) : undefined}
              onFoChange={e ? (v) => setSlider('foLoveSliders', foLoveSliders, i, v) : undefined}
            />
          ))}
        </View>
      </View>

      {/* Us, as a pair — full width so the slider track has room */}
      <View style={s.sliderSection}>
        <Text style={[s.whoTitle, { color: ink }]}>Us, As A Pair</Text>
        <View style={s.sliderCol}>
          {TRAIT_SLIDERS.map(([l, r], i) => (
            <DualPolarSlider
              key={l}
              left={l}
              right={r}
              meValue={meTraitSliders[i]}
              foValue={foTraitSliders[i]}
              meColor={vals.mePal0}
              foColor={vals.foPal0}
              markerShape="dot"
              onMeChange={e ? (v) => setSlider('meTraitSliders', meTraitSliders, i, v) : undefined}
              onFoChange={e ? (v) => setSlider('foTraitSliders', foTraitSliders, i, v) : undefined}
            />
          ))}
        </View>
      </View>

      {/* Palette picker modal */}
      <Modal visible={picking !== null} transparent animationType="fade" onRequestClose={() => setPicking(null)}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={() => setPicking(null)}>
            <View style={pk.overlay} />
          </TouchableWithoutFeedback>
          <View style={[pk.sheet, SheetColumn]}>
            <View style={pk.handle} />
            <Text style={pk.title}>pick a color</Text>
            <View style={pk.grid}>
              {PALETTE_OPTIONS.map((c) => {
                const curKey = picking ? `${picking.pfx}Pal${picking.idx}` : '';
                const cur = picking ? vals[curKey] : '';
                return (
                  <Pressable
                    key={c}
                    style={[pk.swatch, { backgroundColor: c }, c === cur && pk.swatchActive]}
                    onPress={() => {
                      if (picking) setVal(`${picking.pfx}Pal${picking.idx}`, c);
                      setPicking(null);
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  palRow: { flexDirection: 'row', gap: 4 },
  palDot: { width: 14, height: 14, borderRadius: 999, borderWidth: 1 },
  emojiBox: { borderWidth: 1.2, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 6, paddingVertical: 1 },
  emojiInput: { fontFamily: FontFamily.ja, fontSize: sf(11), minWidth: 32 },
  annivBox: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1.5, borderColor: INK, // borderColor overridden inline
    borderRadius: 10, padding: 10,
    alignItems: 'center',
  },
  annivLabel: { fontFamily: FontFamily.markerBold, fontSize: sf(9), color: INK },
  shieldHint:     { position: 'absolute', top: '35%', alignSelf: 'center' },
  shieldHintText: { fontSize: sf(18) },
  tropesBox: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1.5, borderRadius: 10, padding: 10, gap: 4,
  },
  tropesLabel: { fontFamily: FontFamily.markerBold, fontSize: sf(9), color: INK, textAlign: 'center' },
  tropesText: { fontFamily: FontFamily.script, fontSize: sf(13), color: INK, textAlign: 'center', minHeight: 20 },
  sharingWrap: { alignItems: 'center' },
  whoGrid: { flexDirection: 'row', gap: 12 },
  whoCol: { flex: 1 },
  whoTitle: { fontFamily: FontFamily.markerBold, fontSize: sf(10), color: INK, marginBottom: 4 },
  whoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  whoLabel: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(9), color: INK },
  sliderSection: {},
  sliderCol: { gap: 8, marginTop: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 999, borderWidth: 1.2 },
  legendText: { fontFamily: FontFamily.ja, fontSize: sf(9), textTransform: 'uppercase', letterSpacing: 0.4, marginRight: 8 },
});

const pk = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, padding: Spacing.s5, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.s4 },
  title: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink, marginBottom: Spacing.s4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 36, height: 36, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.line },
  swatchActive: { borderColor: Colors.ink, borderWidth: 2.5 },
});
