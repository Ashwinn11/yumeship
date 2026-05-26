import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { INK, MarkerCard, ScriptCredit, SquareCheck } from '@/components/templates/primitives';
import { FontFamily } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const STATES = [
  {
    title: 'NO SHARING', ja: '夢', tint: '#ffd6e2', stroke: '#c44e75',
    desc: "they're mine. doubles dni.",
    checks: ['doubles interact', 'fan art with double f/o', 'double tags / hashtags', 'RP with double'] as string[],
    defaults: [false, false, false, false],
  },
  {
    title: 'SELECTIVE', ja: '限', tint: '#fde9c6', stroke: '#b58732',
    desc: 'case by case. ask me first.',
    checks: ['mutuals only', 'platonic doubles ok', 'fan art if tagged', 'non-shipping discussions'] as string[],
    defaults: [true, true, true, true],
  },
  {
    title: 'OK SHARING', ja: '可', tint: '#d6ecda', stroke: '#3f8157',
    desc: 'the more the merrier.',
    checks: ['all doubles welcome', 'co-headcanons', 'polyship intros', 'scenario swaps'] as string[],
    defaults: [true, true, true, true],
  },
];

const DEFAULT_CHECK_STATES = STATES.map((st) => [...st.defaults]);

export function BoundariesContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();

  const [checkStates, setCheckStates] = useState<boolean[][]>(() =>
    JSON.parse(ctx.get('checkStates', 'null')) ?? DEFAULT_CHECK_STATES
  );

  const toggle = (si: number, ci: number) => {
    if (!editing) return;
    setCheckStates((p) => {
      const next = p.map((cs, i) => (i === si ? cs.map((c, j) => (j === ci ? !c : c)) : cs));
      ctx.set('checkStates', JSON.stringify(next));
      return next;
    });
  };

  return (
    <MarkerCard tint="#fffaf1">
      <View style={s.titleCenter}>
        <View style={s.titlePill}>
          <Text style={s.titleJa}>夢</Text>
          <Text style={s.titleText}>BOUNDARIES</Text>
        </View>
        <Text style={s.titleSub}>sharing status &amp; what's ok</Text>
        <ScriptCredit by="@petalpressed" />
      </View>

      <View style={s.states}>
        {STATES.map((st, si) => (
          <View key={si} style={[s.stateCard, { backgroundColor: st.tint, borderColor: st.stroke }]}>
            <View style={[s.seal, { borderColor: st.stroke }]}>
              <Text style={[s.sealJa, { color: st.stroke }]}>{st.ja}</Text>
            </View>
            <View style={s.stateContent}>
              <Text style={[s.stateTitle, { color: st.stroke }]}>{st.title}</Text>
              <Text style={s.stateDesc}>{st.desc}</Text>
              <View style={s.checkGrid}>
                {st.checks.map((label, ci) => (
                  <Pressable
                    key={ci}
                    style={s.checkRow}
                    onPress={() => toggle(si, ci)}
                    disabled={!editing}
                  >
                    <SquareCheck on={checkStates[si][ci]} size={11} stroke={st.stroke} />
                    <Text style={[s.checkText, { opacity: checkStates[si][ci] ? 1 : 0.55 }]}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Svg width={44} height={54} viewBox="0 0 50 60" style={s.chibi}>
              <Circle cx="25" cy="18" r="13" fill="#fff" stroke={st.stroke} strokeWidth="1.5" />
              <Path d="M14 35 L 16 56 L 34 56 L 36 35 Z" fill="#fff" stroke={st.stroke} strokeWidth="1.5" strokeLinejoin="round" />
              <Circle cx="20" cy="18" r="1.2" fill={INK} />
              <Circle cx="30" cy="18" r="1.2" fill={INK} />
              <Path d="M22 23 Q 25 25, 28 23" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </Svg>
          </View>
        ))}
      </View>

      <Text style={s.footer}>let's keep the yumeship community happy ♡</Text>
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
    backgroundColor: INK,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
  },
  titleJa: { fontFamily: FontFamily.ja, fontWeight: '600', fontSize: 18, color: '#fff' },
  titleText: { fontFamily: FontFamily.markerBold, fontWeight: '700', fontSize: 16, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase' },
  titleSub: { fontFamily: FontFamily.script, fontSize: 14, color: INK },
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
  sealJa: { fontFamily: FontFamily.ja, fontWeight: '600', fontSize: 22 },
  stateContent: { flex: 1, minWidth: 0 },
  stateTitle: { fontFamily: FontFamily.markerBold, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  stateDesc: { fontFamily: FontFamily.script, fontSize: 13, color: INK, marginTop: 1 },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '48%' },
  checkText: { fontFamily: FontFamily.marker, fontSize: 9, fontWeight: '500', color: INK },
  chibi: { flexShrink: 0, alignSelf: 'center' },
  footer: {
    textAlign: 'center',
    fontFamily: FontFamily.script,
    fontSize: 12,
    color: INK,
    opacity: 0.7,
    marginTop: 14,
  },
});
