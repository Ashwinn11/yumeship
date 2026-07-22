import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern as SvgPattern, Path, Rect } from 'react-native-svg';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { KawaiiPanel, BlankPill, PhotoBox, INK } from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { DateField, calcElapsed } from '@/components/ui/DateField';
import { useTemplateCtx } from '@/store/templateData';
import { FontFamily ,sf } from '@/constants/theme';

const PINK_INK = '#9c2d5a';
const PINK_BG = '#fbe7ee';
const PANEL_EDGE = '#f3a8c4';
const PANEL_BG = '#ffffff';
const TRANSPARENT = 'transparent';

// Each info field renders once per person — key becomes `${prefix}${Field}`,
// e.g. 'age' -> 'theirAge' / 'myAge'.
const INFO_FIELDS = [
  { field: 'age', label: 'age' },
  { field: 'birthday', label: 'birthday' },
  { field: 'pronouns', label: 'pronouns' },
  { field: 'loveLanguage', label: 'love language' },
  { field: 'mbti', label: 'mbti' },
] as const;
const SHARING_OPTS = ['Yes', 'No', 'Selective'] as const;

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function KawaiiUIContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
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
    song:     ctx.get('song'),
    trope0:   ctx.get('trope0'),
    trope1:   ctx.get('trope1'),
    trope2:   ctx.get('trope2'),
    anniv:    ctx.get('anniv'),
  }));

  const setVal = (key: string, v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const e = editing;
  const sharing = vals.sharing || null;

  const set = (key: string) => e ? (v: string) => setVal(key, v) : undefined;

  function renderPersonPanel(prefix: 'their' | 'my', who: string, nameKey: string, portraitKey: string, namePlaceholder: string) {
    return (
      <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.mainPanel}>
        <View style={s.personHeaderRow}>
          <Heart size={11} color={PINK_INK} outline />
          <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>{who}</Text>
          {e ? (
            <TextInput
              value={vals[nameKey] ?? ''}
              onChangeText={set(nameKey)}
              placeholder={namePlaceholder}
              placeholderTextColor={PINK_INK + '88'}
              underlineColorAndroid="transparent"
              style={s.personNameInput}
            />
          ) : (
            <Text style={s.personNameText}>{vals[nameKey] || namePlaceholder}</Text>
          )}
        </View>
        <View style={s.mainRow}>
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
                  <Text style={[s.infoKey, { color: PINK_INK }]}>{label}</Text>
                  {field === 'birthday' ? (
                    <DateField
                      value={vals[k]}
                      onChange={(v) => setVal(k, v)}
                      editing={e}
                      format="birthday"
                      placeholder="pick date"
                      style={[s.infoVal, { backgroundColor: infoBg, borderColor: PANEL_EDGE, borderWidth: 1, borderRadius: 4 }]}
                      textStyle={{ fontSize: sf(9), color: PINK_INK, fontFamily: FontFamily.ja }}
                    />
                  ) : e ? (
                    <TextInput
                      value={vals[k] ?? ''}
                      onChangeText={(v) => setVal(k, v)}
                      placeholder="——"
                      placeholderTextColor={PINK_INK + '88'}
                      underlineColorAndroid="transparent"
                      style={[
                        s.infoVal,
                        s.infoValInput,
                        { backgroundColor: infoBg, borderColor: PANEL_EDGE },
                        field === 'loveLanguage' && { fontSize: sf(9) },
                      ]}
                    />
                  ) : (
                    <View style={[s.infoVal, { backgroundColor: infoBg, borderColor: PANEL_EDGE, justifyContent: 'center' }]}>
                      <Text style={{
                        fontFamily: FontFamily.ja,
                        fontSize: field === 'loveLanguage' ? 8.5 : 11,
                        color: INK,
                      }}>{vals[k]}</Text>
                    </View>
                  )}
                </View>
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
      style={s.card}
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
        <Path d="M5 25 Q 15 5, 30 20 Q 45 5, 55 25 L 30 40 Z" fill={PINK_INK} opacity="0.8" />
        <Path d="M30 40 L 22 56 L 30 50 L 38 56 Z" fill={PINK_INK} opacity="0.8" />
      </Svg>
      <Svg style={s.ribbonTR} width={60} height={60} viewBox="0 0 60 60">
        <Path d="M5 25 Q 15 5, 30 20 Q 45 5, 55 25 L 30 40 Z" fill={PINK_INK} opacity="0.8" />
        <Path d="M30 40 L 22 56 L 30 50 L 38 56 Z" fill={PINK_INK} opacity="0.8" />
      </Svg>

      <View style={s.titlePillRow}>
        <View style={[s.titlePill, customBg ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: PINK_INK } : null]}>
          <Text style={[s.titlePillText, customBg ? { color: PINK_INK } : null]}>My YumeShip</Text>
        </View>
      </View>

      <View style={s.statRow}>
        {([['shipName', 'ship name'], ['from', 'from'], ['type', 'type']] as const).map(([key, label]) => (
          <KawaiiPanel key={key} edge={PANEL_EDGE} bg={panelBg} style={s.statPanel}>
            <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>{label}</Text>
            <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {key === 'shipName' && <Heart size={12} color={PINK_INK} outline />}
              {e ? (
                <TextInput
                  value={vals[key] ?? ''}
                  onChangeText={set(key)}
                  placeholder="——"
                  placeholderTextColor={PINK_INK + '88'}
                  underlineColorAndroid="transparent"
                  style={{ fontFamily: FontFamily.ja, fontSize: sf(13), color: PINK_INK, padding: 0, flex: 1 }}
                />
              ) : (
                <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(13), color: PINK_INK }}>
                  {vals[key] || '——'}
                </Text>
              )}
            </View>
          </KawaiiPanel>
        ))}
      </View>

      {renderPersonPanel('their', 'them', 'theirName', 'theirPortrait', 'their name')}
      <View style={s.mt10}>
        {renderPersonPanel('my', 'me', 'myName', 'myPortrait', 'my name')}
      </View>

      <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.mt10}>
        <Text style={[s.kawaiiLabel, { color: PINK_INK, marginBottom: 6 }]}>sharing status</Text>
        <View style={s.sharingRow}>
          {SHARING_OPTS.map((t) => (
            <Pressable
              key={t}
              style={s.sharingOpt}
              onPress={e ? () => setVal('sharing', sharing === t ? '' : t) : undefined}
              disabled={!e}
            >
              <Heart size={12} color={PINK_INK} outline={sharing !== t} />
              <Text style={[s.sharingText, { color: PINK_INK, fontFamily: sharing === t ? FontFamily.markerBold : FontFamily.marker }]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </KawaiiPanel>

      <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.mt10}>
        <View style={s.songRow}>
          <View style={[s.songIcon, { backgroundColor: infoBg, borderColor: PANEL_EDGE }]}>
            <Text style={{ color: PINK_INK, fontSize: sf(16) }}>♪</Text>
          </View>
          <View style={s.songInfo}>
            <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>theme song</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Heart size={12} color={PINK_INK} outline />
              {e ? (
                <TextInput
                  value={vals.song ?? ''}
                  onChangeText={set('song')}
                  placeholder="song title"
                  placeholderTextColor={PINK_INK + '88'}
                  underlineColorAndroid="transparent"
                  style={{ fontFamily: FontFamily.ja, fontSize: sf(13), color: PINK_INK, padding: 0, flex: 1 }}
                />
              ) : (
                <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(13), color: PINK_INK }}>
                  {vals.song || '——'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </KawaiiPanel>

      <View style={s.bottomGrid}>
        <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.bottomPanel}>
          <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>tropes</Text>
          <View style={s.tropesWrap}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[s.tropeChip, { backgroundColor: infoBg, borderColor: PANEL_EDGE, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 }]}>
                <Heart size={10} color={PINK_INK} />
                {e ? (
                  <TextInput
                    value={vals[`trope${i}`] ?? ''}
                    onChangeText={set(`trope${i}`)}
                    placeholder="trope"
                    placeholderTextColor={PINK_INK + '88'}
                    underlineColorAndroid="transparent"
                    style={{ fontFamily: FontFamily.markerBold, fontSize: sf(9), color: PINK_INK, padding: 0, flex: 1 }}
                  />
                ) : (
                  <Text style={{ fontFamily: FontFamily.markerBold, fontSize: sf(9), color: PINK_INK }}>
                    {vals[`trope${i}`] || '——'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </KawaiiPanel>
        <KawaiiPanel edge={PANEL_EDGE} bg={panelBg} style={s.bottomPanel}>
          <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>anniversary</Text>
          <View style={{ marginTop: 6 }}>
            {(() => {
              const el = calcElapsed(vals.anniv);
              if (e) {
                return (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontFamily: FontFamily.markerBold, fontSize: sf(26), color: PINK_INK, lineHeight: 28 }}>
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
                      textStyle={{ fontFamily: FontFamily.marker, fontSize: sf(10), color: PINK_INK, opacity: 0.7 }}
                    />
                  </View>
                );
              } else {
                return el ? (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontFamily: FontFamily.markerBold, fontSize: sf(26), color: PINK_INK, lineHeight: 28 }}>
                      {el.label}
                    </Text>
                    <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(10), color: PINK_INK, opacity: 0.7, marginTop: 2 }}>
                      since {el.since}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(11), color: PINK_INK }}>——</Text>
                );
              }
            })()}
          </View>
        </KawaiiPanel>
      </View>

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
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  songIcon: { width: 36, height: 36, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  songInfo: { flex: 1 },
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
});
