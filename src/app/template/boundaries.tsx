import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { INK, MarkerCard, SquareCheck, useThemedInk, getContrastColor } from '@/components/templates/primitives';
import { FontFamily ,sf } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

type BState = {
  title: string; ja: string; tint: string; stroke: string; desc: string;
  /** which shareStatus this card represents, so the one you actually hold can be marked */
  stance: string;
  checks: { label: string; on: boolean }[];
};

const STATES: BState[] = [
  {
    title: 'NO SHARING', ja: '夢', tint: '#ffd6e2', stroke: '#c44e75', stance: 'no',
    desc: "they're mine. doubles dni.",
    checks: ['doubles interact', 'fan art with double f/o', 'double tags / hashtags', 'RP with double']
      .map((label) => ({ label, on: false })),
  },
  {
    title: 'SELECTIVE', ja: '限', tint: '#fde9c6', stroke: '#b58732', stance: 'selective',
    desc: 'case by case. ask me first.',
    checks: ['mutuals only', 'platonic doubles ok', 'fan art if tagged', 'non-shipping discussions']
      .map((label) => ({ label, on: true })),
  },
  {
    title: 'OK SHARING', ja: '可', tint: '#d6ecda', stroke: '#3f8157', stance: 'yes',
    desc: 'the more the merrier.',
    checks: ['all doubles welcome', 'co-headcanons', 'polyship intros', 'scenario swaps']
      .map((label) => ({ label, on: true })),
  },
  {
    title: 'MIRROR', ja: '鏡', tint: '#fbecc4', stroke: '#b8902a', stance: 'mirror',
    desc: "whatever you're comfy with. tell me yours.",
    checks: ['i follow your lead', 'ask before tagging', 'quiet if you prefer', 'close if you are']
      .map((label) => ({ label, on: true })),
  },
];


export function BoundariesContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = useThemedInk();

  // Reads the same `states` the vault's Boundaries feature writes, so editing your
  // boundaries in one place is reflected in the other — this screen used to keep a
  // private `checkStates` array positionally bound to its own hardcoded copy, and
  // the two views of "my boundaries" could never agree.
  const [states, setStates] = useState<BState[]>(() => {
    try {
      const saved = JSON.parse(ctx.get('states', 'null'));
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    try {
      // carry over ticks saved under the old private schema
      const legacy = JSON.parse(ctx.get('checkStates', 'null'));
      if (Array.isArray(legacy)) {
        return STATES.map((st, i) => ({
          ...st,
          checks: st.checks.map((c, j) => ({ ...c, on: legacy[i]?.[j] ?? c.on })),
        }));
      }
    } catch {}
    return STATES;
  });

  const mine = ctx.get('sharing', '');

  const toggle = (si: number, ci: number) => {
    if (!editing) return;
    setStates((p) => {
      const next = p.map((st, i) =>
        i !== si ? st : { ...st, checks: st.checks.map((c, j) => (j === ci ? { ...c, on: !c.on } : c)) },
      );
      ctx.set('states', JSON.stringify(next));
      return next;
    });
  };

  return (
    <MarkerCard tint={customBg ? 'transparent' : '#fffaf1'}>
      <View style={s.titleCenter}>
        <View style={[s.titlePill, { backgroundColor: ink }]}>
          <Text style={[s.titleJa, { color: getContrastColor(ink) }]}>夢</Text>
          <Text style={[s.titleText, { color: getContrastColor(ink) }]}>BOUNDARIES</Text>
        </View>
        <Text style={[s.titleSub, { color: ink }]}>sharing status &amp; what's ok</Text>
      </View>

      <View style={s.states}>
        {states.map((st, si) => (
          <View
            key={si}
            style={[
              s.stateCard,
              { backgroundColor: st.tint, borderColor: st.stroke },
              mine && st.stance === mine && { borderWidth: 3 },
            ]}
          >
            <View style={[s.seal, { borderColor: st.stroke }]}>
              <Text style={[s.sealJa, { color: st.stroke }]}>{st.ja}</Text>
            </View>
            <View style={s.stateContent}>
              <Text style={[s.stateTitle, { color: st.stroke }]}>
                {st.title}{mine && st.stance === mine ? '  ♡ mine' : ''}
              </Text>
              <Text style={[s.stateDesc, { color: ink }]}>{st.desc}</Text>
              <View style={s.checkGrid}>
                {st.checks.map((c, ci) => (
                  <Pressable
                    key={ci}
                    style={s.checkRow}
                    onPress={() => toggle(si, ci)}
                    disabled={!editing}
                  >
                    <SquareCheck on={c.on} size={11} stroke={st.stroke} />
                    <Text style={[s.checkText, { color: ink, opacity: c.on ? 1 : 0.8 }]}>
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Svg width={44} height={54} viewBox="0 0 50 60" style={s.chibi}>
              <Circle cx="25" cy="18" r="13" fill="#fff" stroke={st.stroke} strokeWidth="1.5" />
              <Path d="M14 35 L 16 56 L 34 56 L 36 35 Z" fill="#fff" stroke={st.stroke} strokeWidth="1.5" strokeLinejoin="round" />
              <Circle cx="20" cy="18" r="1.2" fill={ink} />
              <Circle cx="30" cy="18" r="1.2" fill={ink} />
              <Path d="M22 23 Q 25 25, 28 23" stroke={ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </Svg>
          </View>
        ))}
      </View>

      <Text style={[s.footer, { color: ink }]}>let's keep the yumeship community happy ♡</Text>
    </MarkerCard>
  );
}

export default function TemplateBoundaries() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="boundaries" shipId={shipId}>
      <BoundariesContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  titleCenter: { alignItems: 'center', marginBottom: 6, gap: 4 },
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
  },
  titleJa: { fontFamily: FontFamily.ja, fontSize: sf(18) },
  titleText: { fontFamily: FontFamily.markerBold, fontSize: sf(16), letterSpacing: 0.8, textTransform: 'uppercase' },
  titleSub: { fontFamily: FontFamily.script, fontSize: sf(14) },
  states: { marginTop: 14, gap: 10 },
  stateCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  seal: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sealJa: { fontFamily: FontFamily.ja, fontSize: sf(22) },
  stateContent: { flex: 1, minWidth: 0 },
  stateTitle: { fontFamily: FontFamily.markerBold, fontSize: sf(15), letterSpacing: 0.5 },
  stateDesc: { fontFamily: FontFamily.ui, fontSize: sf(11), marginTop: 1 },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '48%' },
  checkText: { fontFamily: FontFamily.marker, fontSize: sf(9) },
  chibi: { flexShrink: 0, alignSelf: 'center' },
  footer: {
    textAlign: 'center',
    fontFamily: FontFamily.ui,
    fontSize: sf(11),
    opacity: 0.7,
    marginTop: 14,
  },
});
