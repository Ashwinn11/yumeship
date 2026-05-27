import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TitleHeader, FILL_GRAY, Check, BlankPill } from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';

import { AlbumsTab } from '@/components/tabs/AlbumsTab';
import { DatesTab } from '@/components/tabs/DatesTab';
import { MessagesTab } from '@/components/tabs/MessagesTab';
import { StorylineTab } from '@/components/tabs/StorylineTab';
import { INK, MarkerCard, SquareCheck } from '@/components/templates/primitives';
import { Sparkle } from '@/components/deco/Sparkle';
import { IconPlus } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { addFoMessage, deleteFoMessage, toggleFoMessage, useFoMessages } from '@/store/foNotifications';
import { addHeadcanon, deleteHeadcanon, useHeadcanons, useHeadcanonCounts } from '@/store/headcanons';
import { addScenario, deleteScenario, useScenarios } from '@/store/scenarios';
import { useShips } from '@/store/ships';
import { loadTemplateData, saveTemplateData } from '@/store/templateData';

type Feature =
  | 'headcanons'
  | 'scenarios'
  | 'messages'
  | 'albums'
  | 'boundaries'
  | 'storyline'
  | 'dates'
  | 'fo-messages';

const FEATURES: { id: Feature; ja: string; label: string; desc: string; color: string; bg: string }[] = [
  { id: 'headcanons',  ja: '想', label: 'Headcanons',     desc: 'personality · habits · favorites', color: Colors.sakuraDeep,    bg: Colors.sakuraSoft },
  { id: 'scenarios',  ja: '物', label: 'Scenarios',       desc: 'write your stories',               color: Colors.lavenderDeep,  bg: Colors.lavenderSoft },
  { id: 'messages',   ja: '話', label: 'Messages',        desc: 'conversations & threads',          color: Colors.peachDeep,     bg: Colors.peachSoft },
  { id: 'albums',     ja: '写', label: 'Albums',          desc: 'photo collections',                color: Colors.sageDeep,      bg: Colors.sageSoft },
  { id: 'boundaries', ja: '夢', label: 'Boundaries',      desc: 'sharing rules & what\'s ok',      color: Colors.plum,          bg: Colors.lavenderSoft },
  { id: 'storyline',  ja: '時', label: 'Storyline',       desc: 'timeline of moments',              color: Colors.ink2,          bg: Colors.paperDeep },
  { id: 'dates',      ja: '日', label: 'Dates',           desc: 'anniversaries & events',           color: Colors.peachDeep,     bg: Colors.peachSoft },
  { id: 'fo-messages',ja: '♡', label: 'F/O Messages',    desc: 'messages from them ♡',             color: Colors.sakuraInk,     bg: Colors.sakuraSoft },
];

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const ships = useShips();
  const [selectedShipIdx, setSelectedShipIdx] = useState(0);
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [showShipPicker, setShowShipPicker] = useState(false);

  const ship = ships[selectedShipIdx] ?? null;

  function renderFeature() {
    if (!ship || !activeFeature) return null;
    switch (activeFeature) {
      case 'headcanons':   return <HeadcanonsFeature shipId={ship.id} shipName={ship.name} />;
      case 'scenarios':    return <ScenariosFeature shipId={ship.id} shipName={ship.name} />;
      case 'messages':     return <MessagesTab shipId={ship.id} shipName={ship.name} />;
      case 'albums':       return <AlbumsTab shipId={ship.id} />;
      case 'boundaries':   return <BoundariesFeature shipId={ship.id} />;
      case 'storyline':    return <StorylineTab shipId={ship.id} shipName={ship.name} />;
      case 'dates':        return <DatesTab shipId={ship.id} />;
      case 'fo-messages':  return <FoMessagesFeature shipId={ship.id} shipName={ship.name} />;
    }
  }

  const activeFeatureMeta = FEATURES.find((f) => f.id === activeFeature);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {activeFeature ? (
          <Pressable style={styles.backBtn} onPress={() => setActiveFeature(null)}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : (
          <View style={{ width: 32 }} />
        )}
        <View style={styles.headerCenter}>
          {activeFeature ? (
            <Text style={styles.headerTitle}>{activeFeatureMeta?.label}</Text>
          ) : (
            <Text style={styles.headerTitle}>vault</Text>
          )}
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Ship selector */}
      {ships.length > 0 && (
        <Pressable style={styles.shipSelector} onPress={() => setShowShipPicker(true)}>
          <View style={[styles.shipDot, { backgroundColor: ship?.gradStart ?? Colors.sakura }]} />
          <Text style={styles.shipName}>{ship ? (ship.shipName || ship.name) : '—'}</Text>
          {ship?.myName && ship?.name ? <Text style={styles.shipFandom}>· {ship.myName} × {ship.name}</Text> : ship?.fandom ? <Text style={styles.shipFandom}>· {ship.fandom}</Text> : null}
          <Text style={styles.shipChevron}>›</Text>
        </Pressable>
      )}

      {ships.length === 0 ? (
        <View style={styles.emptyShips}>
          <Sparkle size={14} color={Colors.sakura} />
          <Text style={styles.emptyTitle}>no ships yet</Text>
          <Text style={styles.emptySub}>add a ship from the home screen first</Text>
        </View>
      ) : activeFeature ? (
        <View style={styles.featureWrap}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderFeature()}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {FEATURES.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.featureCard, { backgroundColor: f.bg }]}
              onPress={() => setActiveFeature(f.id)}
            >
              <Text style={[styles.featureJa, { color: f.color }]}>{f.ja}</Text>
              <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Ship picker sheet */}
      {showShipPicker && (
        <Pressable style={styles.overlay} onPress={() => setShowShipPicker(false)}>
          <Pressable style={styles.pickerSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>switch ship</Text>
            {ships.map((s, i) => (
              <Pressable
                key={s.id}
                style={[styles.pickerRow, i === selectedShipIdx && styles.pickerRowActive]}
                onPress={() => { setSelectedShipIdx(i); setActiveFeature(null); setShowShipPicker(false); }}
              >
                <View style={[styles.pickerDot, { backgroundColor: s.gradStart }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pickerName, i === selectedShipIdx && { color: Colors.sakuraDeep }]}>{s.shipName || s.name}</Text>
                  {s.myName && s.name ? <Text style={styles.pickerFandom}>{s.myName} × {s.name}</Text> : s.fandom ? <Text style={styles.pickerFandom}>{s.fandom}</Text> : null}
                </View>
                {i === selectedShipIdx && <Text style={styles.pickerCheck}>✓</Text>}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

// ─── Headcanons feature ───────────────────────────────────────────────────────

const HC_CATS: { id: string; ja: string; label: string; color: string }[] = [
  { id: 'personality', ja: '性', label: 'Personality', color: Colors.sakuraDeep },
  { id: 'habits',      ja: '癖', label: 'Habits',      color: Colors.lavenderDeep },
  { id: 'favorites',   ja: '好', label: 'Favorites',   color: Colors.peachDeep },
  { id: 'howmet',      ja: '逢', label: 'How Met',     color: Colors.sageDeep },
];

function HeadcanonsFeature({ shipId, shipName }: { shipId: string; shipName: string }) {
  const counts = useHeadcanonCounts(shipId);
  const [openCat, setOpenCat] = useState<string | null>(null);

  if (openCat) {
    const cat = HC_CATS.find((c) => c.id === openCat)!;
    return <HCList shipId={shipId} shipName={shipName} catId={openCat} catLabel={cat.label} catColor={cat.color} onBack={() => setOpenCat(null)} />;
  }

  return (
    <View style={hc.wrap}>
      <TitleHeader title="HEADCANONS" subtitle="the things only I'd notice" by="@daydreamr" />

      <View style={hc.categories}>
        {HC_CATS.map((c) => (
          <CategoryBlock
            key={c.id}
            shipId={shipId}
            cat={c}
            count={counts[c.id] ?? 0}
            onPress={() => setOpenCat(c.id)}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryBlock({
  shipId,
  cat,
  count,
  onPress,
}: {
  shipId: string;
  cat: { id: string; ja: string; label: string; color: string };
  count: number;
  onPress: () => void;
}) {
  const hcs = useHeadcanons(shipId, cat.id);
  const previewHcs = hcs.slice(0, 2); // show first 2 headcanons in the main view

  return (
    <Pressable style={hc.catCard} onPress={onPress}>
      <View style={hc.catHeader}>
        <Text style={hc.catJa}>{cat.ja}</Text>
        <Text style={hc.catLabelText}>{cat.label.toUpperCase()}</Text>
        <View style={hc.catCountBadge}>
          <Text style={hc.catCountText}>{count}</Text>
        </View>
      </View>
      <View style={hc.catContent}>
        {previewHcs.length === 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.5, paddingVertical: 4 }}>
            <Check on={false} size={11} />
            <BlankPill width="60%" />
          </View>
        ) : (
          previewHcs.map((h, j) => (
            <View
              key={h.id}
              style={[
                hc.catItemRow,
                { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
                j < previewHcs.length - 1 && hc.catItemRowBorder,
              ]}
            >
              <View style={{ marginTop: 4 }}>
                <Heart size={10} color={INK} outline />
              </View>
              <Text style={[hc.itemBody, { flex: 1 }]} numberOfLines={2}>
                {h.body}
              </Text>
            </View>
          ))
        )}
        {hcs.length > 2 && (
          <Text style={hc.moreText}>+ {hcs.length - 2} more...</Text>
        )}
      </View>
    </Pressable>
  );
}

function HCList({ shipId, shipName, catId, catLabel, catColor, onBack }: {
  shipId: string; shipName: string; catId: string; catLabel: string; catColor: string; onBack: () => void;
}) {
  const hcs = useHeadcanons(shipId, catId);
  const [draft, setDraft] = useState('');

  function add() {
    if (!draft.trim()) return;
    addHeadcanon(shipId, catId, draft.trim());
    setDraft('');
  }

  const cat = HC_CATS.find((c) => c.id === catId)!;

  const placeholder = (() => {
    switch (catId) {
      case 'personality':
        return `${shipName} personality...`;
      case 'habits':
        return `${shipName} habit...`;
      case 'favorites':
        return `${shipName} favorite...`;
      case 'howmet':
        return `how they met...`;
      default:
        return `${shipName} headcanon...`;
    }
  })();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={160}>
      <View style={hc.listHeader}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={hc.back}>‹ BACK TO INDEX</Text>
        </Pressable>
      </View>

      <View style={hc.listWrap}>
        <View style={hc.catCardActive}>
          <View style={hc.catHeader}>
            <Text style={hc.catJa}>{cat.ja}</Text>
            <Text style={hc.catLabelText}>{catLabel.toUpperCase()}</Text>
            <View style={hc.catCountBadge}>
              <Text style={hc.catCountText}>{hcs.length}</Text>
            </View>
          </View>

          <View style={hc.catContent}>
            {hcs.length === 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.5, paddingVertical: 4 }}>
                <Check on={false} size={11} />
                <BlankPill width="60%" />
              </View>
            ) : (
              hcs.map((h, j) => (
                <Pressable
                  key={h.id}
                  style={[
                    hc.catItemRow,
                    { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
                    j < hcs.length - 1 && hc.catItemRowBorder,
                  ]}
                  onLongPress={() => Alert.alert('Delete headcanon?', h.body.slice(0, 60), [
                    { text: 'Delete', style: 'destructive', onPress: () => deleteHeadcanon(h.id) },
                    { text: 'Cancel', style: 'cancel' },
                  ])}
                >
                  <View style={{ marginTop: 4 }}>
                    <Heart size={10} color={INK} outline />
                  </View>
                  <Text style={[hc.itemBody, { flex: 1 }]}>{h.body}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </View>

      <View style={hc.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={Colors.ink3}
          style={hc.input}
          multiline
        />
        <Pressable style={[hc.addBtn, { backgroundColor: catColor }]} onPress={add}>
          <IconPlus size={14} color={Colors.vellum} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Boundaries feature ───────────────────────────────────────────────────────

type BState = {
  title: string;
  ja: string;
  tint: string;
  stroke: string;
  desc: string;
  checks: { label: string; on: boolean }[];
};

const DEFAULT_STATES: BState[] = [
  {
    title: 'NO SHARING', ja: '夢', tint: '#ffd6e2', stroke: '#c44e75',
    desc: "they're mine. doubles dni.",
    checks: [
      { label: 'doubles interact', on: false },
      { label: 'fan art with double f/o', on: false },
      { label: 'double tags / hashtags', on: false },
      { label: 'RP with double', on: false },
    ],
  },
  {
    title: 'SELECTIVE', ja: '限', tint: '#fde9c6', stroke: '#b58732',
    desc: 'case by case. ask me first.',
    checks: [
      { label: 'mutuals only', on: true },
      { label: 'platonic doubles ok', on: true },
      { label: 'fan art if tagged', on: true },
      { label: 'non-shipping discussions', on: true },
    ],
  },
  {
    title: 'OK SHARING', ja: '可', tint: '#d6ecda', stroke: '#3f8157',
    desc: 'the more the merrier.',
    checks: [
      { label: 'all doubles welcome', on: true },
      { label: 'co-headcanons', on: true },
      { label: 'polyship intros', on: true },
      { label: 'scenario swaps', on: true },
    ],
  },
];

function BoundariesFeature({ shipId }: { shipId: string }) {
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
        />
      ) : (
        <Text style={bn.footer}>{footer}</Text>
      )}
      <View style={{ height: Spacing.s9 }} />
    </View>
  );
}

// ─── Scenarios feature ────────────────────────────────────────────────────────

const SC_PROMPTS: { ja: string; label: string }[] = [
  { ja: '雨', label: 'rainy day' },
  { ja: '夜', label: 'late call' },
  { ja: '朝', label: 'morning after' },
  { ja: '初', label: 'first meeting' },
];

function ScenariosFeature({ shipId, shipName }: { shipId: string; shipName: string }) {
  const scenarios = useScenarios(shipId);
  const [editing, setEditing] = useState<{ id: string | null; title: string; body: string } | null>(null);

  if (editing) {
    return (
      <ScenarioEditor
        initial={editing}
        shipName={shipName}
        onSave={(title, body) => {
          if (!editing.id) addScenario(shipId, title, body);
          setEditing(null);
        }}
        onDelete={editing.id ? () => { deleteScenario(editing.id!); setEditing(null); } : undefined}
        onBack={() => setEditing(null)}
      />
    );
  }

  return (
    <View style={sc.wrap}>
      <View style={sc.topRow}>
        <Text style={sc.eyebrow}>SCENARIOS · {scenarios.length}</Text>
        <Pressable
          style={sc.newBtn}
          onPress={() => setEditing({ id: null, title: '', body: '' })}
        >
          <IconPlus size={12} color={Colors.vellum} />
          <Text style={sc.newBtnText}>new</Text>
        </Pressable>
      </View>

      {scenarios.length === 0 ? (
        <View style={sc.empty}>
          <Heart size={28} color={Colors.sakuraSoft} outline />
          <Text style={sc.emptyTitle}>no scenarios yet.</Text>
          <Text style={sc.emptySub}>what would happen if {shipName} walked in right now?</Text>
          <View style={sc.prompts}>
            {SC_PROMPTS.map((p) => (
              <Pressable
                key={p.ja}
                style={sc.prompt}
                onPress={() => setEditing({ id: null, title: p.label, body: '' })}
              >
                <Text style={sc.promptJa}>{p.ja}</Text>
                <Text style={sc.promptLabel}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={sc.list}>
          {scenarios.map((s) => (
            <Pressable
              key={s.id}
              style={sc.card}
              onPress={() => setEditing({ id: s.id, title: s.title, body: s.body })}
              onLongPress={() => Alert.alert('Delete?', s.title || 'this scenario', [
                { text: 'Delete', style: 'destructive', onPress: () => deleteScenario(s.id) },
                { text: 'Cancel', style: 'cancel' },
              ])}
            >
              <View style={sc.cardStripe} />
              <View style={sc.cardBody}>
                <Text style={sc.cardTitle}>{s.title || 'untitled'}</Text>
                {s.body ? (
                  <Text style={sc.cardPreview} numberOfLines={2}>{s.body}</Text>
                ) : (
                  <Text style={sc.cardEmpty}>tap to write...</Text>
                )}
                <Text style={sc.cardDate}>{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
            </Pressable>
          ))}
          <View style={{ height: Spacing.s9 }} />
        </View>
      )}
    </View>
  );
}

function ScenarioEditor({ initial, shipName, onSave, onDelete, onBack }: {
  initial: { id: string | null; title: string; body: string };
  shipName: string;
  onSave: (title: string, body: string) => void;
  onDelete?: () => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={sc.editor} keyboardVerticalOffset={120}>
      <View style={sc.editorBar}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={sc.barBack}>‹ back</Text>
        </Pressable>
        <Text style={sc.barWords}>{wordCount} words</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {onDelete && (
            <Pressable hitSlop={8} onPress={() => Alert.alert('Delete scenario?', '', [
              { text: 'Delete', style: 'destructive', onPress: onDelete },
              { text: 'Cancel', style: 'cancel' },
            ])}>
              <Text style={sc.barDelete}>delete</Text>
            </Pressable>
          )}
          <Pressable onPress={() => onSave(title, body)} style={sc.barSave}>
            <Text style={sc.barSaveText}>save</Text>
          </Pressable>
        </View>
      </View>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="give it a title..."
        placeholderTextColor={Colors.ink3}
        style={sc.titleInput}
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={`what happens with ${shipName}...`}
        placeholderTextColor={Colors.ink3}
        style={sc.bodyInput}
        multiline
        textAlignVertical="top"
        autoFocus={!initial.body}
      />
    </KeyboardAvoidingView>
  );
}

// ─── F/O Messages feature ─────────────────────────────────────────────────────

function getFoStarters(foName: string) {
  return [
    { emoji: '☀️', text: `good morning from ${foName}~` },
    { emoji: '🌙', text: 'goodnight ♡' },
    { emoji: '💭', text: `${foName} is thinking of you` },
    { emoji: '💧', text: 'drink some water!' },
    { emoji: '🫂', text: 'you okay? ♡' },
    { emoji: '✉️', text: `${foName} misses you~` },
  ];
}

const FO_TIMES: { id: string; label: string; hour: number }[] = [
  { id: '6am',       label: '6 am',      hour: 6  },
  { id: 'morning',   label: '8 am',      hour: 8  },
  { id: '10am',      label: '10 am',     hour: 10 },
  { id: 'noon',      label: '12 pm',     hour: 12 },
  { id: 'afternoon', label: '2 pm',      hour: 14 },
  { id: '4pm',       label: '4 pm',      hour: 16 },
  { id: 'evening',   label: '6 pm',      hour: 18 },
  { id: '8pm',       label: '8 pm',      hour: 20 },
  { id: '10pm',      label: '10 pm',     hour: 22 },
  { id: 'random',    label: 'random ✦',  hour: -1 },
];

function FoMessagesFeature({ shipId, shipName }: { shipId: string; shipName: string }) {
  const messages = useFoMessages(shipId);
  const [composing, setComposing] = useState(false);
  const activeCount = messages.filter((m) => m.active).length;

  if (composing) {
    return (
      <FoCompose
        shipName={shipName}
        onQueue={async (body, hour) => {
          await addFoMessage(shipId, body, hour, shipName);
          setComposing(false);
        }}
        onBack={() => setComposing(false)}
      />
    );
  }

  return (
    <View style={fo.wrap}>
      <View style={fo.hubHeader}>
        <View style={fo.hubLeft}>
          <Text style={fo.eyebrow}>TRACKING</Text>
          <Text style={fo.activeCount}>{activeCount} active</Text>
          {messages.length === 0 && <Text style={fo.noSaved}>no saved notifications yet.</Text>}
        </View>
        <Pressable style={fo.newBtn} onPress={() => setComposing(true)}>
          <IconPlus size={12} color={Colors.sakuraDeep} />
          <Text style={fo.newBtnText}>New</Text>
        </Pressable>
      </View>

      {messages.length === 0 ? (
        <View style={fo.emptyCard}>
          <Text style={fo.emptyCardText}>no saved notifications yet.</Text>
          <Pressable style={fo.createBtn} onPress={() => setComposing(true)}>
            <IconPlus size={13} color={Colors.sakuraDeep} />
            <Text style={fo.createBtnText}>Create notification</Text>
          </Pressable>
        </View>
      ) : (
        <View style={fo.list}>
          {messages.map((m) => {
            const timeLabel = FO_TIMES.find((t) => t.hour === m.scheduledHour)?.label
              ?? (m.scheduledHour >= 0 ? `${m.scheduledHour}:00` : 'random');
            return (
              <Pressable
                key={m.id}
                style={[fo.msgCard, !m.active && fo.msgCardOff]}
                onLongPress={() => Alert.alert('Delete?', m.body.slice(0, 60), [
                  { text: 'Delete', style: 'destructive', onPress: () => { deleteFoMessage(m.id); } },
                  { text: 'Cancel', style: 'cancel' },
                ])}
              >
                <Text style={[fo.msgBody, !m.active && fo.msgBodyOff]}>{m.body}</Text>
                <View style={fo.msgFooter}>
                  <View style={fo.timePill}>
                    <Text style={fo.timePillText}>{timeLabel}</Text>
                  </View>
                  <Pressable
                    onPress={() => { toggleFoMessage(m.id, !m.active, shipName); }}
                    style={[fo.togglePill, m.active && fo.togglePillOn]}
                  >
                    <Text style={[fo.togglePillText, m.active && fo.togglePillTextOn]}>
                      {m.active ? 'active' : 'paused'}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
          <View style={{ height: Spacing.s9 }} />
        </View>
      )}
    </View>
  );
}

function FoCompose({ shipName, onQueue, onBack }: {
  shipName: string;
  onQueue: (body: string, hour: number) => void;
  onBack: () => void;
}) {
  const [body, setBody] = useState('');
  const [timeId, setTimeId] = useState<string>('morning');
  const starters = getFoStarters(shipName);

  function pickStarter(text: string) {
    setBody(text);
  }

  function queue() {
    if (!body.trim()) return;
    const hour = FO_TIMES.find((t) => t.id === timeId)?.hour ?? 8;
    const resolvedHour = hour === -1 ? [6, 8, 10, 12, 14, 16, 18, 20, 22][Math.floor(Math.random() * 9)] : hour;
    onQueue(body.trim(), resolvedHour);
  }

  const timeChosen = FO_TIMES.find((t) => t.id === timeId);
  const previewText = timeId === 'random' ? 'arrives at a random time' : `arrives at ${timeChosen?.label ?? ''}`;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={fo.compose} keyboardVerticalOffset={120}>
      <ScrollView contentContainerStyle={fo.composeContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} hitSlop={8} style={fo.composeBack}>
          <Text style={fo.composeBackText}>‹ back</Text>
        </Pressable>

        <Text style={fo.sectionLabel}>START WITH</Text>
        <View style={fo.starterRow}>
          {starters.map((s) => (
            <Pressable
              key={s.emoji}
              style={[fo.starter, body === s.text && fo.starterActive]}
              onPress={() => pickStarter(s.text)}
            >
              <Text style={fo.starterEmoji}>{s.emoji}</Text>
              <Text style={fo.starterText} numberOfLines={2}>{s.text}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={fo.sectionLabel}>WHAT THEY MIGHT SAY</Text>
        <View style={fo.msgInputWrap}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={`${shipName} says...`}
            placeholderTextColor={Colors.ink3}
            style={fo.msgInput}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Text style={fo.sectionLabel}>WHEN SHOULD THIS ARRIVE?</Text>
        <View style={fo.chipRow}>
          {FO_TIMES.map((t) => (
            <Pressable
              key={t.id}
              style={[fo.chip, timeId === t.id && fo.chipActive]}
              onPress={() => setTimeId(t.id)}
            >
              <Text style={[fo.chipText, timeId === t.id && fo.chipTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={fo.previewRow}>
          <Text style={fo.previewLabel}>Preview</Text>
          <Text style={fo.previewValue}>{previewText}</Text>
        </View>

        <Pressable
          style={[fo.queueBtn, !body.trim() && fo.queueBtnDisabled]}
          onPress={queue}
          disabled={!body.trim()}
        >
          <Text style={fo.queueBtnText}>Queue message ♡</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: Colors.ink2, fontFamily: FontFamily.ui },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },

  shipSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.s5, marginBottom: Spacing.s4,
    paddingVertical: Spacing.s2, paddingHorizontal: Spacing.s4,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill, ...Shadow.s1,
  },
  shipDot: { width: 10, height: 10, borderRadius: 5 },
  shipName: { fontFamily: FontFamily.uiSemiBold, fontSize: 13, color: Colors.ink },
  shipFandom: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink3, flex: 1 },
  shipChevron: { fontSize: 18, color: Colors.ink3, fontFamily: FontFamily.ui },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9,
  },
  featureCard: {
    width: '47%', padding: Spacing.s4, borderRadius: Radius.r4,
    minHeight: 90, justifyContent: 'flex-end', ...Shadow.s1,
    borderWidth: 1.5, borderColor: INK,
  },
  featureJa: { fontFamily: FontFamily.ja, fontSize: 22, marginBottom: 2 },
  featureLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: 13, marginBottom: 2 },
  featureDesc: { fontFamily: FontFamily.ui, fontSize: 10, color: Colors.ink3, lineHeight: 14 },

  featureWrap: { flex: 1 },

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(43,26,38,0.4)', justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.vellum, borderTopLeftRadius: Radius.r4, borderTopRightRadius: Radius.r4,
    padding: Spacing.s5, paddingBottom: Spacing.s9, gap: 4,
  },
  pickerTitle: { fontFamily: FontFamily.displayItalic, fontSize: 18, color: Colors.ink, marginBottom: Spacing.s3 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: Spacing.s3, paddingHorizontal: Spacing.s4,
    borderRadius: Radius.r3,
  },
  pickerRowActive: { backgroundColor: Colors.sakuraSoft },
  pickerDot: { width: 12, height: 12, borderRadius: 6 },
  pickerName: { fontFamily: FontFamily.uiSemiBold, fontSize: 15, color: Colors.ink },
  pickerFandom: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink3 },
  pickerCheck: { fontSize: 14, color: Colors.sakuraDeep, fontFamily: FontFamily.uiSemiBold },

  emptyShips: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.s3, paddingBottom: Spacing.s9 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink3, textAlign: 'center', paddingHorizontal: Spacing.s7 },
});

const hc = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, paddingBottom: Spacing.s6 },
  hint: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink3, marginBottom: Spacing.s4 },
  categories: { marginTop: 16, gap: 12 },
  catCard: {
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  catCardActive: {
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginTop: 8,
  },
  catHeader: {
    padding: 10,
    backgroundColor: FILL_GRAY,
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catJa: { fontFamily: FontFamily.ja, fontSize: 18, fontWeight: '600', color: INK },
  catLabelText: { fontFamily: FontFamily.markerBold, fontSize: 13, color: INK, fontWeight: '700', letterSpacing: 0.5 },
  catCountBadge: {
    marginLeft: 'auto',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: INK,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  catCountText: { fontFamily: FontFamily.markerBold, fontSize: 10, color: INK, fontWeight: '600' },
  catContent: { padding: 10 },
  catEmptyText: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink3, fontStyle: 'italic', paddingVertical: 4 },
  catItemRow: { paddingVertical: 6 },
  catItemRowBorder: { borderWidth: 1, borderColor: 'transparent', borderBottomColor: INK + '22', borderStyle: 'dashed' },
  moreText: { fontFamily: FontFamily.uiMedium, fontSize: 11, color: Colors.sakuraDeep, marginTop: 4 },

  listHeader: { paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3 },
  back: { fontFamily: FontFamily.markerBold, fontSize: 11, color: Colors.ink2, letterSpacing: 0.8 },
  listWrap: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s2 },
  itemBody: { fontFamily: FontFamily.ui, fontSize: 13, color: INK, lineHeight: 18 },
  addRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s5 },
  input: {
    flex: 1, maxHeight: 80, paddingVertical: 9, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink,
  },
  addBtn: { width: 38, height: 38, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});

const sc = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.s4 },
  eyebrow: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.4 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 12,
    backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill,
  },
  newBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 11, color: Colors.vellum },

  empty: { alignItems: 'center', gap: Spacing.s3, paddingVertical: Spacing.s7, paddingHorizontal: Spacing.s4 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2, textAlign: 'center', lineHeight: 20 },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: Spacing.s2 },
  prompt: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill, ...Shadow.s1,
  },
  promptJa: { fontFamily: FontFamily.ja, fontSize: 14, color: Colors.sakuraDeep },
  promptLabel: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink2 },

  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    overflow: 'hidden', ...Shadow.s1,
  },
  cardStripe: { width: 4, backgroundColor: Colors.sakura },
  cardBody: { flex: 1, padding: Spacing.s4, gap: 3 },
  cardTitle: { fontFamily: FontFamily.displayItalic, fontSize: 16, color: Colors.ink },
  cardPreview: { fontFamily: FontFamily.script, fontSize: 14, color: Colors.ink2, lineHeight: 20 },
  cardEmpty: { fontFamily: FontFamily.displayItalic, fontSize: 13, color: Colors.ink3, fontStyle: 'italic' },
  cardDate: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 0.5, marginTop: 4 },

  editor: { flex: 1, backgroundColor: Colors.vellum },
  editorBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  barBack: { fontFamily: FontFamily.ui, fontSize: 14, color: Colors.ink2 },
  barWords: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 0.8 },
  barDelete: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ember },
  barSave: { paddingVertical: 5, paddingHorizontal: 16, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  barSaveText: { fontFamily: FontFamily.uiMedium, fontSize: 13, color: Colors.vellum },
  titleInput: {
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s5, paddingBottom: Spacing.s3,
    fontFamily: FontFamily.ui, fontSize: 18, color: Colors.ink,
    borderBottomWidth: 1, borderBottomColor: Colors.line, backgroundColor: Colors.vellum,
  },
  bodyInput: {
    flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4,
    fontFamily: FontFamily.ui, fontSize: 15, color: Colors.ink, lineHeight: 24,
    minHeight: 300, backgroundColor: Colors.vellum,
  },
});

const fo = StyleSheet.create({
  // Hub
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  hubHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3, marginBottom: Spacing.s3,
  },
  hubLeft: { gap: 2 },
  eyebrow: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.4 },
  activeCount: { fontFamily: FontFamily.displayItalic, fontSize: 22, color: Colors.ink },
  noSaved: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink3, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 12,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill,
  },
  newBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 11, color: Colors.sakuraDeep },

  emptyCard: {
    padding: Spacing.s5, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    alignItems: 'flex-start', gap: Spacing.s3,
  },
  emptyCardText: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink3 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill,
  },
  createBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 13, color: Colors.sakuraDeep },

  list: { gap: 10 },
  msgCard: {
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3, gap: 8,
  },
  msgCardOff: { opacity: 0.55 },
  msgBody: { fontFamily: FontFamily.ui, fontSize: 14, color: Colors.ink, lineHeight: 20 },
  msgBodyOff: { color: Colors.ink3 },
  msgFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timePill: {
    paddingVertical: 3, paddingHorizontal: 10, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
  },
  timePillText: { fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3 },
  togglePill: {
    paddingVertical: 3, paddingHorizontal: 10, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
  },
  togglePillOn: { backgroundColor: Colors.sageSoft, borderColor: Colors.sage },
  togglePillText: { fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3 },
  togglePillTextOn: { color: Colors.sageDeep },

  // Compose
  compose: { flex: 1, backgroundColor: Colors.paper },
  composeContent: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9 },
  composeBack: { paddingVertical: Spacing.s3 },
  composeBackText: { fontFamily: FontFamily.ui, fontSize: 14, color: Colors.ink2 },

  sectionLabel: {
    fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3,
    letterSpacing: 1.4, marginTop: Spacing.s4, marginBottom: Spacing.s2,
  },
  starterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  starter: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill, ...Shadow.s1,
  },
  starterActive: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakura },
  starterEmoji: { fontSize: 14 },
  starterText: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink2 },

  msgInputWrap: {
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, padding: Spacing.s3,
  },
  msgInput: {
    fontFamily: FontFamily.ui, fontSize: 14, color: Colors.ink,
    minHeight: 72, textAlignVertical: 'top', lineHeight: 22,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill,
  },
  chipActive: { backgroundColor: Colors.paperDeep, borderColor: Colors.lineStrong },
  chipText: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink2 },
  chipTextActive: { color: Colors.ink, fontFamily: FontFamily.uiMedium },

  previewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.s4, paddingVertical: Spacing.s3,
    borderTopWidth: 1, borderTopColor: Colors.line,
  },
  previewLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: 13, color: Colors.ink },
  previewValue: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink3 },

  queueBtn: {
    marginTop: Spacing.s4, backgroundColor: Colors.sakuraDeep,
    borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center',
  },
  queueBtnDisabled: { opacity: 0.4 },
  queueBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: 15, color: Colors.vellum },
});

const bn = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.s3 },
  eyebrow: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.4 },
  editBtn: {
    paddingVertical: 5, paddingHorizontal: 14,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.line,
    backgroundColor: Colors.vellum,
  },
  editBtnOn: { backgroundColor: Colors.sakuraDeep, borderColor: Colors.sakuraDeep },
  editBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 12, color: Colors.ink2 },
  editBtnTextOn: { color: Colors.vellum },

  titleCenter: { alignItems: 'center', marginBottom: 6, gap: 4 },
  titlePill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: INK, paddingHorizontal: 18, paddingVertical: 6, borderRadius: 999,
  },
  titleJa: { fontFamily: FontFamily.ja, fontWeight: '600', fontSize: 18, color: '#fff' },
  titleText: { fontFamily: FontFamily.markerBold, fontWeight: '700', fontSize: 16, color: '#fff', letterSpacing: 0.8 },
  titleSub: { fontFamily: FontFamily.ui, fontSize: 12, color: INK, opacity: 0.7 },

  states: { marginTop: 14, gap: 10 },
  stateCard: {
    borderWidth: 2, borderRadius: 16, padding: 12,
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
  },
  seal: {
    width: 44, height: 44, borderRadius: 999, borderWidth: 2,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sealJa: { fontFamily: FontFamily.ja, fontWeight: '600', fontSize: 22, textAlign: 'center' },
  stateContent: { flex: 1, minWidth: 0 },
  stateTitle: { fontFamily: FontFamily.markerBold, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  stateDesc: { fontFamily: FontFamily.ui, fontSize: 11, color: INK, marginTop: 2 },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '48%', minWidth: 0 },
  checkText: { fontFamily: FontFamily.marker, fontSize: 9, fontWeight: '500', color: INK, flex: 1 },
  checkInput: { fontFamily: FontFamily.ui, fontSize: 9, color: INK, flex: 1, padding: 0 },
  removeCheck: { fontSize: 9, color: INK, opacity: 0.4 },
  addCheckBtn: { paddingVertical: 2, paddingHorizontal: 4 },
  addCheckText: { fontFamily: FontFamily.uiMedium, fontSize: 10 },
  chibi: { flexShrink: 0, alignSelf: 'center' },

  footer: { textAlign: 'center', fontFamily: FontFamily.ui, fontSize: 11, color: INK, opacity: 0.7, marginTop: 14 },
  footerInput: { textAlign: 'center', fontFamily: FontFamily.ui, fontSize: 11, color: INK, marginTop: 14, borderBottomWidth: 1, borderBottomColor: INK + '33', paddingBottom: 2 },
});
