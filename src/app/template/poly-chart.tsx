import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { AttrSlider, INK, PhotoBox } from '@/components/templates/primitives';
import { useTemplateCtx } from '@/store/templateData';
import { getMembers, memberColor, ShipMember, updateShip, useShip } from '@/store/ships';
import { newId } from '@/db/client';
import { Colors, FontFamily, Radius, SheetColumn, sf } from '@/constants/theme';

// ─── Static config (ported from the Canvas design) ────────────────────────────

const BOND_TYPES: Record<string, string> = {
  romantic: '#d77a8d',
  queerplatonic: '#8b6fc4',
  platonic: '#6e8762',
  unlabeled: '#b6a7af',
};
const BOND_TYPE_ORDER = ['romantic', 'queerplatonic', 'platonic', 'unlabeled'];
const CLOSENESS: Record<string, string> = { closest: 'closest', less: 'less close', complicated: "it's complicated" };
const CLOSE_ORDER = ['closest', 'less', 'complicated'];

const SPECTRA = [
  { id: 'age', l: 'Youngest', r: 'Oldest' },
  { id: 'height', l: 'Shortest', r: 'Tallest' },
  { id: 'aff', l: 'Bashful', r: 'Affectionate' },
  { id: 'play', l: 'Serious', r: 'Playful' },
  { id: 'sleep', l: 'Sleepy', r: 'Night owl' },
  { id: 'dates', l: 'Casual', r: 'Romantic' },
];
const GRIDS = [
  { id: 'moral', t: 'lawful', b: 'chaotic', l: 'good', r: 'evil' },
  { id: 'temper', t: 'agreeable', b: 'stubborn', l: 'rational', r: 'emotional' },
];
const LOVE_AXES = [
  { k: 'acts', label: 'acts of service' },
  { k: 'quality', label: 'quality time' },
  { k: 'physical', label: 'physical' },
  { k: 'verbal', label: 'verbal' },
  { k: 'gifts', label: 'gifts' },
];
const PREFS = [
  { id: 'date', label: 'Fav date spot' },
  { id: 'blush', label: 'Make them blush' },
  { id: 'ily', label: 'They say "I love you"' },
];

type Roster = (ShipMember & { color: string })[];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pairKey = (a: string, b: string) => [a, b].sort().join('|');

// ─── JSON-blob persistence helpers over the template ctx ──────────────────────

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

// ─── Roster strip ─────────────────────────────────────────────────────────────

function RosterStrip({ roster, editing, onAdd, onRemove, onField }: {
  roster: Roster; editing: boolean;
  onAdd: () => void; onRemove: (id: string) => void;
  onField: (id: string, key: keyof ShipMember, v: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ps.rosterRow}>
      {roster.map((m) => (
        <View key={m.id} style={ps.memberCard}>
          <View>
            <PhotoBox width={118} height={120} editing={editing} uri={m.photoUri}
              onUriChange={editing ? (u) => onField(m.id, 'photoUri', u) : undefined} style={ps.cardPhoto} />
            <View style={[ps.colorDot, { backgroundColor: m.color }]} />
            {editing && roster.length > 2 && (
              <Pressable style={ps.removeDot} onPress={() => onRemove(m.id)} hitSlop={6}>
                <Text style={ps.removeX}>✕</Text>
              </Pressable>
            )}
          </View>
          <Field label="Name" value={m.name} editing={editing} accent onChange={(v) => onField(m.id, 'name', v)} />
          <Field label="Pronouns" value={m.pronouns ?? ''} editing={editing} onChange={(v) => onField(m.id, 'pronouns', v)} />
          <Field label="Sexuality" value={m.sex ?? ''} editing={editing} onChange={(v) => onField(m.id, 'sex', v)} />
          <Field label="One word" value={m.word ?? ''} editing={editing} accent onChange={(v) => onField(m.id, 'word', v)} />
        </View>
      ))}
      {editing && (
        <Pressable style={ps.addCard} onPress={onAdd}>
          <Text style={ps.addPlus}>＋</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Field({ label, value, editing, onChange, accent }: {
  label: string; value: string; editing: boolean; onChange: (v: string) => void; accent?: boolean;
}) {
  return (
    <View style={ps.field}>
      <Text style={ps.fieldLabel}>{label}</Text>
      {editing ? (
        <TextInput value={value} onChangeText={onChange} placeholder="—" placeholderTextColor={Colors.ink3}
          style={[ps.fieldInput, accent && { color: Colors.plum }]} />
      ) : (
        <Text style={[ps.fieldVal, accent && { color: Colors.plum }]}>{value || '—'}</Text>
      )}
    </View>
  );
}

// ─── Spectra (1-D, drag the track to move the nearest member's dot) ────────────

function SpectrumRow({ sp, roster, valueOf, onChange, editing }: {
  sp: typeof SPECTRA[number]; roster: Roster;
  valueOf: (mId: string) => number; onChange: (mId: string, v: number) => void; editing: boolean;
}) {
  const trackRef = useRef<View>(null);
  const geo = useRef({ x: 0, w: 0 });
  const active = useRef<string | null>(null);

  const nearest = (v: number) => {
    let best: string | null = null, bd = Infinity;
    roster.forEach((m) => { const d = Math.abs(valueOf(m.id) - v); if (d < bd) { bd = d; best = m.id; } });
    return best;
  };
  const responder = editing && roster.length ? {
    onStartShouldSetResponderCapture: () => true,
    onMoveShouldSetResponderCapture: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: any) => {
      const px = e.nativeEvent.pageX;
      (trackRef.current as any)?.measureInWindow?.((x: number, _y: number, w: number) => {
        geo.current = { x, w };
        if (w > 0) { const v = clamp01((px - x) / w); active.current = nearest(v); if (active.current) onChange(active.current, v); }
      });
    },
    onResponderMove: (e: any) => {
      const { x, w } = geo.current;
      if (w > 0 && active.current) onChange(active.current, clamp01((e.nativeEvent.pageX - x) / w));
    },
    onResponderRelease: () => { active.current = null; },
  } : {};

  return (
    <View style={ps.specRow}>
      <Text style={ps.specEnd}>{sp.l}</Text>
      <View ref={trackRef} style={ps.specTrack} {...responder}>
        <View style={ps.specLine} />
        {roster.map((m) => (
          <View key={m.id} style={[ps.specDot, { left: `${valueOf(m.id) * 100}%` as any, backgroundColor: m.color }]} />
        ))}
      </View>
      <Text style={ps.specEnd}>{sp.r}</Text>
    </View>
  );
}

// ─── Relationship map (SVG lines + tappable nodes + bond editor) ──────────────

function RelationshipMap({ roster, bonds, onLink, onEditBond, pick, editing }: {
  roster: Roster; bonds: Record<string, { type: string; close: string }>;
  onLink: (id: string) => void; onEditBond: (key: string) => void; pick: string | null; editing: boolean;
}) {
  const [w, setW] = useState(320);
  const H = Math.round(w * 0.7);
  const cx = w / 2, cy = H / 2, r = Math.min(w, H) / 2 - 38;
  const n = roster.length;
  const pos: Record<string, { x: number; y: number }> = {};
  roster.forEach((m, i) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n);
    pos[m.id] = n === 1 ? { x: cx, y: cy } : { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  });

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[ps.mapBox, { height: H }]}>
      <Svg width="100%" height={H} style={StyleSheet.absoluteFill}>
        {Object.keys(bonds).map((key) => {
          const [a, b] = key.split('|');
          if (!pos[a] || !pos[b]) return null;
          const bd = bonds[key];
          const sw = bd.close === 'closest' ? 8 : bd.close === 'complicated' ? 3 : 2.5;
          return (
            <Line key={key} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y}
              stroke={BOND_TYPES[bd.type]} strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={bd.close === 'complicated' ? '7,6' : undefined} />
          );
        })}
        {roster.map((m) => (
          <Circle key={m.id} cx={pos[m.id].x} cy={pos[m.id].y} r={23}
            fill={Colors.paperDeep} stroke={m.color} strokeWidth={pick === m.id ? 4 : 2.5} />
        ))}
        {roster.map((m) => (
          <SvgText key={m.id} x={pos[m.id].x} y={pos[m.id].y + 4} fontSize={11} fontFamily={FontFamily.uiSemiBold}
            fill={INK} textAnchor="middle">{(m.name || '?').slice(0, 4)}</SvgText>
        ))}
      </Svg>
      {/* tap targets for nodes + bond lines (overlaid, since SVG press is finicky) */}
      {editing && roster.map((m) => (
        <Pressable key={m.id} onPress={() => onLink(m.id)}
          style={[ps.mapNodeHit, { left: pos[m.id].x - 23, top: pos[m.id].y - 23 }]} />
      ))}
      {editing && Object.keys(bonds).map((key) => {
        const [a, b] = key.split('|');
        if (!pos[a] || !pos[b]) return null;
        const mx = (pos[a].x + pos[b].x) / 2, my = (pos[a].y + pos[b].y) / 2;
        return <Pressable key={key} onPress={() => onEditBond(key)} style={[ps.mapLineHit, { left: mx - 16, top: my - 16 }]} />;
      })}
    </View>
  );
}

// ─── Love-language radar (per selected member) ────────────────────────────────

function MemberRadar({ roster, sel, setSel, loveOf, setLove, editing }: {
  roster: Roster; sel: string | null; setSel: (id: string) => void;
  loveOf: (id: string) => Record<string, number>; setLove: (id: string, k: string, v: number) => void; editing: boolean;
}) {
  const C = 130, R = 92;
  const verts = LOVE_AXES.map((_, i) => {
    const ang = (-90 + 72 * i) * Math.PI / 180;
    return { x: C + R * Math.cos(ang), y: 122 + R * Math.sin(ang) };
  });
  const active = sel && roster.some((m) => m.id === sel) ? sel : roster[0]?.id ?? null;
  if (!active) return null;
  const lv = loveOf(active);
  const col = roster.find((m) => m.id === active)?.color ?? Colors.plum;
  const poly = (scale: number) => verts.map((v) => `${C + (v.x - C) * scale},${122 + (v.y - 122) * scale}`).join(' ');
  const valPoly = LOVE_AXES.map((a, i) => `${C + (verts[i].x - C) * lv[a.k]},${122 + (verts[i].y - 122) * lv[a.k]}`).join(' ');

  return (
    <View>
      <View style={ps.chipRow}>
        {roster.map((m) => {
          const on = m.id === active;
          return (
            <Pressable key={m.id} onPress={() => setSel(m.id)}
              style={[ps.chip, { borderColor: m.color, backgroundColor: on ? m.color : Colors.paperDeep }]}>
              <Text style={[ps.chipText, { color: on ? '#fff' : Colors.ink2 }]}>{m.name || '—'}</Text>
            </Pressable>
          );
        })}
      </View>
      <Svg width="100%" height={210} viewBox="0 0 260 210">
        <Polygon points={poly(1)} fill="none" stroke="#e0cdc0" strokeWidth={1.2} />
        <Polygon points={poly(0.5)} fill="none" stroke="#eadccf" strokeWidth={1} />
        {LOVE_AXES.map((a, i) => (
          <Line key={a.k} x1={C} y1={122} x2={verts[i].x} y2={verts[i].y} stroke="#e0cdc0" strokeWidth={1} />
        ))}
        <Polygon points={valPoly} fill={col + '33'} stroke={col} strokeWidth={2} />
        {LOVE_AXES.map((a, i) => {
          const lx = C + (verts[i].x - C) * 1.18, ly = 122 + (verts[i].y - 122) * 1.18;
          return (
            <SvgText key={a.k} x={lx} y={ly + 3} fontSize={9} fontFamily={FontFamily.ui} fill={Colors.ink2}
              textAnchor={lx < C - 10 ? 'end' : lx > C + 10 ? 'start' : 'middle'}>{a.label}</SvgText>
          );
        })}
      </Svg>
      {editing && (
        <View style={ps.radarSliders}>
          {LOVE_AXES.map((a) => (
            <AttrSlider key={a.k} label={a.label} value={lv[a.k]} onValueChange={(v) => setLove(active, a.k, v)} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Alignment grid (2-D, drag the nearest member's dot) ──────────────────────

function AlignGrid({ g, roster, valueOf, onChange, editing }: {
  g: typeof GRIDS[number]; roster: Roster;
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
    <View style={ps.gridWrap}>
      <View ref={ref} style={ps.gridBox} {...responder}>
        <View style={ps.gridVLine} />
        <View style={ps.gridHLine} />
        <Text style={[ps.gridAxis, ps.gridTop]}>{g.t}</Text>
        <Text style={[ps.gridAxis, ps.gridBottom]}>{g.b}</Text>
        <Text style={[ps.gridAxis, ps.gridLeft]}>{g.l}</Text>
        <Text style={[ps.gridAxis, ps.gridRight]}>{g.r}</Text>
        {roster.map((m) => {
          const p = valueOf(m.id);
          return <View key={m.id} style={[ps.gridDot, { left: `${p.x * 100}%` as any, top: `${p.y * 100}%` as any, backgroundColor: m.color }]} />;
        })}
      </View>
    </View>
  );
}

// ─── Member legend ────────────────────────────────────────────────────────────

function Legend({ roster }: { roster: Roster }) {
  return (
    <View style={ps.legend}>
      {roster.map((m) => (
        <View key={m.id} style={ps.legendItem}>
          <View style={[ps.legendDot, { backgroundColor: m.color }]} />
          <Text style={ps.legendName}>{m.name || '—'}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={ps.section}>
      <Text style={ps.sectionTitle}>{title}</Text>
      {hint ? <Text style={ps.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function PolyChartContent({ editing, shipId }: { editing?: boolean; shipId?: string }) {
  const e = !!editing;
  const ship = useShip(shipId);
  const members = getMembers(ship);
  const roster: Roster = useMemo(() => members.map((m, i) => ({ ...m, color: memberColor(i) })), [members]);

  const [spec, setSpec] = useJsonState<Record<string, Record<string, number>>>('spec', {});
  const [grid, setGrid] = useJsonState<Record<string, Record<string, { x: number; y: number }>>>('grid', {});
  const [love, setLove] = useJsonState<Record<string, Record<string, number>>>('love', {});
  const [prefVals, setPrefVals] = useJsonState<Record<string, Record<string, string>>>('prefVals', {});
  const [bonds, setBonds] = useJsonState<Record<string, { type: string; close: string }>>('bonds', {});

  const ctx = useTemplateCtx();
  const [music, setMusic] = useState(() => ctx.get('music', ''));

  const [sel, setSel] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [bondEdit, setBondEdit] = useState<string | null>(null);

  function patchMembers(next: ShipMember[]) { if (shipId) updateShip(shipId, { members: next }); }
  function addMember() { patchMembers([...members, { id: newId(), name: '', pronouns: '', sex: '', word: '' }]); }
  function removeMember(id: string) {
    patchMembers(members.filter((m) => m.id !== id));
    const nb: typeof bonds = {};
    Object.keys(bonds).forEach((k) => { if (!k.split('|').includes(id)) nb[k] = bonds[k]; });
    setBonds(nb);
  }
  function setField(id: string, key: keyof ShipMember, v: string) {
    patchMembers(members.map((m) => (m.id === id ? { ...m, [key]: v } : m)));
  }

  const specOf = (sp: string, m: string) => spec[sp]?.[m] ?? 0.5;
  const setSpecVal = (sp: string, m: string, v: number) => setSpec({ ...spec, [sp]: { ...spec[sp], [m]: v } });
  const gridOf = (g: string, m: string) => grid[g]?.[m] ?? { x: 0.5, y: 0.5 };
  const setGridVal = (g: string, m: string, xy: { x: number; y: number }) => setGrid({ ...grid, [g]: { ...grid[g], [m]: xy } });
  const loveOf = (m: string) => ({ acts: 0.5, quality: 0.5, physical: 0.5, verbal: 0.5, gifts: 0.5, ...(love[m] || {}) });
  const setLoveVal = (m: string, k: string, v: number) => setLove({ ...love, [m]: { ...loveOf(m), [k]: v } });
  const prefOf = (p: string, m: string) => prefVals[p]?.[m] ?? '';
  const setPrefVal = (p: string, m: string, v: string) => setPrefVals({ ...prefVals, [p]: { ...prefVals[p], [m]: v } });

  function onLink(id: string) {
    if (!pick) { setPick(id); return; }
    if (pick === id) { setPick(null); return; }
    const key = pairKey(pick, id);
    if (!bonds[key]) setBonds({ ...bonds, [key]: { type: 'romantic', close: 'less' } });
    setPick(null);
    setBondEdit(key);
  }
  const setBondType = (key: string, t: string) => setBonds({ ...bonds, [key]: { ...bonds[key], type: t } });
  const setBondClose = (key: string, c: string) => setBonds({ ...bonds, [key]: { ...bonds[key], close: c } });
  function removeBond(key: string) { const nb = { ...bonds }; delete nb[key]; setBonds(nb); setBondEdit(null); }

  const editBond = bondEdit ? bonds[bondEdit] : null;
  const bondNames = bondEdit
    ? bondEdit.split('|').map((id) => roster.find((m) => m.id === id)?.name || '?').join('  &  ')
    : '';

  return (
    <View style={ps.card}>
      <View style={ps.headerWrap}>
        <View style={ps.titlePill}><Text style={ps.titlePillText}>POLY SHIP CHART</Text></View>
        <Text style={ps.subtitle}>for the whole polycule ♡  ·  tap anything to edit</Text>
      </View>

      {/* top bar */}
      <View style={ps.topBar}>
        <View style={ps.countPill}>
          <Text style={ps.countText}>♡ {roster.length} character{roster.length === 1 ? '' : 's'}</Text>
        </View>
        {e && (
          <Pressable style={ps.addBtn} onPress={addMember}>
            <Text style={ps.addBtnText}>＋ add member</Text>
          </Pressable>
        )}
      </View>

      {/* ship + media */}
      <View style={ps.shipRow}>
        <Field label="Ship" value={ship?.shipName ?? ''} editing={e} accent onChange={(v) => shipId && updateShip(shipId, { shipName: v })} />
        <Field label="Media" value={ship?.fandom ?? ''} editing={e} onChange={(v) => shipId && updateShip(shipId, { fandom: v })} />
      </View>

      {/* roster */}
      <View style={ps.block}>
        <RosterStrip roster={roster} editing={e} onAdd={addMember} onRemove={removeMember} onField={setField} />
      </View>

      {roster.length === 0 && (
        <Text style={ps.emptyHint}>add members to start building your polycule ♡</Text>
      )}

      {roster.length > 0 && (
        <>
          {/* spectra */}
          <Section title="Group dynamics" hint="drag along each line" />
          <View style={ps.block}>
            {SPECTRA.map((sp) => (
              <SpectrumRow key={sp.id} sp={sp} roster={roster} editing={e}
                valueOf={(m) => specOf(sp.id, m)} onChange={(m, v) => setSpecVal(sp.id, m, v)} />
            ))}
            <Legend roster={roster} />
          </View>

          {/* relationship map */}
          <Section title="Individual relationships" hint="tap a member, then another, to link them" />
          <View style={ps.block}>
            <RelationshipMap roster={roster} bonds={bonds} pick={pick} editing={e}
              onLink={onLink} onEditBond={(k) => setBondEdit(k)} />
            <View style={ps.mapLegend}>
              {BOND_TYPE_ORDER.map((t) => (
                <View key={t} style={ps.legendItem}>
                  <View style={[ps.bondSwatch, { backgroundColor: BOND_TYPES[t] }]} />
                  <Text style={ps.legendName}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* radar */}
          <Section title="Love languages" hint="pick who" />
          <View style={ps.block}>
            <MemberRadar roster={roster} sel={sel} setSel={setSel} loveOf={loveOf} setLove={setLoveVal} editing={e} />
          </View>

          {/* grids */}
          <Section title="Where they land" />
          <View style={[ps.block, ps.gridRow]}>
            {GRIDS.map((g) => (
              <AlignGrid key={g.id} g={g} roster={roster} editing={e}
                valueOf={(m) => gridOf(g.id, m)} onChange={(m, xy) => setGridVal(g.id, m, xy)} />
            ))}
          </View>

          {/* prefs */}
          <Section title="Personal preferences" />
          <View style={[ps.block, ps.prefRow]}>
            {PREFS.map((p) => (
              <View key={p.id} style={ps.prefCol}>
                <Text style={ps.prefLabel}>{p.label}</Text>
                {roster.map((m) => (
                  <View key={m.id} style={ps.prefItem}>
                    <View style={[ps.legendDot, { backgroundColor: m.color }]} />
                    {e ? (
                      <TextInput value={prefOf(p.id, m.id)} onChangeText={(v) => setPrefVal(p.id, m.id, v)}
                        placeholder="—" placeholderTextColor={Colors.ink3} style={ps.prefInput} />
                    ) : (
                      <Text style={ps.prefVal}>{prefOf(p.id, m.id) || '—'}</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </>
      )}

      {/* music */}
      <View style={ps.musicRow}>
        <View style={ps.musicIcon}><Text style={ps.musicNote}>♪</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={ps.fieldLabel}>The polycule's song</Text>
          {e ? (
            <TextInput value={music} onChangeText={(v) => { setMusic(v); ctx.set('music', v); }}
              placeholder="add a track…" placeholderTextColor={Colors.ink3} style={ps.musicInput} />
          ) : (
            <Text style={ps.musicVal}>{music || '—'}</Text>
          )}
        </View>
      </View>

      {/* bond editor */}
      <Modal visible={!!bondEdit} transparent animationType="fade" onRequestClose={() => setBondEdit(null)}>
        <Pressable style={ps.modalOverlay} onPress={() => setBondEdit(null)} />
        <View style={ps.modalSheet}>
         <View style={[ps.modalCard, SheetColumn]}>
          <Text style={ps.modalTitle}>{bondNames}</Text>
          <View style={ps.modalChips}>
            {BOND_TYPE_ORDER.map((t) => {
              const on = editBond?.type === t;
              return (
                <Pressable key={t} onPress={() => bondEdit && setBondType(bondEdit, t)}
                  style={[ps.modalChip, { borderColor: BOND_TYPES[t], backgroundColor: on ? BOND_TYPES[t] : Colors.paperDeep }]}>
                  <Text style={[ps.modalChipText, { color: on ? '#fff' : Colors.ink2 }]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={ps.modalCloseRow}>
            {CLOSE_ORDER.map((c) => {
              const on = editBond?.close === c;
              return (
                <Pressable key={c} onPress={() => bondEdit && setBondClose(bondEdit, c)}
                  style={[ps.modalCloseBtn, on && { backgroundColor: Colors.plum }]}>
                  <Text style={[ps.modalCloseText, on && { color: '#fff' }]}>{CLOSENESS[c]}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={ps.modalActions}>
            <Pressable onPress={() => bondEdit && removeBond(bondEdit)}><Text style={ps.modalRemove}>✕ remove bond</Text></Pressable>
            <Pressable onPress={() => setBondEdit(null)}><Text style={ps.modalDone}>done</Text></Pressable>
          </View>
         </View>
        </View>
      </Modal>
    </View>
  );
}

export default function TemplatePolyChart() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="poly-chart" shipId={shipId}>
      <PolyChartContent editing shipId={shipId} />
    </TemplateScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PLUM = Colors.plum;
const ps = StyleSheet.create({
  card: { backgroundColor: Colors.vellum, borderWidth: 2, borderColor: INK, borderRadius: 20, padding: 18 },
  headerWrap: { alignItems: 'center' },
  titlePill: { backgroundColor: PLUM, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 20 },
  titlePillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(17), color: '#fff', letterSpacing: 0.5 },
  subtitle: { fontFamily: FontFamily.script, fontSize: sf(16), color: PLUM, marginTop: 5 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 },
  countPill: { backgroundColor: '#f4ecf7', borderWidth: 1.5, borderColor: '#c9a9c0', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
  countText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: PLUM },
  addBtn: { backgroundColor: PLUM, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 14 },
  addBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },

  shipRow: { flexDirection: 'row', gap: 14, marginTop: 14 },
  block: { marginTop: 12 },
  emptyHint: { fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginVertical: 24 },

  // fields
  field: { gap: 2 },
  fieldLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(8), letterSpacing: 0.5, textTransform: 'uppercase', color: '#9a7e92' },
  fieldInput: { fontFamily: FontFamily.ja, fontSize: sf(11), color: INK, borderBottomWidth: 1.4, borderColor: INK, paddingBottom: 2, padding: 0 },
  fieldVal: { fontFamily: FontFamily.ja, fontSize: sf(11), color: INK, borderBottomWidth: 1.4, borderColor: INK, paddingBottom: 2 },

  // roster
  rosterRow: { gap: 8, paddingTop: 10, paddingBottom: 4, paddingRight: 8 },
  memberCard: { width: 118, gap: 6 },
  cardPhoto: { borderWidth: 1.5, borderColor: INK, borderRadius: 6, backgroundColor: '#e9d8cb' },
  colorDot: { position: 'absolute', top: 5, left: 5, width: 18, height: 18, borderRadius: 999, borderWidth: 1.5, borderColor: INK },
  removeDot: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  removeX: { fontSize: sf(11), color: '#b04a4a', fontFamily: FontFamily.ui, lineHeight: 14 },
  addCard: { width: 34, minHeight: 120, borderWidth: 1.5, borderColor: '#c9a9c0', borderStyle: 'dashed', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  addPlus: { fontSize: sf(18), color: '#8b6fc4', fontFamily: FontFamily.ui },

  // section
  section: { alignItems: 'center', marginTop: 24 },
  sectionTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), textTransform: 'uppercase', color: PLUM },
  sectionHint: { fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3 },

  // spectra
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 },
  specEnd: { width: 70, fontFamily: FontFamily.uiMedium, fontSize: sf(10), color: INK },
  specTrack: { flex: 1, height: 16, justifyContent: 'center' },
  specLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: INK },
  specDot: { position: 'absolute', width: 13, height: 13, marginLeft: -6.5, borderRadius: 999, borderWidth: 1.5, borderColor: INK },

  // legend
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 999, borderWidth: 1.4, borderColor: INK },
  legendName: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink2 },

  // map
  mapBox: { backgroundColor: '#fffdfb', borderWidth: 1.5, borderColor: '#e3cdbe', borderRadius: 12, overflow: 'hidden' },
  mapNodeHit: { position: 'absolute', width: 46, height: 46, borderRadius: 999 },
  mapLineHit: { position: 'absolute', width: 32, height: 32, borderRadius: 999 },
  mapLegend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 10 },
  bondSwatch: { width: 16, height: 3, borderRadius: 2 },

  // radar
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 6 },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  chipText: { fontFamily: FontFamily.uiMedium, fontSize: sf(10) },
  radarSliders: { gap: 6, marginTop: 6 },

  // grids
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  gridWrap: { alignItems: 'center' },
  gridBox: { width: 150, height: 150, backgroundColor: '#fffdfb', borderWidth: 1.5, borderColor: INK, borderRadius: 8 },
  gridVLine: { position: 'absolute', left: '50%', top: 8, bottom: 8, width: 1, backgroundColor: '#d9c4b6' },
  gridHLine: { position: 'absolute', top: '50%', left: 8, right: 8, height: 1, backgroundColor: '#d9c4b6' },
  gridAxis: { position: 'absolute', fontFamily: FontFamily.ui, fontSize: sf(9), color: Colors.ink2 },
  gridTop: { top: 4, alignSelf: 'center', left: 0, right: 0, textAlign: 'center' },
  gridBottom: { bottom: 4, alignSelf: 'center', left: 0, right: 0, textAlign: 'center' },
  gridLeft: { left: 4, top: '46%' },
  gridRight: { right: 4, top: '46%' },
  gridDot: { position: 'absolute', width: 13, height: 13, marginLeft: -6.5, marginTop: -6.5, borderRadius: 999, borderWidth: 1.5, borderColor: INK },

  // prefs
  prefRow: { flexDirection: 'row', gap: 12 },
  prefCol: { flex: 1 },
  prefLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(8), color: PLUM, marginBottom: 7, textTransform: 'uppercase' },
  prefItem: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 9 },
  prefInput: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(9), color: INK, borderBottomWidth: 1.2, borderColor: INK, padding: 0, paddingBottom: 2 },
  prefVal: { flex: 1, fontFamily: FontFamily.ja, fontSize: sf(9), color: INK, borderBottomWidth: 1.2, borderColor: INK, paddingBottom: 2 },

  // music
  musicRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f4ecf7', borderWidth: 1.5, borderColor: '#c9a9c0', borderRadius: 12, padding: 12, marginTop: 22 },
  musicIcon: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1.5, borderColor: PLUM, alignItems: 'center', justifyContent: 'center' },
  musicNote: { fontSize: sf(18), color: PLUM },
  musicInput: { fontFamily: FontFamily.ja, fontSize: sf(12), color: INK, borderBottomWidth: 1.4, borderColor: '#c9a9c0', padding: 0, paddingBottom: 2, marginTop: 3 },
  musicVal: { fontFamily: FontFamily.ja, fontSize: sf(12), color: INK, marginTop: 3 },

  // modal
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(43,26,38,0.4)' },
  modalSheet: { position: 'absolute', left: 0, right: 0, top: '32%', alignItems: 'center', paddingHorizontal: 20 },
  modalCard: { width: '100%', backgroundColor: Colors.vellum, borderWidth: 1.5, borderColor: INK, borderRadius: 16, padding: 16, gap: 10 },
  modalTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: PLUM, textAlign: 'center' },
  modalChips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  modalChip: { borderWidth: 1, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  modalChipText: { fontFamily: FontFamily.uiMedium, fontSize: sf(10) },
  modalCloseRow: { flexDirection: 'row', gap: 6 },
  modalCloseBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 8, backgroundColor: '#f4ecf7', borderWidth: 1, borderColor: '#c9a9c0' },
  modalCloseText: { fontFamily: FontFamily.uiMedium, fontSize: sf(10), color: Colors.ink2 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  modalRemove: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: '#b04a4a' },
  modalDone: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3 },
});
