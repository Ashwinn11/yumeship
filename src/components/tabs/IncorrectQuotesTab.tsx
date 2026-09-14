import { useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useIPad } from '@/hooks/use-ipad';
import { getMembers, memberColor, ShipMember, useShip } from '@/store/ships';
import { loadTemplateData, saveTemplateData } from '@/store/templateData';
import { Colors, FontFamily, Spacing, sf } from '@/constants/theme';

const INK = '#1f1219';
const TEMPLATE_KEY = 'incorrect-quotes';

// Preset scenes. roles = number of distinct cast slots; lines reference {rN} and a speaker role `s`.
const BITS: { roles: number; lines: { s: number; t: string }[] }[] = [
  { roles: 3, lines: [{ s: 0, t: 'I love you.' }, { s: 1, t: 'I know.' }, { s: 2, t: "…we are all literally dating. you don't have to be cool about it." }] },
  { roles: 3, lines: [{ s: 0, t: 'who hurt you?' }, { s: 1, t: 'the entire concept of {r2} being that attractive at 7am.' }] },
  { roles: 3, lines: [{ s: 0, t: 'we do NOT have a favorite.' }, { s: 1, t: '{r2} is the favorite.' }, { s: 0, t: 'ok {r2} is the favorite.' }] },
  { roles: 4, lines: [{ s: 0, t: '(whispering) are you awake?' }, { s: 1, t: 'no.' }, { s: 2, t: 'no.' }, { s: 3, t: 'tragically, yes.' }] },
  { roles: 3, lines: [{ s: 0, t: 'rule one: no flirting during the meeting.' }, { s: 1, t: '*winks at {r2}*' }, { s: 0, t: '{r1}.' }] },
  { roles: 3, lines: [{ s: 0, t: 'I made dinner!' }, { s: 1, t: 'you made {r2} cry.' }, { s: 0, t: 'I multitask.' }] },
  { roles: 3, lines: [{ s: 0, t: 'on a scale of 1 to 10?' }, { s: 1, t: '{r2}.' }, { s: 0, t: "that's not a number." }, { s: 1, t: "it's MY number." }] },
  { roles: 2, lines: [{ s: 0, t: 'who said romance is dead?' }, { s: 1, t: 'you. this morning. about doing the dishes.' }] },
  { roles: 3, lines: [{ s: 0, t: "I'd take a bullet for you." }, { s: 1, t: "I'd take a bullet for {r2}." }, { s: 2, t: 'please. nobody take any bullets.' }] },
  { roles: 3, lines: [{ s: 0, t: "define 'we'." }, { s: 1, t: 'me, you, {r2}, and the three plants we co-parent.' }] },
  { roles: 3, lines: [{ s: 0, t: "{r1} called me 'babe'." }, { s: 2, t: '{r1} calls everyone babe.' }, { s: 0, t: '…babe?' }, { s: 1, t: 'yeah?' }, { s: 2, t: 'oh.' }] },
  { roles: 3, lines: [{ s: 0, t: "I'm not jealous." }, { s: 1, t: "you alphabetized {r2}'s bookshelf out of spite." }, { s: 0, t: 'it was MESSY.' }] },
];

type Extra = { speaker: string; text: string };
type SavedLine = { name: string; color: string; text: string };
type PState = { sceneIdx: number; casting: string[]; extra: Extra[]; saved: { lines: SavedLine[] }[] };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function castFor(members: ShipMember[], idx: number): string[] {
  const ids = members.map((m) => m.id);
  if (ids.length === 0) return [];
  const sh = shuffle(ids);
  const roles = BITS[idx].roles;
  const c: string[] = [];
  for (let i = 0; i < roles; i++) c.push(sh[i % sh.length]);
  return c;
}

export function IncorrectQuotesTab({ shipId }: { shipId: string }) {
  const { column } = useIPad();
  const ship = useShip(shipId);
  const members = getMembers(ship);

  const colorOf = (id: string) => memberColor(Math.max(0, members.findIndex((m) => m.id === id)));
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name || '?';

  const [p, setP] = useState<PState>(() => {
    const saved = loadTemplateData(shipId, TEMPLATE_KEY);
    if (saved.state) {
      try {
        const parsed = JSON.parse(saved.state) as PState;
        if (parsed && Array.isArray(parsed.casting)) return parsed;
      } catch (_) {}
    }
    return { sceneIdx: 0, casting: castFor(members, 0), extra: [], saved: [] };
  });
  const [draftText, setDraftText] = useState('');
  const [draftSpeaker, setDraftSpeaker] = useState(() => members[0]?.id ?? '');

  function persist(next: PState) {
    setP(next);
    saveTemplateData(shipId, TEMPLATE_KEY, { state: JSON.stringify(next) });
  }

  const sub = (t: string) => t.replace(/\{r(\d)\}/g, (_, d: string) => nameOf(p.casting[+d] ?? members[0]?.id ?? ''));

  function derive() {
    const bit = BITS[p.sceneIdx];
    const gen = bit.lines.map((l, i) => ({ key: 'g' + i, role: l.s as number | null, exi: -1, speaker: p.casting[l.s], text: sub(l.t) }));
    const ex = p.extra.map((e, i) => ({ key: 'e' + i, role: null as number | null, exi: i, speaker: e.speaker, text: e.text }));
    return [...gen, ...ex];
  }

  function newScene() {
    let n = p.sceneIdx;
    if (BITS.length > 1) while (n === p.sceneIdx) n = Math.floor(Math.random() * BITS.length);
    persist({ ...p, sceneIdx: n, casting: castFor(members, n), extra: [] });
  }
  function recast() { persist({ ...p, casting: castFor(members, p.sceneIdx) }); }
  function cycleRole(role: number) {
    const ids = members.map((m) => m.id);
    const idx = ids.indexOf(p.casting[role]);
    const c = p.casting.slice();
    c[role] = ids[(idx + 1) % ids.length];
    persist({ ...p, casting: c });
  }
  function cycleExtra(i: number) {
    const ids = members.map((m) => m.id);
    const e = p.extra.slice();
    const idx = ids.indexOf(e[i].speaker);
    e[i] = { ...e[i], speaker: ids[(idx + 1) % ids.length] };
    persist({ ...p, extra: e });
  }
  function addLine() {
    const t = draftText.trim();
    if (!t) return;
    persist({ ...p, extra: [...p.extra, { speaker: draftSpeaker || members[0]?.id || '', text: t }] });
    setDraftText('');
  }
  function removeExtra(i: number) { persist({ ...p, extra: p.extra.filter((_, j) => j !== i) }); }
  function cycleDraftSpeaker() {
    const ids = members.map((m) => m.id);
    const idx = ids.indexOf(draftSpeaker);
    setDraftSpeaker(ids[(idx + 1) % ids.length] ?? '');
  }
  function saveBit() {
    const lines = derive().map((l) => ({ name: nameOf(l.speaker), color: colorOf(l.speaker), text: l.text }));
    persist({ ...p, saved: [{ lines }, ...p.saved] });
  }
  function removeSaved(i: number) { persist({ ...p, saved: p.saved.filter((_, j) => j !== i) }); }

  if (members.length < 2) {
    return (
      <View style={s.emptyWrap}>
        <Text style={s.emptyText}>add at least two characters to your polycule{'\n'}(in the poly chart) to start casting ♡</Text>
      </View>
    );
  }

  const lines = derive();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.wrap, column]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()}>
      <View style={s.headerWrap}>
        <View style={s.titlePill}><Text style={s.titlePillText}>INCORRECT QUOTES</Text></View>
        <Text style={s.subtitle}>starring your polycule ♡  ·  tap a name to recast</Text>
      </View>

      {/* cast */}
      <Text style={s.sectionTitle}>The cast</Text>
      <View style={s.castRow}>
        {members.map((m) => (
          <View key={m.id} style={s.castChip}>
            <View style={[s.castDot, { backgroundColor: colorOf(m.id) }]} />
            <Text style={s.castName}>{m.name || '—'}</Text>
          </View>
        ))}
      </View>

      {/* scene */}
      <View style={s.sceneBox}>
        <View style={s.sceneTag}><Text style={s.sceneTagText}>scene #{p.sceneIdx + 1}</Text></View>
        <View style={{ gap: 11, marginTop: 4 }}>
          {lines.map((l) => (
            <View key={l.key} style={s.lineRow}>
              <Pressable onPress={() => (l.role != null ? cycleRole(l.role) : cycleExtra(l.exi))}>
                <View style={[s.speakerPill, { backgroundColor: colorOf(l.speaker) }]}>
                  <Text style={s.speakerPillText}>{nameOf(l.speaker)}</Text>
                </View>
              </Pressable>
              <Text style={s.lineText}>{l.text}</Text>
              {l.role == null && (
                <Pressable onPress={() => removeExtra(l.exi)} hitSlop={6}><Text style={s.lineRemove}>✕</Text></Pressable>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* controls */}
      <View style={s.controls}>
        <Pressable style={[s.btn, s.btnPrimary]} onPress={newScene}><Text style={s.btnPrimaryText}>🎲 new scene</Text></Pressable>
        <Pressable style={[s.btn, s.btnGhost]} onPress={recast}><Text style={s.btnGhostText}>🔀 recast</Text></Pressable>
        <Pressable style={[s.btn, s.btnSave]} onPress={saveBit}><Text style={s.btnSaveText}>♡ save bit</Text></Pressable>
      </View>

      {/* add line */}
      <View style={s.addRow}>
        <Pressable onPress={cycleDraftSpeaker}>
          <View style={[s.speakerPill, { backgroundColor: colorOf(draftSpeaker) }]}>
            <Text style={s.speakerPillText}>{nameOf(draftSpeaker)}</Text>
          </View>
        </Pressable>
        <TextInput
          value={draftText}
          onChangeText={setDraftText}
          onSubmitEditing={addLine}
          returnKeyType="done"
          placeholder="write your own line…"
          placeholderTextColor={Colors.ink3}
          style={s.addInput}
        />
        <Pressable style={s.addBtn} onPress={addLine}><Text style={s.addBtnText}>＋</Text></Pressable>
      </View>

      {/* saved */}
      <Text style={[s.sectionTitle, { marginTop: 24 }]}>Saved bits ♡</Text>
      {p.saved.length === 0 ? (
        <Text style={s.savedEmpty}>tap ♡ save bit to keep the funny ones here</Text>
      ) : (
        <View style={{ gap: 9, marginTop: 8 }}>
          {p.saved.map((sv, i) => (
            <View key={i} style={s.savedCard}>
              <Pressable onPress={() => removeSaved(i)} hitSlop={6} style={s.savedRemove}><Text style={s.savedRemoveText}>✕</Text></Pressable>
              <View style={{ gap: 5 }}>
                {sv.lines.map((l, j) => (
                  <View key={j} style={s.savedLine}>
                    <Text style={[s.savedName, { color: l.color }]}>{l.name}:</Text>
                    <Text style={s.savedText}>{l.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s8 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.s6 },
  emptyText: { fontFamily: FontFamily.script, fontSize: sf(18), color: Colors.ink3, textAlign: 'center' },

  headerWrap: { alignItems: 'center', marginBottom: 16 },
  titlePill: { backgroundColor: Colors.plum, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 20 },
  titlePillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(17), color: '#fff', letterSpacing: 0.5 },
  subtitle: { fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.plum, marginTop: 5, textAlign: 'center' },

  sectionTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), textTransform: 'uppercase', color: Colors.plum, textAlign: 'center', marginBottom: 8 },
  castRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' },
  castChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 1.5, borderColor: INK, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  castDot: { width: 11, height: 11, borderRadius: 999, borderWidth: 1.4, borderColor: INK },
  castName: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: INK },

  sceneBox: { position: 'relative', backgroundColor: '#fffdfb', borderWidth: 1.5, borderColor: INK, borderRadius: 14, padding: 16, paddingTop: 18, marginTop: 18 },
  sceneTag: { position: 'absolute', top: -9, left: 18, backgroundColor: '#fbecc4', borderWidth: 1.5, borderColor: '#b8902a', borderRadius: 999, paddingVertical: 1, paddingHorizontal: 10 },
  sceneTagText: { fontFamily: FontFamily.uiMedium, fontSize: sf(10), color: '#7a5e15' },
  lineRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  speakerPill: { borderRadius: 999, borderWidth: 1.5, borderColor: INK, paddingVertical: 2, paddingHorizontal: 11, alignSelf: 'flex-start' },
  speakerPillText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: '#fff' },
  lineText: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(13), lineHeight: sf(19), color: INK },
  lineRemove: { color: '#c9a9b7', fontSize: sf(11) },

  controls: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 },
  btn: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, borderWidth: 1.5, borderColor: INK },
  btnPrimary: { backgroundColor: Colors.plum, borderColor: Colors.plum },
  btnPrimaryText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },
  btnGhost: { backgroundColor: '#fff' },
  btnGhostText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#5a3f53' },
  btnSave: { backgroundColor: '#fadde5', borderColor: INK },
  btnSaveText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#8b3a4a' },

  addRow: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e3cdbe', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 7, marginTop: 12 },
  addInput: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(12), color: INK, padding: 0 },
  addBtn: { backgroundColor: Colors.sageDeep, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  addBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },

  savedEmpty: { fontFamily: FontFamily.script, fontSize: sf(16), color: '#b4a0ad', textAlign: 'center' },
  savedCard: { position: 'relative', backgroundColor: '#fffdfb', borderWidth: 1.5, borderColor: '#e3cdbe', borderRadius: 10, padding: 12 },
  savedRemove: { position: 'absolute', top: 6, right: 9, zIndex: 2 },
  savedRemoveText: { color: '#c9a9b7', fontSize: sf(12) },
  savedLine: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingRight: 16 },
  savedName: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(10.5) },
  savedText: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(11.5), lineHeight: sf(16), color: INK },
});
