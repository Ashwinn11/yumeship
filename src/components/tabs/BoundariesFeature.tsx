import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { CozyModal } from '@/components/ui/CozyModal';
import { Heart } from '@/components/deco/Heart';
import { FILL_GRAY, INK, SquareCheck, TitleHeader } from '@/components/templates/primitives';
import { IconPlus, IconTrashSolid } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import { loadTemplateData, saveTemplateData } from '@/store/templateData';

// ─── Boundaries feature ───────────────────────────────────────────────────────

type BState = {
  title: string;
  ja: string;
  tint: string;
  stroke: string;
  desc: string;
  /** which shareStatus this card represents — shared with the boundaries template,
   *  which reads and writes these same `states` */
  stance?: string;
  checks: { label: string; on: boolean }[];
};

const DEFAULT_STATES: BState[] = [
  {
    title: 'NO SHARING', ja: '夢', tint: '#ffd6e2', stroke: '#c44e75', stance: 'no',
    desc: "they're mine. doubles dni.",
    checks: [
      { label: 'doubles interact', on: false },
      { label: 'fan art with double f/o', on: false },
      { label: 'double tags / hashtags', on: false },
      { label: 'RP with double', on: false },
    ],
  },
  {
    title: 'SELECTIVE', ja: '限', tint: '#fde9c6', stroke: '#b58732', stance: 'selective',
    desc: 'case by case. ask me first.',
    checks: [
      { label: 'mutuals only', on: true },
      { label: 'platonic doubles ok', on: true },
      { label: 'fan art if tagged', on: true },
      { label: 'non-shipping discussions', on: true },
    ],
  },
  {
    title: 'OK SHARING', ja: '可', tint: '#d6ecda', stroke: '#3f8157', stance: 'yes',
    desc: 'the more the merrier.',
    checks: [
      { label: 'all doubles welcome', on: true },
      { label: 'co-headcanons', on: true },
      { label: 'polyship intros', on: true },
      { label: 'scenario swaps', on: true },
    ],
  },
  {
    title: 'MIRROR', ja: '鏡', tint: '#fbecc4', stroke: '#b8902a', stance: 'mirror',
    desc: "whatever you're comfy with. tell me yours.",
    checks: [
      { label: 'i follow your lead', on: true },
      { label: 'ask before tagging', on: true },
      { label: 'quiet if you prefer', on: true },
      { label: 'close if you are', on: true },
    ],
  },
];

export function BoundariesFeature({ shipId }: { shipId: string }) {
  const [editing, setEditing] = useState(false);

  const init = (): BState[] => {
    const saved = loadTemplateData(shipId, 'boundaries');
    return saved.states ? JSON.parse(saved.states) : DEFAULT_STATES;
  };

  const [states, setStates] = useState<BState[]>(init);
  const [footer, setFooter] = useState<string>(() => {
    const saved = loadTemplateData(shipId, 'boundaries');
    return saved.footer ?? "let's keep the yumeship community happy ♡";
  });

  function persist(nextStates: BState[], nextFooter = footer) {
    saveTemplateData(shipId, 'boundaries', {
      states: JSON.stringify(nextStates),
      footer: nextFooter,
    });
  }

  function toggleCheck(si: number, ci: number) {
    setStates((prev) => {
      const next = prev.map((st, i) =>
        i !== si ? st : {
          ...st,
          checks: st.checks.map((c, j) => j !== ci ? c : { ...c, on: !c.on }),
        },
      );
      persist(next);
      return next;
    });
  }

  function updateField(si: number, field: keyof Omit<BState, 'checks' | 'tint' | 'stroke'>, val: string) {
    setStates((prev) => {
      const next = prev.map((st, i) => i !== si ? st : { ...st, [field]: val });
      persist(next);
      return next;
    });
  }

  function updateCheckLabel(si: number, ci: number, val: string) {
    setStates((prev) => {
      const next = prev.map((st, i) =>
        i !== si ? st : {
          ...st,
          checks: st.checks.map((c, j) => j !== ci ? c : { ...c, label: val }),
        },
      );
      persist(next);
      return next;
    });
  }

  function addCheck(si: number) {
    setStates((prev) => {
      const next = prev.map((st, i) =>
        i !== si ? st : { ...st, checks: [...st.checks, { label: 'new item', on: true }] },
      );
      persist(next);
      return next;
    });
  }

  function removeCheck(si: number, ci: number) {
    setStates((prev) => {
      const next = prev.map((st, i) =>
        i !== si ? st : { ...st, checks: st.checks.filter((_, j) => j !== ci) },
      );
      persist(next);
      return next;
    });
  }

  return (
    <View style={bn.wrap}>
      <View style={bn.topRow}>
        <Text style={bn.eyebrow}>BOUNDARIES</Text>
        <Pressable
          style={[bn.editBtn, editing && bn.editBtnOn]}
          onPress={() => setEditing((v) => !v)}
        >
          <Text style={[bn.editBtnText, editing && bn.editBtnTextOn]}>
            {editing ? 'done' : 'edit'}
          </Text>
        </Pressable>
      </View>

      {/* Title */}
      <View style={bn.titleCenter}>
        <View style={bn.titlePill}>
          <Text style={bn.titleJa}>夢</Text>
          <Text style={bn.titleText}>BOUNDARIES</Text>
        </View>
        <Text style={bn.titleSub}>sharing status &amp; what's ok</Text>
      </View>

      {/* State cards */}
      <View style={bn.states}>
        {states.map((st, si) => (
          <View key={si} style={[bn.stateCard, { backgroundColor: st.tint, borderColor: st.stroke }]}>
            <View style={[bn.seal, { borderColor: st.stroke }]}>
              {editing ? (
                <TextInput
                  value={st.ja}
                  onChangeText={(v) => updateField(si, 'ja', v)}
                  style={[bn.sealJa, { color: st.stroke }]}
                  maxLength={2}
                  textAlign="center"
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              ) : (
                <Text style={[bn.sealJa, { color: st.stroke }]}>{st.ja}</Text>
              )}
            </View>

            <View style={bn.stateContent}>
              {editing ? (
                <TextInput
                  value={st.title}
                  onChangeText={(v) => updateField(si, 'title', v)}
                  style={[bn.stateTitle, { color: st.stroke }]}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              ) : (
                <Text style={[bn.stateTitle, { color: st.stroke }]}>{st.title}</Text>
              )}

              {editing ? (
                <TextInput
                  value={st.desc}
                  onChangeText={(v) => updateField(si, 'desc', v)}
                  style={bn.stateDesc}
                  multiline
                />
              ) : (
                <Text style={bn.stateDesc}>{st.desc}</Text>
              )}

              <View style={bn.checkGrid}>
                {st.checks.map((c, ci) => (
                  <View key={ci} style={bn.checkRow}>
                    <Pressable onPress={() => toggleCheck(si, ci)}>
                      <SquareCheck on={c.on} size={11} stroke={st.stroke} />
                    </Pressable>
                    {editing ? (
                      <TextInput
                        value={c.label}
                        onChangeText={(v) => updateCheckLabel(si, ci, v)}
                        style={bn.checkInput}
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                      />
                    ) : (
                      <Text style={[bn.checkText, { opacity: c.on ? 1 : 0.6 }]}>{c.label}</Text>
                    )}
                    {editing && (
                      <Pressable onPress={() => removeCheck(si, ci)} hitSlop={6}>
                        <Text style={bn.removeCheck}>✕</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
                {editing && (
                  <Pressable style={bn.addCheckBtn} onPress={() => addCheck(si)}>
                    <Text style={[bn.addCheckText, { color: st.stroke }]}>+ add item</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Svg width={44} height={54} viewBox="0 0 50 60" style={bn.chibi}>
              <Circle cx="25" cy="18" r="13" fill="#fff" stroke={st.stroke} strokeWidth="1.5" />
              <Path d="M14 35 L 16 56 L 34 56 L 36 35 Z" fill="#fff" stroke={st.stroke} strokeWidth="1.5" strokeLinejoin="round" />
              <Circle cx="20" cy="18" r="1.2" fill={INK} />
              <Circle cx="30" cy="18" r="1.2" fill={INK} />
              <Path d="M22 23 Q 25 25, 28 23" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </Svg>
          </View>
        ))}
      </View>

      {/* Footer */}
      {editing ? (
        <TextInput
          value={footer}
          onChangeText={(v) => { setFooter(v); persist(states, v); }}
          style={bn.footerInput}
          textAlign="center"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      ) : (
        <Text style={bn.footer}>{footer}</Text>
      )}
      <View style={{ height: Spacing.s9 }} />
    </View>
  );
}


const bn = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.s3 },
  eyebrow: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4 },
  editBtn: {
    paddingVertical: 5, paddingHorizontal: 14,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.line,
    backgroundColor: Colors.vellum,
  },
  editBtnOn: { backgroundColor: Colors.sakuraDeep, borderColor: Colors.sakuraDeep },
  editBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2 },
  editBtnTextOn: { color: Colors.vellum },

  titleCenter: { alignItems: 'center', marginBottom: 6, gap: 4 },
  titlePill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: INK, paddingHorizontal: 18, paddingVertical: 6, borderRadius: 999,
  },
  titleJa: { fontFamily: FontFamily.ja, fontSize: sf(18), color: '#fff' },
  titleText: { fontFamily: FontFamily.markerBold, fontSize: sf(16), color: '#fff', letterSpacing: 0.8 },
  titleSub: { fontFamily: FontFamily.ui, fontSize: sf(12), color: INK, opacity: 0.7 },

  states: { marginTop: 14, gap: 10 },
  stateCard: {
    borderWidth: 2, borderRadius: 16, padding: 12,
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
  },
  seal: {
    width: 44, height: 44, borderRadius: 999, borderWidth: 2,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sealJa: { fontFamily: FontFamily.ja, fontSize: sf(22), textAlign: 'center' },
  stateContent: { flex: 1, minWidth: 0 },
  stateTitle: { fontFamily: FontFamily.markerBold, fontSize: sf(14), letterSpacing: 0.5 },
  stateDesc: { fontFamily: FontFamily.ui, fontSize: sf(11), color: INK, marginTop: 2 },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '48%', minWidth: 0 },
  checkText: { fontFamily: FontFamily.marker, fontSize: sf(9), color: INK, flex: 1 },
  checkInput: { fontFamily: FontFamily.ui, fontSize: sf(9), color: INK, flex: 1, padding: 0 },
  removeCheck: { fontSize: sf(9), color: INK, opacity: 0.4 },
  addCheckBtn: { paddingVertical: 2, paddingHorizontal: 4 },
  addCheckText: { fontFamily: FontFamily.uiMedium, fontSize: sf(10) },
  chibi: { flexShrink: 0, alignSelf: 'center' },

  footer: { textAlign: 'center', fontFamily: FontFamily.ui, fontSize: sf(11), color: INK, opacity: 0.7, marginTop: 14 },
  footerInput: { textAlign: 'center', fontFamily: FontFamily.ui, fontSize: sf(11), color: INK, marginTop: 14, borderBottomWidth: 1, borderBottomColor: INK + '33', paddingBottom: 2 },
});
