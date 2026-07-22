import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { INK, PhotoBox } from '@/components/templates/primitives';
import { useTemplateCtx } from '@/store/templateData';
import { getMembers, memberColor, ShipMember, updateShip, useShip } from '@/store/ships';
import { newId } from '@/db/client';
import { Colors, FontFamily, sf } from '@/constants/theme';

// ─── Static config (ported from the Canvas design) ────────────────────────────

const CHARTS = [
  { id: 'love', title: 'How it happens', t: 'Love at first sight', b: 'Falls in love slowly', l: 'Unintentional', r: 'Tries to get closer' },
  { id: 'aff', title: 'Showing affection', t: 'Takes initiative', b: "Doesn't initiate", l: 'Verbal', r: 'Non-verbal' },
  { id: 'conflict', title: 'Handling conflict', t: 'Starts arguments', b: 'Very laid-back', l: 'Quickly forgives', r: 'Takes some time' },
  { id: 'jeal', title: 'Dealing with jealousy', t: 'Easily jealous', b: 'Never jealous', l: 'Needs space', r: 'Needs attention' },
  { id: 'attitude', title: 'Relationship attitude', t: 'Very dedicated', b: 'Casual', l: 'PDA', r: 'Reserved' },
  { id: 'attach', title: 'Attachment', t: 'Over-protective', b: 'Relaxed', l: 'Separation anx.', r: 'Independent' },
];
const WHO = [
  'first to confess feelings', 'first to apologize after a fight', 'the more charismatic one', "best caregiver when someone's sick",
  'does the cooking', 'does the housework', 'does most of the talking', 'the overprotective one',
  'the designated driver', 'has the best penmanship', 'most relationship experience', 'notices subtle changes in the others',
  'the one who proposes', 'would die protecting the others',
];

type Roster = (ShipMember & { color: string })[];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

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

// ─── Alignment chart (2-D, drag the nearest member's dot) ─────────────────────

function ChartCell({ chart, roster, valueOf, onChange, editing }: {
  chart: typeof CHARTS[number]; roster: Roster;
  valueOf: (mId: string) => { x: number; y: number }; onChange: (mId: string, xy: { x: number; y: number }) => void; editing: boolean;
}) {
  const ref = useRef<View>(null);
  const geo = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const active = useRef<string | null>(null);

  const nearest = (x: number, y: number) => {
    let best: string | null = null, bd = Infinity;
    roster.forEach((m) => { const p = valueOf(m.id); const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = m.id; } });
    return best;
  };
  const responder = editing && roster.length ? {
    onStartShouldSetResponderCapture: () => true,
    onMoveShouldSetResponderCapture: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: any) => {
      const { pageX, pageY } = e.nativeEvent;
      (ref.current as any)?.measureInWindow?.((x: number, y: number, w: number, h: number) => {
        geo.current = { x, y, w, h };
        if (w > 0 && h > 0) {
          const nx = clamp01((pageX - x) / w), ny = clamp01((pageY - y) / h);
          active.current = nearest(nx, ny);
          if (active.current) onChange(active.current, { x: nx, y: ny });
        }
      });
    },
    onResponderMove: (e: any) => {
      const { x, y, w, h } = geo.current;
      if (w > 0 && h > 0 && active.current) {
        onChange(active.current, { x: clamp01((e.nativeEvent.pageX - x) / w), y: clamp01((e.nativeEvent.pageY - y) / h) });
      }
    },
    onResponderRelease: () => { active.current = null; },
  } : {};

  return (
    <View style={ds.chartCell}>
      <Text style={ds.chartTitle}>{chart.title}</Text>
      <View ref={ref} style={ds.chartBox} {...responder}>
        <View style={ds.chartVLine} />
        <View style={ds.chartHLine} />
        <Text style={[ds.axis, ds.axisTop]} numberOfLines={1}>{chart.t}</Text>
        <Text style={[ds.axis, ds.axisBottom]} numberOfLines={1}>{chart.b}</Text>
        <Text style={[ds.axis, ds.axisLeft]} numberOfLines={1}>{chart.l}</Text>
        <Text style={[ds.axis, ds.axisRight]} numberOfLines={1}>{chart.r}</Text>
        {roster.map((m) => {
          const p = valueOf(m.id);
          return <View key={m.id} style={[ds.dot, { left: `${p.x * 100}%` as any, top: `${p.y * 100}%` as any, backgroundColor: m.color }]} />;
        })}
      </View>
    </View>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function PolyDynamicsContent({ editing, shipId }: { editing?: boolean; shipId?: string }) {
  const e = !!editing;
  const ship = useShip(shipId);
  const members = getMembers(ship);
  const roster: Roster = useMemo(() => members.map((m, i) => ({ ...m, color: memberColor(i) })), [members]);

  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const tBg = customBg ? { backgroundColor: 'transparent' } : null;

  const [quotes, setQuotes] = useJsonState<Record<string, string>>('quotes', {});
  const [diffs, setDiffs] = useJsonState<Record<string, { h: string; ag: string }>>('diffs', {});
  const [grids, setGrids] = useJsonState<Record<string, Record<string, { x: number; y: number }>>>('grids', {});
  const [who, setWho] = useJsonState<Record<string, Record<string, boolean>>>('who', {});

  function patchMembers(next: ShipMember[]) { if (shipId) updateShip(shipId, { members: next }); }
  function addMember() { patchMembers([...members, { id: newId(), name: '' }]); }
  function removeMember(id: string) {
    patchMembers(members.filter((m) => m.id !== id));
    // prune references
    const nq = { ...quotes }; delete nq[id]; setQuotes(nq);
    const ng: typeof grids = {}; Object.keys(grids).forEach((c) => { const row = { ...grids[c] }; delete row[id]; ng[c] = row; }); setGrids(ng);
    const nw: typeof who = {}; Object.keys(who).forEach((r) => { const row = { ...who[r] }; delete row[id]; nw[r] = row; }); setWho(nw);
    const nd: typeof diffs = {}; Object.keys(diffs).forEach((k) => { if (!k.split('>').includes(id)) nd[k] = diffs[k]; }); setDiffs(nd);
  }
  function setName(id: string, v: string) { patchMembers(members.map((m) => (m.id === id ? { ...m, name: v } : m))); }
  const setQuote = (id: string, v: string) => setQuotes({ ...quotes, [id]: v });

  const gridOf = (c: string, m: string) => grids[c]?.[m] ?? { x: 0.5, y: 0.5 };
  const setGridVal = (c: string, m: string, xy: { x: number; y: number }) => setGrids({ ...grids, [c]: { ...grids[c], [m]: xy } });
  const setDiff = (k: string, f: 'h' | 'ag', v: string) => {
    const cur = diffs[k] ?? { h: '', ag: '' };
    setDiffs({ ...diffs, [k]: { ...cur, [f]: v } });
  };
  const toggleWho = (ri: number, id: string) => setWho({ ...who, [ri]: { ...who[ri], [id]: !who[ri]?.[id] } });

  return (
    <View style={[ds.card, tBg]}>
      <View style={ds.headerWrap}>
        <View style={ds.titlePill}><Text style={ds.titlePillText}>POLYCULE DYNAMICS</Text></View>
        <Text style={ds.subtitle}>place everyone on the charts &amp; tick who's who ♡</Text>
      </View>

      {/* cast */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ds.castRow} keyboardShouldPersistTaps="handled">
        {roster.map((m) => (
          <View key={m.id} style={ds.castCard}>
            <View>
              <PhotoBox width={120} height={96} editing={e} uri={m.photoUri}
                onUriChange={e ? (u) => patchMembers(members.map((x) => (x.id === m.id ? { ...x, photoUri: u } : x))) : undefined}
                style={ds.castPhoto} />
              <View style={[ds.colorDot, { backgroundColor: m.color }]} />
              {e && roster.length > 2 && (
                <Pressable style={ds.removeDot} onPress={() => removeMember(m.id)} hitSlop={6}><Text style={ds.removeX}>✕</Text></Pressable>
              )}
            </View>
            {e ? (
              <TextInput value={m.name} onChangeText={(v) => setName(m.id, v)} placeholder="name" placeholderTextColor={Colors.ink3} style={ds.castName} />
            ) : (
              <Text style={ds.castName}>{m.name || '—'}</Text>
            )}
            <View style={[ds.quoteBubble, tBg]}>
              {e ? (
                <TextInput value={quotes[m.id] ?? ''} onChangeText={(v) => setQuote(m.id, v)} placeholder="a quote…" placeholderTextColor={Colors.ink3} style={ds.quoteText} />
              ) : (
                <Text style={ds.quoteText}>{quotes[m.id] || 'a quote…'}</Text>
              )}
            </View>
          </View>
        ))}
        {e && (
          <Pressable style={ds.addCard} onPress={addMember}><Text style={ds.addPlus}>＋</Text></Pressable>
        )}
      </ScrollView>

      {/* differences */}
      {roster.length >= 2 && (
        <View style={[ds.diffBox, tBg]}>
          <Text style={ds.diffLabel}>THE DIFFERENCES</Text>
          {roster.slice(0, -1).map((a, i) => {
            const b = roster[i + 1];
            const k = `${a.id}>${b.id}`;
            const d = diffs[k] ?? { h: '', ag: '' };
            return (
              <View key={k} style={ds.diffRow}>
                <Text style={ds.diffPair} numberOfLines={1}>{(a.name || '?')} ↔ {(b.name || '?')}</Text>
                <Text style={ds.diffKey}>height</Text>
                <TextInput value={d.h} editable={e} onChangeText={(v) => setDiff(k, 'h', v)} placeholder="—" placeholderTextColor={Colors.ink3} style={ds.diffInput} />
                <Text style={ds.diffKey}>age</Text>
                <TextInput value={d.ag} editable={e} onChangeText={(v) => setDiff(k, 'ag', v)} placeholder="—" placeholderTextColor={Colors.ink3} style={ds.diffInput} />
              </View>
            );
          })}
        </View>
      )}

      {/* charts */}
      <View style={ds.section}>
        <Text style={ds.sectionTitle}>Where everyone lands</Text>
        <Text style={ds.sectionHint}>drag each dot on every chart</Text>
      </View>
      {/* legend */}
      <View style={ds.legend}>
        {roster.map((m) => (
          <View key={m.id} style={ds.legendItem}>
            <View style={[ds.legendDot, { backgroundColor: m.color }]} />
            <Text style={ds.legendName}>{m.name || '—'}</Text>
          </View>
        ))}
      </View>
      <View style={ds.chartGrid}>
        {CHARTS.map((c) => (
          <ChartCell key={c.id} chart={c} roster={roster} editing={e}
            valueOf={(m) => gridOf(c.id, m)} onChange={(m, xy) => setGridVal(c.id, m, xy)} />
        ))}
      </View>

      {/* who's the one to */}
      <View style={ds.section}>
        <Text style={ds.sectionTitle}>Who's the one to…</Text>
        <Text style={ds.sectionHint}>tick everyone it applies to</Text>
      </View>
      <View style={{ marginTop: 8, gap: 8 }}>
        {WHO.map((label, ri) => (
          <View key={ri} style={ds.whoRow}>
            <Text style={ds.whoLabel}>{label}</Text>
            <View style={ds.whoChecks}>
              {roster.map((m) => {
                const on = !!who[ri]?.[m.id];
                return (
                  <Pressable key={m.id} onPress={e ? () => toggleWho(ri, m.id) : undefined} disabled={!e}
                    style={[ds.whoBox, { borderColor: on ? m.color : INK, backgroundColor: on ? m.color : '#fff' }]}>
                    {on && <Text style={ds.whoCheck}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function TemplatePolyDynamics() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="poly-dynamics" shipId={shipId}>
      <PolyDynamicsContent editing shipId={shipId} />
    </TemplateScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PLUM = Colors.plum;
const ds = StyleSheet.create({
  card: { backgroundColor: Colors.vellum, borderWidth: 2, borderColor: INK, borderRadius: 20, padding: 18 },
  headerWrap: { alignItems: 'center', marginBottom: 14 },
  titlePill: { backgroundColor: PLUM, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 18 },
  titlePillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(17), color: '#fff', letterSpacing: 0.5 },
  subtitle: { fontFamily: FontFamily.script, fontSize: sf(16), color: PLUM, marginTop: 5, textAlign: 'center' },

  // cast
  castRow: { gap: 9, paddingTop: 8, paddingBottom: 4, paddingRight: 8 },
  castCard: { width: 120, gap: 5 },
  castPhoto: { borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: '#e9d8cb' },
  colorDot: { position: 'absolute', top: 4, left: 4, width: 18, height: 18, borderRadius: 999, borderWidth: 1.5, borderColor: INK },
  removeDot: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  removeX: { fontSize: sf(11), color: '#b04a4a', fontFamily: FontFamily.ui, lineHeight: 14 },
  castName: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: INK, borderBottomWidth: 1.4, borderColor: INK, paddingBottom: 2, padding: 0 },
  quoteBubble: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: INK, borderRadius: 12, borderBottomLeftRadius: 3, paddingVertical: 4, paddingHorizontal: 8 },
  quoteText: { fontFamily: FontFamily.script, fontSize: sf(13), color: Colors.ink2, padding: 0 },
  addCard: { width: 34, minHeight: 96, borderWidth: 1.5, borderColor: '#c9a9c0', borderStyle: 'dashed', borderRadius: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: 8 },
  addPlus: { fontSize: sf(18), color: '#8b6fc4', fontFamily: FontFamily.ui },

  // diffs
  diffBox: { backgroundColor: '#fffdfb', borderWidth: 1.5, borderColor: '#e3cdbe', borderRadius: 12, padding: 12, marginTop: 12, gap: 7 },
  diffLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(8), letterSpacing: 0.5, textTransform: 'uppercase', color: PLUM },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  diffPair: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: INK, minWidth: 92 },
  diffKey: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(8), letterSpacing: 0.5, textTransform: 'uppercase', color: '#9a7e92' },
  diffInput: { minWidth: 44, borderBottomWidth: 1.4, borderColor: INK, fontFamily: FontFamily.ja, fontSize: sf(11), color: INK, textAlign: 'center', padding: 0, paddingBottom: 2 },

  // section
  section: { alignItems: 'center', marginTop: 24 },
  sectionTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), textTransform: 'uppercase', color: PLUM },
  sectionHint: { fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3 },

  // legend
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 999, borderWidth: 1.4, borderColor: INK },
  legendName: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink2 },

  // charts
  chartGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10, justifyContent: 'space-between' },
  chartCell: { width: '47%' },
  chartTitle: { textAlign: 'center', fontFamily: FontFamily.uiSemiBold, fontSize: sf(10), textTransform: 'uppercase', color: PLUM, marginBottom: 4 },
  chartBox: { width: '100%', aspectRatio: 1, backgroundColor: '#fffdfb', borderWidth: 1.5, borderColor: INK, borderRadius: 8 },
  chartVLine: { position: 'absolute', left: '50%', top: 6, bottom: 6, width: 1, backgroundColor: '#d9c4b6' },
  chartHLine: { position: 'absolute', top: '50%', left: 6, right: 6, height: 1, backgroundColor: '#d9c4b6' },
  axis: { position: 'absolute', fontFamily: FontFamily.ui, fontSize: sf(7.5), color: Colors.ink2 },
  axisTop: { top: 3, alignSelf: 'center', left: 0, right: 0, textAlign: 'center' },
  axisBottom: { bottom: 3, alignSelf: 'center', left: 0, right: 0, textAlign: 'center' },
  axisLeft: { left: 2, top: '46%' },
  axisRight: { right: 2, top: '46%' },
  dot: { position: 'absolute', width: 13, height: 13, marginLeft: -6.5, marginTop: -6.5, borderRadius: 999, borderWidth: 1.5, borderColor: INK },

  // who
  whoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whoLabel: { flex: 1, fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: INK },
  whoChecks: { flexDirection: 'row', gap: 5, flexShrink: 0 },
  whoBox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  whoCheck: { color: '#fff', fontSize: sf(11), fontFamily: FontFamily.uiSemiBold },
});
