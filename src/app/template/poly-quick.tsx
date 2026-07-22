import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { INK, useSliderTrack } from '@/components/templates/primitives';
import { useTemplateCtx } from '@/store/templateData';
import { getMembers, memberColor, ShipMember, updateShip, useShip } from '@/store/ships';
import { newId } from '@/db/client';
import { Colors, FontFamily, sf } from '@/constants/theme';

// ─── Static config (ported from the Canvas design) ────────────────────────────

const ROLE_LABELS = ['the mom friend', 'the menace', 'the calm one', 'the spoiled one', 'the instigator', 'the secret romantic'];
const METERS = [
  { id: 'fa', l: 'fluff', r: 'angst' },
  { id: 'burn', l: 'slow burn', r: 'ride or die' },
  { id: 'spice', l: 'soft', r: 'spicy' },
];
const CHECK_LABELS = ['found family', 'only one bed', 'co-parent a pet', 'matching everything', 'share one (1) braincell'];

type Roster = (ShipMember & { color: string })[];

function useJsonState<T>(key: string, fallback: T) {
  const ctx = useTemplateCtx();
  const [val, setVal] = useState<T>(() => {
    const raw = ctx.get(key, '');
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  });
  const set = (next: T) => { setVal(next); ctx.set(key, JSON.stringify(next)); };
  return [val, set] as const;
}

// ─── Meter (single-value slider with left/right labels) ───────────────────────

function MeterRow({ m, value, onChange, editing }: {
  m: typeof METERS[number]; value: number; onChange: (v: number) => void; editing: boolean;
}) {
  const { trackRef, responder } = useSliderTrack(editing ? onChange : undefined);
  return (
    <View style={qs.meterRow}>
      <Text style={qs.meterL}>{m.l}</Text>
      <View ref={trackRef} style={qs.meterTrack} {...responder}>
        <View style={qs.meterBase} />
        <View style={[qs.meterFill, { width: `${value * 100}%` as any }]} />
        <View style={[qs.meterThumb, { left: `${value * 100}%` as any }]} />
      </View>
      <Text style={qs.meterR}>{m.r}</Text>
    </View>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function PolyQuickContent({ editing, shipId }: { editing?: boolean; shipId?: string }) {
  const e = !!editing;
  const ship = useShip(shipId);
  const members = getMembers(ship);
  const roster: Roster = useMemo(() => members.map((m, i) => ({ ...m, color: memberColor(i) })), [members]);

  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const tBg = customBg ? { backgroundColor: 'transparent' } : null;
  const [song, setSong] = useState(() => ctx.get('song', ''));
  const [story, setStory] = useState(() => ctx.get('story', ''));
  const [words, setWords] = useJsonState<string[]>('words', ['', '', '']);
  const [roles, setRoles] = useJsonState<Record<string, string | null>>('roles', {});
  const [meters, setMeters] = useJsonState<Record<string, number>>('meters', { fa: 0.5, burn: 0.5, spice: 0.5 });
  const [tropes, setTropes] = useJsonState<string[]>('tropes', []);
  const [checks, setChecks] = useJsonState<Record<string, boolean>>('checks', {});
  const [tropeDraft, setTropeDraft] = useState('');

  function patchMembers(next: ShipMember[]) { if (shipId) updateShip(shipId, { members: next }); }
  function addMember() { patchMembers([...members, { id: newId(), name: '' }]); }
  function removeMember(id: string) {
    patchMembers(members.filter((m) => m.id !== id));
    const nr = { ...roles };
    Object.keys(nr).forEach((k) => { if (nr[k] === id) nr[k] = null; });
    setRoles(nr);
  }
  function setMemberName(id: string, v: string) { patchMembers(members.map((m) => (m.id === id ? { ...m, name: v } : m))); }

  function cycleRole(rk: string) {
    const order: (string | null)[] = [...members.map((m) => m.id), 'all', null];
    const cur = roles[rk] ?? null;
    let idx = order.indexOf(cur);
    if (idx === -1) idx = order.length - 1;
    setRoles({ ...roles, [rk]: order[(idx + 1) % order.length] });
  }
  function addTrope() { const t = tropeDraft.trim(); if (!t) return; setTropes([...tropes, t]); setTropeDraft(''); }

  return (
    <View style={[qs.card, tBg]}>
      <View style={qs.headerWrap}>
        <View style={qs.titlePill}><Text style={qs.titlePillText}>OUR POLYSHIP IN 5 MINUTES</Text></View>
        <Text style={qs.subtitle}>the quick version ♡  ·  tap anything to edit</Text>
      </View>

      {/* ship + media */}
      <View style={qs.shipRow}>
        <Labeled label="Ship">
          <TextInput value={ship?.shipName ?? ''} editable={e} onChangeText={(v) => shipId && updateShip(shipId, { shipName: v })}
            placeholder="name…" placeholderTextColor={Colors.ink3} style={[qs.lineInput, { color: Colors.plum }]} />
        </Labeled>
        <Labeled label="Media">
          <TextInput value={ship?.fandom ?? ''} editable={e} onChangeText={(v) => shipId && updateShip(shipId, { fandom: v })}
            placeholder="fandom…" placeholderTextColor={Colors.ink3} style={qs.lineInput} />
        </Labeled>
      </View>

      {/* members */}
      <Section title="The polycule" hint="tap ＋ to add anyone" />
      <View style={qs.chipsWrap}>
        {roster.map((m) => (
          <View key={m.id} style={[qs.memberChip, tBg]}>
            <View style={[qs.chipDot, { backgroundColor: m.color }]} />
            {e ? (
              <TextInput value={m.name} onChangeText={(v) => setMemberName(m.id, v)} placeholder="name"
                placeholderTextColor={Colors.ink3} style={qs.chipInput} />
            ) : (
              <Text style={qs.chipName}>{m.name || '—'}</Text>
            )}
            {e && roster.length > 2 && (
              <Pressable onPress={() => removeMember(m.id)} hitSlop={8}><Text style={qs.chipX}>✕</Text></Pressable>
            )}
          </View>
        ))}
        {e && (
          <Pressable style={qs.addChip} onPress={addMember}><Text style={qs.addChipText}>＋ add</Text></Pressable>
        )}
      </View>

      {/* vibe words */}
      <Section title="Vibe in three words" />
      <View style={qs.wordsRow}>
        {[0, 1, 2].map((i) => (
          <TextInput key={i} value={words[i] ?? ''} editable={e}
            onChangeText={(v) => setWords(words.map((w, j) => (j === i ? v : w)))}
            placeholder="word" placeholderTextColor={Colors.ink3} style={[qs.wordInput, tBg]} textAlign="center" />
        ))}
      </View>

      {/* roles */}
      <Section title="Who's the…" hint="tap a name to pass the title around" />
      <View style={qs.block}>
        {ROLE_LABELS.map((label, i) => {
          const rk = `r${i}`;
          const v = roles[rk] ?? null;
          const m = v && v !== 'all' ? roster.find((x) => x.id === v) : null;
          return (
            <Pressable key={rk} style={qs.roleRow} onPress={e ? () => cycleRole(rk) : undefined} disabled={!e}>
              <Text style={qs.roleLabel}>{label}</Text>
              <View style={qs.roleDotted} />
              {v === 'all' ? (
                <Text style={qs.roleAll}>all of them ♡</Text>
              ) : m ? (
                <View style={[qs.roleTag, { backgroundColor: m.color }]}><Text style={qs.roleTagText}>{m.name || '?'}</Text></View>
              ) : (
                <Text style={qs.roleEmpty}>{e ? 'tap →' : '—'}</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* meters */}
      <Section title="The meters" hint="drag where the ship sits" />
      <View style={qs.block}>
        {METERS.map((m) => (
          <MeterRow key={m.id} m={m} value={meters[m.id] ?? 0.5} editing={e}
            onChange={(v) => setMeters({ ...meters, [m.id]: v })} />
        ))}
      </View>

      {/* story */}
      <Section title="How it happened" />
      <View style={[qs.storyBox, tBg]}>
        <TextInput value={story} editable={e} multiline
          onChangeText={(v) => { setStory(v); ctx.set('story', v); }}
          placeholder="they fell in like idiots because…" placeholderTextColor={Colors.ink3} style={qs.storyInput} />
      </View>

      {/* tropes */}
      <Section title="Top tropes" />
      <View style={qs.tropesWrap}>
        {tropes.map((t, i) => (
          <View key={i} style={qs.tropeChip}>
            <Text style={qs.tropeText}>{t}</Text>
            {e && <Pressable onPress={() => setTropes(tropes.filter((_, j) => j !== i))} hitSlop={6}><Text style={qs.tropeX}>✕</Text></Pressable>}
          </View>
        ))}
        {e && (
          <TextInput value={tropeDraft} onChangeText={setTropeDraft} onSubmitEditing={addTrope} returnKeyType="done"
            placeholder="+ trope" placeholderTextColor={Colors.ink3} style={qs.tropeDraft} />
        )}
      </View>

      {/* song */}
      <Section title="Their song" />
      <View style={[qs.songRow, tBg]}>
        <View style={qs.songIcon}><Text style={qs.songNote}>♪</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={qs.label}>song that is So Them</Text>
          <TextInput value={song} editable={e} onChangeText={(v) => { setSong(v); ctx.set('song', v); }}
            placeholder="add a track…" placeholderTextColor={Colors.ink3} style={qs.songInput} />
        </View>
      </View>

      {/* checks */}
      <Section title="Facts" hint="tap to check" />
      <View style={qs.block}>
        {CHECK_LABELS.map((label, i) => {
          const ck = `c${i}`;
          const on = !!checks[ck];
          return (
            <Pressable key={ck} style={qs.checkRow} onPress={e ? () => setChecks({ ...checks, [ck]: !on }) : undefined} disabled={!e}>
              <View style={[qs.checkBox, on && qs.checkBoxOn]}>{on && <Text style={qs.checkMark}>✓</Text>}</View>
              <Text style={[qs.checkLabel, !on && { opacity: 0.78 }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={qs.labeled}>
      <Text style={qs.label}>{label}</Text>
      {children}
    </View>
  );
}

function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={qs.section}>
      <Text style={qs.sectionTitle}>{title}</Text>
      {hint ? <Text style={qs.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

export default function TemplatePolyQuick() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="poly-quick" shipId={shipId}>
      <PolyQuickContent editing shipId={shipId} />
    </TemplateScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PLUM = Colors.plum;
const qs = StyleSheet.create({
  card: { backgroundColor: Colors.vellum, borderWidth: 2, borderColor: INK, borderRadius: 20, padding: 18 },
  headerWrap: { alignItems: 'center' },
  titlePill: { backgroundColor: PLUM, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 18 },
  titlePillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: '#fff', letterSpacing: 0.5 },
  subtitle: { fontFamily: FontFamily.script, fontSize: sf(16), color: PLUM, marginTop: 5 },

  shipRow: { flexDirection: 'row', gap: 14, marginTop: 14 },
  labeled: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  label: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(9), letterSpacing: 0.5, textTransform: 'uppercase', color: '#9a7e92' },
  lineInput: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(11), color: INK, borderBottomWidth: 1.4, borderColor: INK, padding: 0, paddingBottom: 2 },

  block: { marginTop: 8 },
  section: { alignItems: 'center', marginTop: 22 },
  sectionTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), textTransform: 'uppercase', color: PLUM },
  sectionHint: { fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3 },

  // member chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginTop: 8 },
  memberChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 1.5, borderColor: INK, borderRadius: 999, paddingVertical: 3, paddingLeft: 9, paddingRight: 9 },
  chipDot: { width: 11, height: 11, borderRadius: 999, borderWidth: 1.4, borderColor: INK },
  chipInput: { minWidth: 44, fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: INK, padding: 0 },
  chipName: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: INK },
  chipX: { color: '#b04a4a', fontSize: sf(11), fontFamily: FontFamily.uiSemiBold },
  addChip: { backgroundColor: PLUM, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  addChipText: { color: '#fff', fontFamily: FontFamily.uiSemiBold, fontSize: sf(12) },

  // words
  wordsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  wordInput: { flex: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: '#fff', paddingVertical: 7, paddingHorizontal: 4, fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: PLUM },

  // roles
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  roleLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: INK, minWidth: 118 },
  roleDotted: { flex: 1, borderBottomWidth: 1.4, borderColor: '#d8c4b6', borderStyle: 'dotted', height: 1 },
  roleAll: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: '#7a5e15', backgroundColor: '#fbecc4', borderWidth: 1.5, borderColor: '#b8902a', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 11, overflow: 'hidden' },
  roleEmpty: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: '#b4a0ad' },
  roleTag: { borderRadius: 999, paddingVertical: 2, paddingHorizontal: 11, borderWidth: 1.5, borderColor: INK },
  roleTagText: { color: '#fff', fontFamily: FontFamily.uiMedium, fontSize: sf(11) },

  // meters
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 13 },
  meterL: { width: 74, textAlign: 'right', fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.sageDeep },
  meterR: { width: 74, fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.sakuraDeep },
  meterTrack: { flex: 1, height: 16, justifyContent: 'center' },
  meterBase: { position: 'absolute', left: 0, right: 0, height: 9, backgroundColor: '#fff', borderWidth: 1.5, borderColor: INK, borderRadius: 999 },
  meterFill: { position: 'absolute', left: 0, height: 9, backgroundColor: '#d3a3c2', borderRadius: 999 },
  meterThumb: { position: 'absolute', width: 15, height: 15, marginLeft: -7.5, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1.8, borderColor: INK },

  // story
  storyBox: { backgroundColor: '#fffdfb', borderWidth: 1.5, borderColor: '#e3cdbe', borderRadius: 10, padding: 12, marginTop: 8 },
  storyInput: { minHeight: 48, fontFamily: FontFamily.ja, fontSize: sf(12), lineHeight: 19, color: INK, padding: 0, textAlignVertical: 'top' },

  // tropes
  tropesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tropeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fbecc4', borderWidth: 1.5, borderColor: '#b8902a', borderRadius: 999, paddingVertical: 2, paddingLeft: 10, paddingRight: 8 },
  tropeText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: '#7a5e15' },
  tropeX: { color: '#b04a4a', fontSize: sf(10), fontFamily: FontFamily.uiSemiBold },
  tropeDraft: { width: 80, borderWidth: 1.4, borderColor: '#c9a9c0', borderStyle: 'dashed', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, fontFamily: FontFamily.ui, fontSize: sf(11), color: PLUM },

  // song
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f4ecf7', borderWidth: 1.5, borderColor: '#c9a9c0', borderRadius: 12, padding: 12, marginTop: 8 },
  songIcon: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1.5, borderColor: PLUM, alignItems: 'center', justifyContent: 'center' },
  songNote: { fontSize: sf(18), color: PLUM },
  songInput: { fontFamily: FontFamily.ja, fontSize: sf(12), color: INK, borderBottomWidth: 1.4, borderColor: '#c9a9c0', padding: 0, paddingBottom: 2, marginTop: 3 },

  // checks
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 },
  checkBox: { width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: INK, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  checkBoxOn: { backgroundColor: Colors.sageDeep },
  checkMark: { color: '#fff', fontSize: sf(11), fontFamily: FontFamily.uiSemiBold },
  checkLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: INK },
});
