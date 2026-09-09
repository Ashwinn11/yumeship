import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern as SvgPattern, Path, Rect } from 'react-native-svg';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { KawaiiPanel, BlankPill, PhotoBox, DualSlider, INK, getContrastColor } from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { DateField, calcElapsed } from '@/components/ui/DateField';
import { useTemplateCtx } from '@/store/templateData';
import { FontFamily, Radius, Spacing, SheetColumn, sf, SHARING_TEMPLATE_OPTS } from '@/constants/theme';

const PINK_INK = '#9c2d5a';
const PINK_BG = '#fbe7ee';
const PANEL_EDGE = '#f3a8c4';
const PANEL_BG = '#ffffff';
const TRANSPARENT = 'transparent';

// Each info field renders once per person — key becomes `${prefix}${Field}`,
// e.g. 'age' -> 'theirAge' / 'myAge'.
const INFO_FIELDS = [
  { field: 'nickname', label: 'nickname' },
  { field: 'age', label: 'age' },
  { field: 'height', label: 'height' },
  { field: 'birthday', label: 'birthday' },
  { field: 'pronouns', label: 'pronouns' },
  { field: 'loveLanguage', label: 'love language' },
  { field: 'mbti', label: 'mbti' },
] as const;
const SHARING_OPTS = SHARING_TEMPLATE_OPTS;
const ORIENTATION_OPTS = ['Gay', 'Straight', 'Bi', 'Pan', 'Ace', 'Other'] as const;
const PALETTE_SWATCHES = [
  '#9c2d5a', '#d77a8d', '#f3a8c4', '#fbe7ee',
  '#6b4da3', '#b493d9', '#c9b8e8',
  '#e8a07a', '#f4c09a',
  '#4a7050', '#7aad82',
  '#3a6fa8', '#b8d4f0',
];
const THEIR_DEFAULT_PAL = ['#9c2d5a', '#d77a8d', '#f3a8c4'];
const MY_DEFAULT_PAL = ['#6b4da3', '#b493d9', '#c9b8e8'];
const DYN_SLIDERS = ["who's more affectionate", "who's more jealous", "who's more playful", "who initiates more"] as const;
const FIRSTS_LABELS = ['confessed first', 'said "i love you" first', 'planned the first date', 'initiated the first kiss', 'proposed'] as const;
const FIRSTS_OPTS = ['Me', 'Them', 'Both'] as const;
const STORY_FIELDS = [
  ['firstImpression', 'first impression', 'what did you think of each other at first?'],
  ['happyEnding', 'happily ever after', "how does your story end (the good version)?"],
  ['badEnding', '...or a bad ending', 'the angsty what-if'],
] as const;

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function KawaiiUIContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const ink = ctx.textColor || PINK_INK;
  const customBg = ctx.bgColor || ctx.bgImage;
  const panelBg = customBg ? TRANSPARENT : PANEL_BG;
  const infoBg = customBg ? TRANSPARENT : PINK_BG;
  const [bgSize, setBgSize] = useState({ width: 0, height: 0 });

  const [vals, setVals] = useState<Record<string, string>>(() => ({
    shipName: ctx.get('shipName'),
    from:     ctx.get('from'),
    type:     ctx.get('type'),
    theirName: ctx.get('theirName'),
    myName:    ctx.get('myName'),
    theirPortrait: ctx.get('theirPortrait'),
    myPortrait:    ctx.get('myPortrait'),
    ...Object.fromEntries(INFO_FIELDS.flatMap(({ field }) => [
      [`their${cap(field)}`, ctx.get(`their${cap(field)}`)],
      [`my${cap(field)}`, ctx.get(`my${cap(field)}`)],
    ])),
    sharing:  ctx.get('sharing'),
    trope0:   ctx.get('trope0'),
    trope1:   ctx.get('trope1'),
    trope2:   ctx.get('trope2'),
    anniv:    ctx.get('anniv'),
    theirOrientation: ctx.get('theirOrientation'),
    myOrientation:    ctx.get('myOrientation'),
    theirPal0: ctx.get('theirPal0', THEIR_DEFAULT_PAL[0]),
    theirPal1: ctx.get('theirPal1', THEIR_DEFAULT_PAL[1]),
    theirPal2: ctx.get('theirPal2', THEIR_DEFAULT_PAL[2]),
    myPal0:    ctx.get('myPal0', MY_DEFAULT_PAL[0]),
    myPal1:    ctx.get('myPal1', MY_DEFAULT_PAL[1]),
    myPal2:    ctx.get('myPal2', MY_DEFAULT_PAL[2]),
    dynSliders: ctx.get('dynSliders', '[0.5,0.5,0.5,0.5]'),
    firsts:     ctx.get('firsts', '[]'),
    firstImpression: ctx.get('firstImpression'),
    happyEnding:     ctx.get('happyEnding'),
    badEnding:       ctx.get('badEnding'),
  }));

  const setVal = (key: string, v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const e = editing;
  const sharing = vals.sharing || null;
  const [picking, setPicking] = useState<{ prefix: 'their' | 'my'; idx: number } | null>(null);
  const dynSliders = JSON.parse(vals.dynSliders || '[0.5,0.5,0.5,0.5]') as number[];
  const firsts = JSON.parse(vals.firsts || '[]') as string[];

  const set = (key: string) => e ? (v: string) => setVal(key, v) : undefined;

  function renderPersonPanel(prefix: 'their' | 'my', who: string, nameKey: string, portraitKey: string, namePlaceholder: string, mirror = false) {
    return (
      <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.mainPanel}>
        <View style={s.personHeaderRow}>
          <Heart size={11} color={ink} outline />
          <Text style={[s.kawaiiLabel, { color: ink }]}>{who}</Text>
          {e ? (
            <TextInput
              value={vals[nameKey] ?? ''}
              onChangeText={set(nameKey)}
              placeholder={namePlaceholder}
              placeholderTextColor={ink + '88'}
              underlineColorAndroid="transparent"
              style={[s.personNameInput, { color: ink }]}
            />
          ) : (
            <Text style={[s.personNameText, { color: ink }]}>{vals[nameKey] || namePlaceholder}</Text>
          )}
        </View>
        <View style={[s.mainRow, mirror && s.mainRowReverse]}>
          <PhotoBox
            width={90} height={106} editing={e}
            style={s.portraitStyle}
            uri={vals[portraitKey]}
            onUriChange={e ? (u) => setVal(portraitKey, u) : undefined}
          />
          <View style={s.infoCol}>
            {INFO_FIELDS.map(({ field, label }) => {
              const k = `${prefix}${cap(field)}`;
              return (
                <View key={k} style={s.infoRow}>
                  <Text style={[s.infoKey, { color: ink }]}>{label}</Text>
                  {field === 'birthday' ? (
                    <DateField
                      value={vals[k]}
                      onChange={(v) => setVal(k, v)}
                      editing={e}
                      format="birthday"
                      placeholder="pick date"
                      style={[s.infoVal, { backgroundColor: infoBg, borderColor: PANEL_EDGE, borderWidth: 1, borderRadius: 4 }]}
                      textStyle={{ fontSize: sf(9), color: ink, fontFamily: FontFamily.ja }}
                    />
                  ) : e ? (
                    <TextInput
                      value={vals[k] ?? ''}
                      onChangeText={(v) => setVal(k, v)}
                      placeholder="——"
                      placeholderTextColor={ink + '88'}
                      underlineColorAndroid="transparent"
                      style={[
                        s.infoVal,
                        s.infoValInput,
                        { backgroundColor: infoBg, borderColor: PANEL_EDGE, color: ink },
                        field === 'loveLanguage' && { fontSize: sf(9) },
                      ]}
                    />
                  ) : (
                    <View style={[s.infoVal, { backgroundColor: infoBg, borderColor: PANEL_EDGE, justifyContent: 'center' }]}>
                      <Text style={{
                        fontFamily: FontFamily.ja,
                        fontSize: field === 'loveLanguage' ? 8.5 : 11,
                        color: ink,
                      }}>{vals[k]}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        <View style={s.miniRow}>
          <Text style={[s.infoKey, { color: ink, width: 60 }]}>orientation</Text>
          <View style={s.orientationWrap}>
            {ORIENTATION_OPTS.map((opt) => {
              const key = `${prefix}Orientation`;
              const on = vals[key] === opt;
              return (
                <Pressable
                  key={opt}
                  disabled={!e}
                  onPress={e ? () => setVal(key, on ? '' : opt) : undefined}
                  style={[s.orientationPill, { borderColor: PANEL_EDGE }, on && { backgroundColor: ink, borderColor: ink }]}
                >
                  <Text style={[s.orientationText, { color: on ? getContrastColor(ink) : ink }]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={s.miniRow}>
          <Text style={[s.infoKey, { color: ink, width: 60 }]}>palette</Text>
          <View style={s.paletteRow}>
            {[0, 1, 2].map((i) => {
              const palKey = `${prefix}Pal${i}`;
              return (
                <Pressable
                  key={i}
                  disabled={!e}
                  onPress={e ? () => setPicking({ prefix, idx: i }) : undefined}
                  style={[s.paletteDot, { backgroundColor: vals[palKey], borderColor: ink }]}
                />
              );
            })}
          </View>
        </View>
      </KawaiiPanel>
    );
  }

  return (
    <LinearGradient
      colors={customBg ? ['transparent', 'transparent'] : ['#fcd6e2', '#f5b3c8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.card, { borderColor: ink }]}
      onLayout={(ev) => {
        const { width, height } = ev.nativeEvent.layout;
        setBgSize({ width, height });
      }}
    >
      {bgSize.width > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={bgSize.width} height={bgSize.height}>
          <Defs>
            <SvgPattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <Path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(243,168,196,0.35)" strokeWidth="0.7" />
            </SvgPattern>
          </Defs>
          <Rect width={bgSize.width} height={bgSize.height} fill="url(#grid)" />
        </Svg>
      )}

      <Svg style={s.ribbonTL} width={60} height={60} viewBox="0 0 60 60">
        <Path d="M5 25 Q 15 5, 30 20 Q 45 5, 55 25 L 30 40 Z" fill={ink} opacity="0.8" />
        <Path d="M30 40 L 22 56 L 30 50 L 38 56 Z" fill={ink} opacity="0.8" />
      </Svg>
      <Svg style={s.ribbonTR} width={60} height={60} viewBox="0 0 60 60">
        <Path d="M5 25 Q 15 5, 30 20 Q 45 5, 55 25 L 30 40 Z" fill={ink} opacity="0.8" />
        <Path d="M30 40 L 22 56 L 30 50 L 38 56 Z" fill={ink} opacity="0.8" />
      </Svg>

      <View style={s.titlePillRow}>
        <View style={[s.titlePill, { backgroundColor: customBg ? 'transparent' : ink }, customBg ? { borderWidth: 1.5, borderColor: ink } : null]}>
          <Text style={[s.titlePillText, { color: customBg ? ink : getContrastColor(ink) }]}>My YumeShip</Text>
        </View>
      </View>

      <View style={s.statRow}>
        {([['shipName', 'ship name'], ['from', 'from'], ['type', 'type']] as const).map(([key, label]) => (
          <KawaiiPanel key={key} edge={PANEL_EDGE} bg={panelBg} style={s.statPanel}>
            <Text style={[s.kawaiiLabel, { color: ink }]}>{label}</Text>
            <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {key === 'shipName' && <Heart size={12} color={ink} outline />}
              {e ? (
                <TextInput
                  value={vals[key] ?? ''}
                  onChangeText={set(key)}
                  placeholder="——"
                  placeholderTextColor={ink + '88'}
                  underlineColorAndroid="transparent"
                  style={{ fontFamily: FontFamily.ja, fontSize: sf(13), color: ink, padding: 0, flex: 1 }}
                />
              ) : (
                <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(13), color: ink }}>
                  {vals[key] || '——'}
                </Text>
              )}
            </View>
          </KawaiiPanel>
        ))}
      </View>

      {renderPersonPanel('their', 'them', 'theirName', 'theirPortrait', 'their name')}
      <View style={s.mt10}>
        {renderPersonPanel('my', 'me', 'myName', 'myPortrait', 'my name', true)}
      </View>

      <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.mt10}>
        <Text style={[s.kawaiiLabel, { color: ink, marginBottom: 6 }]}>sharing status</Text>
        <View style={s.sharingRow}>
          {SHARING_OPTS.map((t) => (
            <Pressable
              key={t}
              style={s.sharingOpt}
              onPress={e ? () => setVal('sharing', sharing === t ? '' : t) : undefined}
              disabled={!e}
            >
              <Heart size={12} color={ink} outline={sharing !== t} />
              <Text style={[s.sharingText, { color: ink, fontFamily: sharing === t ? FontFamily.markerBold : FontFamily.marker }]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </KawaiiPanel>

      <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.mt10}>
        <Text style={[s.kawaiiLabel, { color: ink, marginBottom: 6 }]}>our dynamic</Text>
        <View style={{ gap: 8 }}>
          {DYN_SLIDERS.map((label, i) => (
            <DualSlider
              key={label}
              label={label}
              value={dynSliders[i] ?? 0.5}
              leftColor={vals.myPal0}
              rightColor={vals.theirPal0}
              ink={ink}
              onValueChange={e ? (v) => {
                const next = [...dynSliders];
                next[i] = v;
                setVal('dynSliders', JSON.stringify(next));
              } : undefined}
            />
          ))}
        </View>
      </KawaiiPanel>

      <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.mt10}>
        <Text style={[s.kawaiiLabel, { color: ink, marginBottom: 6 }]}>firsts</Text>
        <View style={{ gap: 6 }}>
          {FIRSTS_LABELS.map((label, i) => {
            const cur = firsts[i] || '';
            return (
              <View key={label} style={s.firstRow}>
                <Text style={[s.firstLabel, { color: ink }]} numberOfLines={1}>{label}</Text>
                <View style={s.firstOpts}>
                  {FIRSTS_OPTS.map((opt) => {
                    const on = cur === opt;
                    return (
                      <Pressable
                        key={opt}
                        disabled={!e}
                        onPress={e ? () => {
                          const next = [...firsts];
                          while (next.length <= i) next.push('');
                          next[i] = on ? '' : opt;
                          setVal('firsts', JSON.stringify(next));
                        } : undefined}
                        style={[s.firstPill, { borderColor: PANEL_EDGE }, on && { backgroundColor: ink, borderColor: ink }]}
                      >
                        <Text style={[s.firstPillText, { color: on ? getContrastColor(ink) : ink }]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </KawaiiPanel>

      <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.mt10}>
        <Text style={[s.kawaiiLabel, { color: ink, marginBottom: 6 }]}>the story</Text>
        {STORY_FIELDS.map(([key, label, placeholder]) => (
          <View key={key} style={s.storyBlock}>
            <Text style={[s.infoKey, { color: ink }]}>{label}</Text>
            {e ? (
              <TextInput
                value={vals[key] ?? ''}
                onChangeText={set(key)}
                placeholder={placeholder}
                placeholderTextColor={ink + '88'}
                multiline
                style={[s.storyInput, { color: ink, backgroundColor: infoBg, borderColor: PANEL_EDGE }]}
              />
            ) : (
              <Text style={[s.storyText, { color: ink }]}>{vals[key] || '——'}</Text>
            )}
          </View>
        ))}
      </KawaiiPanel>

      <View style={s.bottomGrid}>
        <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.bottomPanel}>
          <Text style={[s.kawaiiLabel, { color: ink }]}>tropes</Text>
          <View style={s.tropesWrap}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[s.tropeChip, { backgroundColor: infoBg, borderColor: PANEL_EDGE, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 }]}>
                <Heart size={10} color={ink} />
                {e ? (
                  <TextInput
                    value={vals[`trope${i}`] ?? ''}
                    onChangeText={set(`trope${i}`)}
                    placeholder="trope"
                    placeholderTextColor={ink + '88'}
                    underlineColorAndroid="transparent"
                    style={{ fontFamily: FontFamily.markerBold, fontSize: sf(9), color: ink, padding: 0, flex: 1 }}
                  />
                ) : (
                  <Text style={{ fontFamily: FontFamily.markerBold, fontSize: sf(9), color: ink }}>
                    {vals[`trope${i}`] || '——'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </KawaiiPanel>
        <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.bottomPanel}>
          <Text style={[s.kawaiiLabel, { color: ink }]}>anniversary</Text>
          <View style={{ marginTop: 6 }}>
            {(() => {
              const el = calcElapsed(vals.anniv);
              if (e) {
                return (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontFamily: FontFamily.markerBold, fontSize: sf(26), color: ink, lineHeight: sf(28) }}>
                      {el ? el.label : '——'}
                    </Text>
                    <DateField
                      value={vals.anniv}
                      onChange={(v) => setVal('anniv', v)}
                      editing={e}
                      format="full"
                      placeholder="pick a date"
                      displayValue={el ? `since ${el.since}` : undefined}
                      style={{
                        borderWidth: 0,
                        backgroundColor: 'transparent',
                        paddingHorizontal: 0,
                        height: 'auto',
                        justifyContent: 'flex-start',
                        marginTop: 2,
                      }}
                      textStyle={{ fontFamily: FontFamily.marker, fontSize: sf(10), color: ink, opacity: 0.7 }}
                    />
                  </View>
                );
              } else {
                return el ? (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontFamily: FontFamily.markerBold, fontSize: sf(26), color: ink, lineHeight: sf(28) }}>
                      {el.label}
                    </Text>
                    <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(10), color: ink, opacity: 0.7, marginTop: 2 }}>
                      since {el.since}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(11), color: ink }}>——</Text>
                );
              }
            })()}
          </View>
        </KawaiiPanel>
      </View>

      <Modal visible={picking !== null} transparent animationType="fade" onRequestClose={() => setPicking(null)}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={() => setPicking(null)}>
            <View style={pk.overlay} />
          </TouchableWithoutFeedback>
          <View style={[pk.sheet, SheetColumn]}>
            <View style={pk.handle} />
            <Text style={pk.title}>pick a color</Text>
            <View style={pk.grid}>
              {PALETTE_SWATCHES.map((c) => {
                const curKey = picking ? `${picking.prefix}Pal${picking.idx}` : '';
                const cur = picking ? vals[curKey] : '';
                return (
                  <Pressable
                    key={c}
                    style={[pk.swatch, { backgroundColor: c }, c === cur && pk.swatchActive]}
                    onPress={() => {
                      if (picking) setVal(`${picking.prefix}Pal${picking.idx}`, c);
                      setPicking(null);
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

export default function TemplateKawaiiUI() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="kawaii-ui" shipId={shipId}>
      <KawaiiUIContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: '#9c2d5a',
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  ribbonTL: { position: 'absolute', top: 8, left: 8 },
  ribbonTR: { position: 'absolute', top: 8, right: 8 },
  titlePillRow: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  titlePill: { backgroundColor: '#9c2d5a', paddingHorizontal: 18, paddingVertical: 5, borderRadius: 999 },
  titlePillText: { fontFamily: FontFamily.markerBold, fontSize: sf(18), color: '#fff', letterSpacing: 0.5 },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 58 },
  statPanel: { flex: 1 },
  kawaiiLabel: { fontFamily: FontFamily.markerBold, fontSize: sf(8), letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 },
  mainPanel: { marginTop: 10 },
  personHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  personNameInput: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(13), color: PINK_INK, padding: 0 },
  personNameText: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(13), color: PINK_INK },
  mainRow: { flexDirection: 'row', gap: 10 },
  mainRowReverse: { flexDirection: 'row-reverse' },
  portraitStyle: { borderRadius: 8, borderWidth: 1.5, borderColor: PANEL_EDGE },
  infoCol: { flex: 1, gap: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoKey: { fontFamily: FontFamily.markerBold, fontSize: sf(8), letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.7, width: 84 },
  infoVal: { flex: 1, height: 20, borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  infoValInput: { fontFamily: FontFamily.ja, fontSize: sf(11), color: INK, padding: 0 },
  mt10: { marginTop: 10 },
  sharingRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  sharingOpt: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sharingText: { fontSize: sf(11) },
  bottomGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  bottomPanel: { flex: 1 },
  tropesWrap: { flexDirection: 'column', gap: 5, marginTop: 6 },
  tropeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontFamily: FontFamily.marker,
    fontSize: sf(11),
    color: '#9c2d5a',
    minHeight: 28,
  },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  orientationWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  orientationPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  orientationText: { fontFamily: FontFamily.marker, fontSize: sf(8) },
  paletteRow: { flex: 1, flexDirection: 'row', gap: 6 },
  paletteDot: { width: 16, height: 16, borderRadius: 999, borderWidth: 1 },
  firstRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  firstLabel: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(10) },
  firstOpts: { flexDirection: 'row', gap: 4 },
  firstPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  firstPillText: { fontFamily: FontFamily.marker, fontSize: sf(8) },
  storyBlock: { marginTop: 6 },
  storyInput: { fontFamily: FontFamily.ja, fontSize: sf(11), minHeight: 40, borderWidth: 1, borderRadius: 6, padding: 8, marginTop: 4, textAlignVertical: 'top' },
  storyText: { fontFamily: FontFamily.ja, fontSize: sf(11), marginTop: 4, lineHeight: sf(15) },
});

const pk = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fffbf6', borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, padding: Spacing.s5, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: '#e0d4cc', borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.s4 },
  title: { fontFamily: FontFamily.markerBold, fontSize: sf(14), color: PINK_INK, marginBottom: Spacing.s4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 36, height: 36, borderRadius: 6, borderWidth: 1.5, borderColor: '#e0d4cc' },
  swatchActive: { borderColor: PINK_INK, borderWidth: 2.5 },
});
