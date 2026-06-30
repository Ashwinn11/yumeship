import { useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Cloud } from '@/components/deco/Cloud';
import { Heart } from '@/components/deco/Heart';
import { Star } from '@/components/deco/Star';
import { FILL_GRAY, TitleHeader } from '@/components/templates/primitives';

import { StickerEnvelope, StickerSakuraBranch, StickerWaxSeal, WashiTape } from '@/components/deco';
import { MemberPicker } from '@/components/nav/MemberPicker';
import { AlbumsTab } from '@/components/tabs/AlbumsTab';
import { DatesTab } from '@/components/tabs/DatesTab';
import { IncorrectQuotesTab } from '@/components/tabs/IncorrectQuotesTab';
import { LoveLetterTab } from '@/components/tabs/LoveLetterTab';
import { MessagesTab } from '@/components/tabs/MessagesTab';
import { PolycaleBingoTab } from '@/components/tabs/PolycaleBingoTab';
import { StorylineTab } from '@/components/tabs/StorylineTab';
import { ThisOrThatTab } from '@/components/tabs/ThisOrThatTab';
import { INK, SquareCheck } from '@/components/templates/primitives';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconChevronLeft, IconEdit, IconPlus, IconTrashSolid } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, sf, Shadow, SheetColumn, Spacing } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { addFoMessage, deleteFoMessage, toggleFoMessage, updateFoMessage, useFoMessages } from '@/store/foNotifications';
import { addHeadcanon, clearCategoryHeadcanons, deleteHeadcanon, getHeadcanons, updateHeadcanon, useHeadcanonCounts, useHeadcanons } from '@/store/headcanons';
import { requestPermission } from '@/store/notifications';
import { getGlobalSetting, saveGlobalSetting } from '@/store/onboarding';
import { usePremium } from '@/store/premium';
import { addCustomPrompt, CustomPrompt, deleteCustomPrompt, getBuiltinDeck, useCustomPrompts } from '@/store/scenarioPrompts';
import { addScenario, deleteScenario, updateScenario, useScenarios } from '@/store/scenarios';
import { getMembers, isPoly, membersLabel, Ship, shipPartners, useShip, useShips } from '@/store/ships';
import { loadTemplateData, saveTemplateData } from '@/store/templateData';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const PREMIUM_FEATURES: Feature[] = ['scenarios', 'albums', 'storyline', 'love-letter'];
const FEATURE_REASON: Partial<Record<Feature, string>> = {
  albums: 'albums',
  scenarios: 'scenarios',
  storyline: 'storyline',
  'love-letter': 'love-letter',
};

type Feature =
  | 'headcanons'
  | 'scenarios'
  | 'messages'
  | 'albums'
  | 'boundaries'
  | 'storyline'
  | 'dates'
  | 'fo-messages'
  | 'this-or-that'
  | 'love-letter'
  | 'polycule-bingo'
  | 'incorrect-quotes';

const FEATURES: { id: Feature; ja: string; label: string; desc: string; color: string; bg: string; availableFor?: 'single' | 'poly' }[] = [
  { id: 'headcanons', ja: '想', label: 'Headcanons', desc: 'personality · habits · favorites', color: Colors.sakuraDeep, bg: Colors.sakuraSoft, availableFor: 'single' },
  { id: 'scenarios', ja: '物', label: 'Scenarios', desc: 'write your stories', color: Colors.lavenderDeep, bg: Colors.lavenderSoft },
  { id: 'messages', ja: '話', label: 'Messages', desc: 'conversations & threads', color: Colors.peachDeep, bg: Colors.peachSoft },
  { id: 'albums', ja: '写', label: 'Albums', desc: 'photo collections', color: Colors.sageDeep, bg: Colors.sageSoft },
  { id: 'boundaries', ja: '夢', label: 'Boundaries', desc: 'sharing rules & what\'s ok', color: Colors.plum, bg: Colors.lavenderSoft },
  { id: 'storyline', ja: '時', label: 'Storyline', desc: 'timeline of moments', color: Colors.ink2, bg: Colors.paperDeep },
  { id: 'dates', ja: '日', label: 'Dates', desc: 'anniversaries & events', color: Colors.peachDeep, bg: Colors.peachSoft },
  { id: 'fo-messages', ja: '通', label: 'F/O Notifications', desc: 'notes & nudges from them', color: Colors.sakuraInk, bg: Colors.sakuraSoft },
  { id: 'this-or-that', ja: '択', label: 'This or That', desc: 'how do they choose?', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, availableFor: 'single' },
  { id: 'love-letter', ja: '文', label: 'Love Letters', desc: 'letters to & from them', color: Colors.sakuraDeep, bg: Colors.sakuraSoft },
  { id: 'polycule-bingo', ja: '札', label: 'Polycule Bingo', desc: 'mark it when it happens ♡', color: Colors.plum, bg: Colors.lavenderSoft, availableFor: 'poly' },
  { id: 'incorrect-quotes', ja: '劇', label: 'Incorrect Quotes', desc: 'cast your polycule in a bit', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, availableFor: 'poly' },
];

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const navigation = useNavigation();
  const ships = useShips();
  const premium = usePremium();
  const [selectedShipIdx, setSelectedShipIdx] = useState(0);
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [showShipPicker, setShowShipPicker] = useState(false);
  const [customBack, setCustomBack] = useState<(() => void) | null>(null);
  const [msgSender, setMsgSender] = useState<'me' | 'them'>('me');

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: activeFeature ? { display: 'none' } : undefined,
    });
  }, [activeFeature, navigation]);

  const ship = ships[selectedShipIdx] ?? null;

  function handleBack() {
    if (customBack) {
      customBack();
      setCustomBack(null);
    } else {
      setActiveFeature(null);
    }
  }

  function renderFeature() {
    if (!ship || !activeFeature) return null;
    switch (activeFeature) {
      case 'headcanons': return <HeadcanonsFeature shipId={ship.id} shipName={ship.name} setCustomBack={setCustomBack} />;
      case 'scenarios': return <ScenariosFeature shipId={ship.id} shipName={ship.name} setCustomBack={setCustomBack} />;
      case 'messages': return <MessagesTab shipId={ship.id} shipName={ship.name} onBack={() => setActiveFeature(null)} />;
      case 'albums': return <AlbumsTab shipId={ship.id} setCustomBack={setCustomBack} />;
      case 'boundaries': return <BoundariesFeature shipId={ship.id} />;
      case 'storyline': return <StorylineTab shipId={ship.id} shipName={ship.name} />;
      case 'dates': return <DatesTab shipId={ship.id} shipName={ship.name} />;
      case 'fo-messages': return <FoMessagesFeature shipId={ship.id} shipName={ship.name} setCustomBack={setCustomBack} />;
      case 'this-or-that': return <ThisOrThatTab shipId={ship.id} />;
      case 'love-letter': return <LoveLetterTab shipId={ship.id} />;
      case 'polycule-bingo': return <PolycaleBingoTab shipId={ship.id} />;
      case 'incorrect-quotes': return <IncorrectQuotesTab shipId={ship.id} />;
    }
  }

  const activeFeatureMeta = FEATURES.find((f) => f.id === activeFeature);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Background accents — hidden inside messages so the chat UI is clean */}
      {activeFeature !== 'messages' && (
        <>
          <View style={styles.decoTR} pointerEvents="none">
            <Cloud size={30} color={Colors.sakura} />
          </View>
          <View style={styles.decoBR} pointerEvents="none">
            <Star size={18} color={Colors.lavenderDeep} />
          </View>
        </>
      )}

      {/* Header — hidden when in messages (MessagesTab owns its own header) */}
      {activeFeature !== 'messages' && (
        activeFeature ? (
          <View style={[styles.subHeader, column]}>
            <Pressable style={styles.backBtn} onPress={handleBack}>
              <IconChevronLeft size={14} color={Colors.ink2} />
            </Pressable>
            <View style={styles.subHeaderCenter}>
              {ships.length > 0 ? (
                <Pressable onPress={() => setShowShipPicker(true)} style={styles.subHeaderPickerBtn}>
                  <View style={[styles.titleShipDot, { backgroundColor: ship?.gradStart ?? Colors.sakura }]} />
                  <Text style={styles.subHeaderShipName} numberOfLines={1}>
                    {ship ? (ship.shipName || ship.name) : 'select ship'}
                  </Text>
                  <Text style={styles.subHeaderChevron}>▾</Text>
                </Pressable>
              ) : (
                <Text style={styles.subHeaderShipName}>no ship</Text>
              )}
            </View>
            <View style={{ width: 32 }} />
          </View>
        ) : (
          <View style={[styles.header, column]}>
            <View style={styles.headerRow}>
              <Mark size={26} />
            </View>
            {ships.length > 0 ? (
              <Pressable style={styles.titleRow} onPress={() => setShowShipPicker(true)}>
                <View style={styles.titlePickerContainer}>
                  <View style={[styles.titleShipDot, { backgroundColor: ship?.gradStart ?? Colors.sakura }]} />
                  <Text style={styles.title} numberOfLines={1}>
                    {ship ? (ship.shipName || ship.name) : 'vault'}
                  </Text>
                  <Text style={styles.titleChevron}>▾</Text>
                </View>
              </Pressable>
            ) : (
              <View style={styles.titleRow}>
                <Text style={styles.title}>vault</Text>
              </View>
            )}
          </View>
        )
      )}

      {ships.length === 0 ? (
        <View style={[styles.emptyShips, { flex: 1, justifyContent: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 12 }]}>
          <StickerWaxSeal size={88} />
          <Text style={{ fontFamily: FontFamily.script, fontSize: sf(26), color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
            create a ship to fill the vault
          </Text>
        </View>
      ) : activeFeature ? (
        <View style={styles.featureWrap}>
          {activeFeature === 'messages' ? renderFeature() : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[column, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()}>
              {renderFeature()}
            </ScrollView>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.grid, column]} showsVerticalScrollIndicator={false}>
          {FEATURES.filter((f) => !f.availableFor || f.availableFor === (isPoly(ship) ? 'poly' : 'single')).map((f) => {
            const locked = !premium && PREMIUM_FEATURES.includes(f.id);
            return (
              <Pressable
                key={f.id}
                style={[styles.featureCard, { backgroundColor: f.bg }, locked && { opacity: 0.5 }]}
                onPress={() => {
                  if (locked) {
                    router.push({ pathname: '/paywall', params: { reason: FEATURE_REASON[f.id] } });
                    return;
                  }
                  setActiveFeature(f.id);
                }}
              >
                <Text style={[styles.featureJa, { color: f.color }]}>{f.ja}</Text>
                <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
                {locked && <Text style={{ position: 'absolute', top: 6, right: 8, fontSize: 10 }}>🔒</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Ship picker sheet */}
      <Modal visible={showShipPicker} transparent animationType="slide" onRequestClose={() => setShowShipPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowShipPicker(false)}>
          <Pressable style={[styles.pickerSheet, SheetColumn]} onPress={(e) => e.stopPropagation()}>
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
                  {isPoly(s)
                    ? (membersLabel(s) ? <Text style={styles.pickerFandom}>{membersLabel(s)}</Text> : null)
                    : s.myName && s.name ? <Text style={styles.pickerFandom}>{s.myName} × {s.name}</Text> : s.fandom ? <Text style={styles.pickerFandom}>{s.fandom}</Text> : null}
                </View>
                {i === selectedShipIdx && <Text style={styles.pickerCheck}>✓</Text>}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Headcanons feature ───────────────────────────────────────────────────────

const HC_CAT_COLORS = [Colors.sakuraDeep, Colors.lavenderDeep, Colors.peachDeep, Colors.sageDeep, Colors.plum, Colors.ink2];
const HC_CAT_JA = ['性', '癖', '好', '逢', '想', '記', '夢', '心'];

const DEFAULT_HC_CATS: { id: string; ja: string; label: string; color: string }[] = [
  { id: 'personality', ja: '性', label: 'Personality', color: Colors.sakuraDeep },
  { id: 'habits', ja: '癖', label: 'Habits', color: Colors.lavenderDeep },
  { id: 'favorites', ja: '好', label: 'Favorites', color: Colors.peachDeep },
  { id: 'howmet', ja: '逢', label: 'How We Met', color: Colors.sageDeep },
];

function getHCCats(shipId: string) {
  const raw = getGlobalSetting(`hc_cats_${shipId}`, '');
  if (raw) { try { return JSON.parse(raw) as typeof DEFAULT_HC_CATS; } catch (_) { } }
  return DEFAULT_HC_CATS;
}

function saveHCCats(shipId: string, cats: typeof DEFAULT_HC_CATS) {
  saveGlobalSetting(`hc_cats_${shipId}`, JSON.stringify(cats));
}

// kept for CategoryBlock previews — fixed to current cats at render time
const HC_CATS = DEFAULT_HC_CATS;

function HeadcanonsFeature({ shipId, shipName: _shipName, setCustomBack: _setCustomBack }: { shipId: string; shipName: string; setCustomBack: (fn: (() => void) | null) => void }) {
  const counts = useHeadcanonCounts(shipId);
  const [editing, setEditing] = useState(false);
  const [cats, setCats] = useState(() => getHCCats(shipId));

  if (editing) {
    return <HCEditor shipId={shipId} cats={cats} onDone={(updatedCats) => { setCats(updatedCats); setEditing(false); }} />;
  }

  return (
    <View style={hc.wrap}>
      <View style={hc.overviewHeader}>
        <TitleHeader title="HEADCANONS" subtitle="the things only I'd notice" />
        <Pressable style={hc.editBtn} onPress={() => setEditing(true)}>
          <Text style={hc.editBtnText}>edit</Text>
        </Pressable>
      </View>

      <View style={hc.categories}>
        {cats.map((c) => (
          <CategoryBlock key={c.id} shipId={shipId} cat={c} count={counts[c.id] ?? 0} />
        ))}
      </View>
    </View>
  );
}

function CategoryBlock({ shipId, cat, count }: {
  shipId: string;
  cat: { id: string; ja: string; label: string; color: string };
  count: number;
}) {
  const hcs = useHeadcanons(shipId, cat.id);
  const previewHcs = hcs.slice(0, 2);
  const customLabel = getGlobalSetting(`hc_label_${shipId}_${cat.id}`, cat.label);

  return (
    <View style={hc.catCard}>
      <View style={hc.catHeader}>
        <Text style={hc.catJa}>{cat.ja}</Text>
        <Text style={hc.catLabelText}>{customLabel.toUpperCase()}</Text>
        <View style={hc.catCountBadge}>
          <Text style={hc.catCountText}>{count}</Text>
        </View>
      </View>
      <View style={hc.catContent}>
        {previewHcs.length === 0 ? (
          <Text style={[hc.emptyHint, { opacity: 0.45, paddingVertical: 4 }]}>nothing yet</Text>
        ) : (
          previewHcs.map((h, j) => (
            <View key={h.id} style={[hc.catItemRow, { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, j < previewHcs.length - 1 && hc.catItemRowBorder]}>
              <View style={{ marginTop: 4 }}>
                <Heart size={10} color={INK} outline />
              </View>
              <Text style={[hc.itemBody, { flex: 1 }]} numberOfLines={2}>{h.body}</Text>
            </View>
          ))
        )}
        {hcs.length > 2 && <Text style={hc.moreText}>+ {hcs.length - 2} more...</Text>}
      </View>
    </View>
  );
}

function HCEditor({ shipId, cats, onDone }: { shipId: string; cats: typeof DEFAULT_HC_CATS; onDone: (updatedCats: typeof DEFAULT_HC_CATS) => void }) {
  const [sections, setSections] = useState(() =>
    cats.map((cat) => ({
      cat,
      title: getGlobalSetting(`hc_label_${shipId}_${cat.id}`, cat.label),
      items: getHeadcanons(shipId, cat.id).map((h) => ({ id: h.id, body: h.body })),
      originalIds: getHeadcanons(shipId, cat.id).map((h) => h.id),
    }))
  );

  function update(catId: string, id: string, val: string) {
    setSections((prev) => prev.map((s) =>
      s.cat.id !== catId ? s : { ...s, items: s.items.map((h) => h.id === id ? { ...h, body: val } : h) }
    ));
  }

  function remove(catId: string, id: string) {
    setSections((prev) => prev.map((s) =>
      s.cat.id !== catId ? s : { ...s, items: s.items.filter((h) => h.id !== id) }
    ));
  }

  function addItem(catId: string) {
    setSections((prev) => prev.map((s) =>
      s.cat.id !== catId ? s : { ...s, items: [...s.items, { id: `new-${Date.now()}`, body: '' }] }
    ));
  }

  function updateTitle(catId: string, val: string) {
    setSections((prev) => prev.map((s) => s.cat.id !== catId ? s : { ...s, title: val }));
  }

  function addCategory() {
    const idx = sections.length;
    const newCat = {
      id: `custom-${Date.now()}`,
      ja: HC_CAT_JA[idx % HC_CAT_JA.length],
      label: 'New Trait',
      color: HC_CAT_COLORS[idx % HC_CAT_COLORS.length],
    };
    setSections((prev) => [...prev, { cat: newCat, title: newCat.label, items: [], originalIds: [] }]);
  }

  function removeCategory(catId: string) {
    setSections((prev) => prev.filter((s) => s.cat.id !== catId));
  }

  function save() {
    const updatedCats = sections.map(({ cat, title }) => ({ ...cat, label: title.trim() || cat.label }));
    saveHCCats(shipId, updatedCats);

    // delete headcanons for removed categories
    const keptCatIds = new Set(updatedCats.map((c) => c.id));
    cats.forEach((c) => { if (!keptCatIds.has(c.id)) clearCategoryHeadcanons(shipId, c.id); });

    sections.forEach(({ cat, title, items, originalIds }) => {
      saveGlobalSetting(`hc_label_${shipId}_${cat.id}`, title.trim() || cat.label);
      const keptIds = new Set(items.map((h) => h.id));
      originalIds.forEach((id) => { if (!keptIds.has(id)) deleteHeadcanon(id); });
      items.forEach((h) => {
        if (!h.body.trim()) return;
        if (originalIds.includes(h.id)) { updateHeadcanon(h.id, h.body.trim()); }
        else addHeadcanon(shipId, cat.id, h.body.trim());
      });
    });
    onDone(updatedCats);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={120}>
      <View style={hc.editorHeader}>
        <Text style={hc.editorTitle}>headcanons</Text>
        <Pressable style={hc.doneBtn} onPress={save}>
          <Text style={hc.doneBtnText}>done</Text>
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={hc.editorList} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()}>
        {sections.map(({ cat, title, items }) => (
          <View key={cat.id} style={hc.catCard}>
            <View style={hc.catHeader}>
              <Text style={hc.catJa}>{cat.ja}</Text>
              <TextInput
                value={title}
                onChangeText={(v) => updateTitle(cat.id, v)}
                style={[hc.catLabelText, { flex: 1 }]}
                autoCapitalize="words"
              />
              <IconEdit size={11} color={Colors.ink3} />
              <Pressable hitSlop={10} onPress={() => removeCategory(cat.id)}>
                <IconTrashSolid size={11} color={Colors.ink3} />
              </Pressable>
            </View>
            <View style={hc.catContent}>
              {items.map((h, i) => (
                <View key={h.id} style={[hc.editorRow, i < items.length - 1 && hc.catItemRowBorder]}>
                  <Text style={hc.editorRowNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <TextInput
                    value={h.body}
                    onChangeText={(v) => update(cat.id, h.id, v)}
                    placeholder="headcanon..."
                    placeholderTextColor={Colors.ink3}
                    style={hc.editorInput}
                    multiline
                  />
                  <Pressable hitSlop={10} onPress={() => remove(cat.id, h.id)}>
                    <IconTrashSolid size={13} color={Colors.ink3} />
                  </Pressable>
                </View>
              ))}
              <Pressable style={hc.editorAddRow} onPress={() => addItem(cat.id)}>
                <IconPlus size={12} color={cat.color} />
                <Text style={[hc.editorAddText, { color: cat.color }]}>add headcanon</Text>
              </Pressable>
            </View>
          </View>
        ))}
        <Pressable style={hc.addCatRow} onPress={addCategory}>
          <IconPlus size={13} color={Colors.sakuraDeep} />
          <Text style={hc.addCatText}>add new trait</Text>
        </Pressable>
      </ScrollView>
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


function ScenariosFeature({ shipId, shipName, setCustomBack }: { shipId: string; shipName: string; setCustomBack: (fn: (() => void) | null) => void }) {
  const scenarios = useScenarios(shipId);
  const ship = useShip(shipId);
  const customPrompts = useCustomPrompts();
  const [editing, setEditing] = useState<{ id: string | null; title: string; body: string; prompt?: string } | null>(null);
  const [scDeleteTarget, setScDeleteTarget] = useState<string | null>(null);
  const [showIdeas, setShowIdeas] = useState(false);
  const [newPromptText, setNewPromptText] = useState('');
  const [shuffleN, setShuffleN] = useState(0);

  // Relationship type drives the whole screen's accent — keeps the design tied
  // to the ship and consistent with the relationship-aware prompts.
  const relType = ship?.relType;
  const accent = relType === 'platonic' ? Colors.sageDeep : relType === 'familial' ? Colors.peachDeep : Colors.sakuraDeep;
  const accentSoft = relType === 'platonic' ? Colors.sageSoft : relType === 'familial' ? Colors.peachSoft : Colors.sakuraSoft;
  const accentLight = relType === 'platonic' ? Colors.sage : relType === 'familial' ? Colors.peach : Colors.sakura;

  const builtinDeck = getBuiltinDeck(ship?.relType);
  // Built-in (relationship-aware) + the user's own prompts, shuffled for serendipity.
  const ideaDeck = useMemo(() => {
    const all = [...builtinDeck, ...customPrompts];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleN, customPrompts.length, ship?.relType]);

  function handleNewScenario(title = '', body = '', prompt = '') {
    setEditing({ id: null, title, body, prompt });
    setCustomBack(() => () => { setEditing(null); setCustomBack(null); });
  }

  function addPrompt() {
    const t = newPromptText.trim();
    if (!t) return;
    addCustomPrompt(t);
    setNewPromptText('');
  }

  if (editing) {
    return (
      <ScenarioEditor
        initial={editing}
        shipName={shipName}
        accent={accent}
        accentLight={accentLight}
        onSave={(title, body) => {
          if (!editing.id) addScenario(shipId, title, body);
          else updateScenario(editing.id, { title, body });
          setEditing(null);
          setCustomBack(null);
        }}
        onDelete={editing.id ? () => { deleteScenario(editing.id!); setEditing(null); setCustomBack(null); } : undefined}
      />
    );
  }

  return (
    <View style={sc.wrap}>
      {/* Redesigned Scenarios Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, paddingHorizontal: 4 }}>
        <View>
          <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: accent, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 }}>
            SCENARIOS · {scenarios.length} SAVED
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => setShowIdeas(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              height: 32, paddingHorizontal: 12, borderRadius: 16,
              backgroundColor: accentSoft, borderWidth: 1, borderColor: accentLight,
            }}
          >
            <Text style={{ fontSize: sf(12) }}>✨</Text>
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: accent }}>prompts</Text>
          </Pressable>
          <Pressable
            onPress={() => handleNewScenario()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: 'rgba(110, 58, 90, 0.18)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <IconPlus size={13} color={Colors.vellum} />
          </Pressable>
        </View>
      </View>

      {scenarios.length === 0 ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: 28, paddingHorizontal: 20, paddingBottom: Spacing.s9 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <StickerSakuraBranch size={76} />
            <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: sf(30), color: Colors.ink, textAlign: 'center', marginTop: 8 }}>
              no daydreams yet
            </Text>
            <Text style={{ fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3, textAlign: 'center' }}>
              pick a moment to write about, or start blank
            </Text>
          </View>

          {/* Prompt starters — tapping one names the new moment */}
          <View style={{ width: '100%', gap: 8, marginTop: Spacing.s5 }}>
            {builtinDeck.slice(0, 3).map((p) => (
              <Pressable
                key={p.text}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
                  borderLeftWidth: 3, borderLeftColor: accent,
                  borderRadius: Radius.r3, paddingVertical: 12, paddingHorizontal: 14,
                }}
                onPress={() => handleNewScenario(p.text)}
              >
                <Text style={{ fontSize: sf(13), color: accent }}>♡</Text>
                <Text style={{ flex: 1, fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: 19, color: Colors.ink2 }}>{p.text}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: Spacing.s4 }}>
            <Pressable
              onPress={() => handleNewScenario()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.pill }}
            >
              <IconPlus size={12} color={Colors.vellum} />
              <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum }}>start blank</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowIdeas(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1, borderColor: accentLight, backgroundColor: accentSoft }}
            >
              <Text style={{ fontSize: sf(12) }}>✨</Text>
              <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: accent }}>more prompts</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <View style={sc.list}>
          <CozyModal
            visible={!!scDeleteTarget}
            title="delete this scene?"
            message={scenarios.find((s) => s.id === scDeleteTarget)?.title || 'this scenario'}
            confirmText="Delete"
            cancelText="keep it"
            isDestructive
            onConfirm={() => { if (scDeleteTarget) deleteScenario(scDeleteTarget); setScDeleteTarget(null); }}
            onClose={() => setScDeleteTarget(null)}
          />
          {scenarios.map((s, scIdx) => {
            const scDate = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
            const wordCount = s.body ? s.body.split(/\s+/).filter(Boolean).length : 0;
            const readTime = Math.max(1, Math.ceil(wordCount / 180)) + ' MIN READ';
            const tapePattern = (scIdx % 2 === 0 ? 'dot' : 'floral') as any;
            const tapeColor = scIdx % 2 === 0 ? Colors.sakura : Colors.lavender;

            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  setEditing({ id: s.id, title: s.title, body: s.body });
                  setCustomBack(() => () => { setEditing(null); setCustomBack(null); });
                }}
                style={[
                  sc.card,
                  {
                    position: 'relative',
                    overflow: 'visible',
                    backgroundColor: Colors.vellum,
                    borderColor: Colors.line,
                    borderRadius: 14,
                    padding: 16,
                    shadowColor: 'rgba(110, 58, 90, 0.06)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    elevation: 1,
                    borderWidth: 1,
                    marginVertical: 6,
                    flexDirection: 'column',
                  }
                ]}
              >
                {/* horizontal washi tape centered at top edge */}
                <View style={{ position: 'absolute', top: -7, left: '50%', transform: [{ translateX: -35 }], zIndex: 10 }}>
                  <WashiTape width={70} height={14} pattern={tapePattern} color={tapeColor} rotate={0} />
                </View>

                <View style={{ flex: 1, width: '100%', paddingVertical: 4 }}>
                  {/* title row */}
                  <View style={sc.cardTitleRow}>
                    <Text style={[sc.cardTitle, { fontFamily: FontFamily.uiSemiBold, fontSize: sf(16), textTransform: 'none', color: Colors.ink }]} numberOfLines={2}>
                      {s.title || 'untitled'}
                    </Text>
                    <Pressable hitSlop={8} onPress={() => setScDeleteTarget(s.id)}>
                      <IconTrashSolid size={12} color={Colors.ink3} />
                    </Pressable>
                  </View>

                  {/* body preview — Fredoka, matches the editor */}
                  {s.body ? (
                    <Text style={[sc.cardPreview, { fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: 19, color: Colors.ink2, marginTop: 4 }]} numberOfLines={3}>
                      {s.body}
                    </Text>
                  ) : (
                    <Text style={[sc.cardEmpty, { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3, marginTop: 4 }]}>tap to write...</Text>
                  )}

                  {/* date at bottom right */}
                  <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: accent, letterSpacing: 1, textAlign: 'right', marginTop: 10 }}>
                    {scDate}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          <View style={{ height: Spacing.s9 }} />
        </View>
      )}

      {/* Ideas — browsable, relationship-aware prompt deck + your own */}
      <Modal visible={showIdeas} transparent animationType="slide" onRequestClose={() => setShowIdeas(false)}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={() => setShowIdeas(false)}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        </TouchableWithoutFeedback>
        <View style={[{ backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, paddingBottom: 34, maxHeight: '80%' }, SheetColumn]}>
          <View style={{ width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3 }}>
            <Text style={{ fontFamily: FontFamily.uiSemiBold, fontSize: sf(18), color: Colors.ink }}>prompts</Text>
            <Pressable onPress={() => setShowIdeas(false)} hitSlop={8}>
              <Text style={{ fontSize: sf(13), color: Colors.ink3 }}>✕</Text>
            </Pressable>
          </View>
          <Text style={{ fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, paddingHorizontal: Spacing.s5, marginTop: 2 }}>
            tap one to name a new moment · {shipName}
          </Text>

          {/* add your own — so you never run out */}
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.s5, marginTop: Spacing.s3 }}>
            <TextInput
              value={newPromptText}
              onChangeText={setNewPromptText}
              placeholder="add your own prompt…"
              placeholderTextColor={Colors.ink3}
              style={{ flex: 1, height: 40, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill, paddingHorizontal: 14, fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink, backgroundColor: Colors.vellum }}
              onSubmitEditing={addPrompt}
              returnKeyType="done"
            />
            <Pressable
              onPress={addPrompt}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <IconPlus size={14} color={Colors.vellum} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: 8, padding: Spacing.s5 }} showsVerticalScrollIndicator={false}>
            {ideaDeck.map((p, i) => {
              const isCustom = 'id' in p;
              return (
                <View
                  key={(isCustom ? (p as CustomPrompt).id : 'b') + i}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    backgroundColor: isCustom ? Colors.lavenderSoft : Colors.vellum,
                    borderWidth: 1, borderColor: isCustom ? Colors.lavender : Colors.line,
                    borderLeftWidth: 3, borderLeftColor: isCustom ? Colors.lavenderDeep : accent,
                    borderRadius: Radius.r3, paddingVertical: 12, paddingHorizontal: 14,
                  }}
                >
                  <Pressable
                    onPress={() => { handleNewScenario(p.text); setShowIdeas(false); }}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                  >
                    <Text style={{ fontSize: sf(13), color: isCustom ? Colors.lavenderDeep : accent }}>{isCustom ? '✎' : '♡'}</Text>
                    <Text style={{ flex: 1, fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: 19, color: Colors.ink }}>{p.text}</Text>
                  </Pressable>
                  {isCustom && (
                    <Pressable hitSlop={8} onPress={() => deleteCustomPrompt((p as CustomPrompt).id)}>
                      <Text style={{ fontSize: sf(12), color: Colors.ink3 }}>✕</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => setShuffleN((n) => n + 1)}
            style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, marginTop: 2 }}
          >
            <Text style={{ fontSize: sf(13), color: accent }}>↻</Text>
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: accent }}>shuffle prompts</Text>
          </Pressable>
        </View>
        </View>
      </Modal>
    </View>
  );
}

function ScenarioEditor({ initial, shipName, accent, accentLight, onSave, onDelete }: {
  initial: { id: string | null; title: string; body: string; prompt?: string };
  shipName: string;
  accent: string;
  accentLight: string;
  onSave: (title: string, body: string) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const wordCount = body.trim() ? body.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[sc.editor, { backgroundColor: Colors.paper }]} keyboardVerticalOffset={120}>
      <CozyModal
        visible={confirmDelete}
        title="delete this scene?"
        confirmText="Delete"
        cancelText="keep it"
        isDestructive
        onConfirm={() => { setConfirmDelete(false); onDelete?.(); }}
        onClose={() => setConfirmDelete(false)}
      />

      {/* Cozy Custom Editor Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: Colors.line,
          backgroundColor: Colors.paper,
        }}
      >
        <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          writing what-if
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {onDelete && (
            <Pressable hitSlop={8} onPress={() => setConfirmDelete(true)}>
              <Text style={{ fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ember }}>delete</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => onSave(title, body)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 18,
              backgroundColor: accent,
              borderRadius: 99,
              shadowColor: 'rgba(110, 58, 90, 0.18)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum }}>save</Text>
          </Pressable>
        </View>
      </View>

      {/* Writing Paper Sheet Container */}
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.vellum,
          margin: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.line,
          padding: 18,
          position: 'relative',
          overflow: 'visible',
          shadowColor: 'rgba(110, 58, 90, 0.05)',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        {/* Horizontal washi tape overlapping top edge */}
        <View style={{ position: 'absolute', top: -7, left: '50%', transform: [{ translateX: -35 }], zIndex: 10 }}>
          <WashiTape width={70} height={14} pattern="dot" color={accentLight} rotate={0} />
        </View>

        {/* Moment name — Fredoka (matches body, easier on the eyes) */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="give this moment a name..."
          placeholderTextColor={Colors.ink3}
          multiline
          style={{
            fontFamily: FontFamily.uiSemiBold,
            fontSize: sf(18),
            color: Colors.ink,
            borderBottomWidth: 1,
            borderBottomColor: accentLight,
            paddingVertical: 8,
            marginBottom: 12,
          }}
        />

        {/* Body Input — Cursive Caveat script font */}
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="what happens in this scene..."
          placeholderTextColor={Colors.ink3}
          style={{
            fontFamily: FontFamily.ui,
            fontSize: sf(15),
            color: Colors.ink2,
            lineHeight: 24,
            flex: 1,
            textAlignVertical: 'top',
          }}
          multiline
          textAlignVertical="top"
          autoFocus={!initial.body}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── F/O Notifications feature ───────────────────────────────────────────────

const STARTER_PRESETS: Record<string, string[]> = {
  'Good morning': [
    'good morning! did you sleep well?~',
    'morning ♡ hope you have a wonderful day today!',
    'good morning, sunshine! time to wake up~',
    "wakey wakey! i'm already thinking of you~"
  ],
  'Goodnight': [
    'goodnight! sweet dreams~',
    "sleep well, i'll be dreaming of you ♡",
    'goodnight, close your eyes and rest well~',
    "heading to bed! can't wait to talk to you tomorrow ♡"
  ],
  'F/O loves you': [
    'i love you so much, never forget that! ♡',
    'just a reminder that you mean the world to me~',
    'sending you a big warm hug right now!',
    "i'm so lucky to have you in my life~"
  ],
  'Take care': [
    'drink some water for me. okay?',
    "don't forget to take a break and breathe~",
    'make sure you eat something yummy today! ♡',
    "please take care of yourself, you're precious to me"
  ]
};

const STARTERS = [
  { emoji: '☀️', text: 'Good morning' },
  { emoji: '🌙', text: 'Goodnight' },
  { emoji: '✨', text: 'F/O loves you' },
  { emoji: '💾', text: 'Take care' },
];



function FoMessagesFeature({ shipId, shipName, setCustomBack }: { shipId: string; shipName: string; setCustomBack: (fn: (() => void) | null) => void }) {
  const messages = useFoMessages(shipId);
  const composeShip = useShip(shipId);
  const [composingMsg, setComposingMsg] = useState<FoMessage | 'new' | null>(null);
  const [msgDeleteTarget, setMsgDeleteTarget] = useState<string | null>(null);
  const activeCount = messages.filter((m) => m.active).length;

  if (composingMsg !== null) {
    return (
      <FoCompose
        shipName={shipName}
        ship={composeShip}
        initialMessage={composingMsg === 'new' ? undefined : composingMsg}
        onQueue={async (body, hour, senderName, minute) => {
          if (composingMsg === 'new') {
            await addFoMessage(shipId, body, hour, senderName, minute);
          } else {
            await updateFoMessage(composingMsg.id, body, hour, senderName, shipName, minute);
          }
          setComposingMsg(null);
          setCustomBack(null);
        }}
      />
    );
  }

  return (
    <View style={fo.wrap}>
      <CozyModal
        visible={!!msgDeleteTarget}
        title="delete this message?"
        message="They won't send this anymore."
        confirmText="Delete"
        cancelText="keep it"
        isDestructive
        onConfirm={() => { if (msgDeleteTarget) deleteFoMessage(msgDeleteTarget); setMsgDeleteTarget(null); }}
        onClose={() => setMsgDeleteTarget(null)}
      />
      <View style={fo.hubHeader}>
        <View style={fo.hubLeft}>
          <Text style={fo.eyebrow}>TRACKING</Text>
          <Text style={fo.activeCount}>{activeCount} active</Text>
          {messages.length === 0 && <Text style={fo.noSaved}>nothing from them yet.</Text>}
        </View>
        <Pressable style={fo.newBtn} onPress={() => {
          setComposingMsg('new');
          setCustomBack(() => () => { setComposingMsg(null); setCustomBack(null); });
        }}>
          <IconPlus size={12} color={Colors.sakuraDeep} />
          <Text style={fo.newBtnText}>new</Text>
        </Pressable>
      </View>

      {messages.length === 0 ? (
        <View style={[fo.emptyCard, { flex: 1, justifyContent: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 12, alignItems: 'center', backgroundColor: 'transparent', borderWidth: 0 }]}>
          <StickerEnvelope size={88} />
          <Text style={{ fontFamily: FontFamily.script, fontSize: sf(26), color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
            no notifications yet
          </Text>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: Colors.sakuraDeep,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 99,
              shadowColor: 'rgba(110, 58, 90, 0.12)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 3,
              elevation: 1,
              marginTop: 10,
            }}
            onPress={() => {
              setComposingMsg('new');
              setCustomBack(() => () => { setComposingMsg(null); setCustomBack(null); });
            }}
          >
            <IconPlus size={12} color={Colors.vellum} />
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.vellum }}>add a notification</Text>
          </Pressable>
        </View>
      ) : (
        <View style={fo.list}>
          {messages.map((m) => {
            const hour = m.scheduledHour;
            let timeLabel = '';
            if (hour === -1) {
              timeLabel = 'random ✦';
            } else if (hour === -2) {
              timeLabel = 'now';
            } else {
              const ampm = hour >= 12 ? 'pm' : 'am';
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              timeLabel = `${displayHour} ${ampm}`;
            }
            const displaySender = m.senderName || shipName;

            let displayBody = m.body;
            let variationCount = 0;
            try {
              if (m.body.startsWith('[')) {
                const arr = JSON.parse(m.body);
                if (Array.isArray(arr) && arr.length > 0) {
                  displayBody = arr[0];
                  variationCount = arr.length;
                }
              }
            } catch (_) { }

            return (
              <View
                key={m.id}
                style={[fo.msgCard, !m.active && fo.msgCardOff]}
              >
                {/* Washi tape corner accent — per usage-map */}
                <View style={{ position: 'absolute', top: -3, left: 12, zIndex: 10 }} pointerEvents="none">
                  <WashiTape pattern="floral" width={52} height={10} rotate={-4} color={Colors.sakura} />
                </View>

                {/* Top row: sender name (left) + time eyebrow (right) */}
                <View style={fo.msgCardTop}>
                  <Text style={fo.msgSender}>{displaySender}</Text>
                  <Text style={fo.msgTime}>{timeLabel}</Text>
                </View>

                {/* Message body in Caveat script */}
                <Text style={[fo.msgBody, !m.active && fo.msgBodyOff]}>{displayBody}</Text>

                {variationCount > 1 && (
                  <Text style={fo.msgVariation}>
                    + {variationCount - 1} more variation{variationCount > 2 ? 's' : ''}
                  </Text>
                )}

                {/* Action row */}
                <View style={fo.actionRow}>
                  <Pressable
                    onPress={() => { toggleFoMessage(m.id, !m.active, m.senderName || shipName); }}
                    style={[fo.actionBtn, m.active ? fo.actionBtnPause : fo.actionBtnResume]}
                  >
                    <Text style={[fo.actionBtnText, m.active ? fo.actionBtnTextPause : fo.actionBtnTextResume]}>
                      {m.active ? 'pause' : 'wake ♡'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setComposingMsg(m);
                      setCustomBack(() => () => { setComposingMsg(null); setCustomBack(null); });
                    }}
                    style={fo.actionBtn}
                  >
                    <Text style={fo.actionBtnText}>edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setMsgDeleteTarget(m.id)}
                    style={[fo.actionBtn, fo.actionBtnDelete]}
                  >
                    <Text style={[fo.actionBtnText, fo.actionBtnTextDelete]}>delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          <View style={{ height: Spacing.s9 }} />
        </View>
      )}
    </View>
  );
}

const ARRIVAL_DAYS = [
  { id: 'now', label: 'Now' },
  { id: 'today', label: 'Later today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'everyday', label: 'Every day' },
  { id: 'random', label: 'Random daily' },
] as const;

const AROUND_TIMES = [
  { id: 'morning', label: 'Morning', hour: 9 },
  { id: 'afternoon', label: 'Afternoon', hour: 14 },
  { id: 'evening', label: 'Evening', hour: 18 },
  { id: 'night', label: 'Night', hour: 21 },
  { id: 'custom', label: 'Custom', hour: -1 },
] as const;


function MockPhoneTop({ children }: { children: React.ReactNode }) {
  const W = 256;
  const s = W / 377;
  const r = (n: number) => Math.round(n * s);
  const btnStyle = {
    position: 'absolute' as const,
    borderRadius: r(2),
    backgroundColor: '#E0DDB8',
    borderWidth: 0.5,
    borderColor: 'rgba(82,74,51,0.8)',
  };
  return (
    <View style={{ alignSelf: 'center', marginBottom: Spacing.s4 }}>
      {/* Power button */}
      <View style={[btnStyle, { right: -r(4), top: r(151), width: r(5), height: r(96) }]} />
      {/* Mute + volume */}
      {([{ t: 165, h: 31 }, { t: 237, h: 56 }, { t: 310, h: 56 }] as const).map((b, i) => (
        <View key={i} style={[btnStyle, { left: -r(4), top: r(b.t), width: r(5), height: r(b.h) }]} />
      ))}
      {/* Titanium frame */}
      <View style={{
        width: W,
        borderTopLeftRadius: r(62), borderTopRightRadius: r(62),
        backgroundColor: '#E8E4C1',
        borderWidth: 1, borderColor: 'rgba(120,112,80,0.5)',
        overflow: 'hidden',
        shadowColor: '#C0C0C0', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9, shadowRadius: 3, elevation: 4,
      }}>
        {/* Bezel */}
        <View style={{
          margin: r(4), marginBottom: 0,
          borderTopLeftRadius: r(58), borderTopRightRadius: r(58),
          backgroundColor: '#0D0D0D', overflow: 'hidden',
        }}>
          {/* Screen */}
          <View style={{
            margin: r(4), marginBottom: 0,
            borderTopLeftRadius: r(52), borderTopRightRadius: r(52),
            overflow: 'hidden',
          }}>
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}

const OpenLockIcon = ({ size = 13, color = '#ffffff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    {/* Closed shackle */}
    <Path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Filled body */}
    <Rect x="2" y="6" width="10" height="7" rx="1.5" fill={color} />
  </Svg>
);


import { FoMessage } from '@/store/foNotifications';

function FoCompose({ shipName, ship, initialMessage, onQueue }: {
  shipName: string;
  ship?: Ship;
  initialMessage?: FoMessage;
  onQueue: (body: string, hour: number, senderName: string, minute: number) => void;
}) {
  const [notifDenied, setNotifDenied] = useState(false);
  const [pendingQueue, setPendingQueue] = useState<string[] | null>(null);
  const [options, setOptions] = useState<string[]>(() => {
    if (initialMessage) {
      try {
        if (initialMessage.body.startsWith('[')) {
          const parsed = JSON.parse(initialMessage.body);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) { }
      return [initialMessage.body];
    }
    return [''];
  });
  const [senderName, setSenderName] = useState(
    initialMessage?.senderName || (isPoly(ship) ? (shipPartners(ship)[0]?.name || '') : shipName),
  );
  const [arrivalDay, setArrivalDay] = useState<'now' | 'today' | 'tomorrow' | 'everyday' | 'random'>(() => {
    if (!initialMessage) return 'everyday';
    const hr = initialMessage.scheduledHour;
    if (hr === -2) return 'now';
    if (hr === -1) return 'random';
    return 'everyday';
  });
  const [aroundTime, setAroundTime] = useState<'morning' | 'afternoon' | 'evening' | 'night' | 'custom'>(() => {
    if (!initialMessage) return 'morning';
    const hr = initialMessage.scheduledHour;
    if (hr === -1 || hr === -2) return 'morning';
    const match = AROUND_TIMES.find(t => t.hour === hr && t.id !== 'custom');
    return match ? (match.id as any) : 'custom';
  });
  const [customHour, setCustomHour] = useState(() => {
    if (!initialMessage) return 12;
    const hr = initialMessage.scheduledHour;
    const match = AROUND_TIMES.find(t => t.hour === hr && t.id !== 'custom');
    if (match) return 12;
    const h12 = hr % 12 || 12;
    return h12;
  });
  const [customMinute, setCustomMinute] = useState(() => {
    return 0;
  });
  const [customHourText, setCustomHourText] = useState(() => {
    if (!initialMessage) return '12';
    const hr = initialMessage.scheduledHour;
    const match = AROUND_TIMES.find(t => t.hour === hr && t.id !== 'custom');
    if (match) return '12';
    return String(hr % 12 || 12);
  });
  const [customMinuteText, setCustomMinuteText] = useState('00');
  const [customAmPm, setCustomAmPm] = useState<'AM' | 'PM'>(() => {
    if (!initialMessage) return 'PM';
    const hr = initialMessage.scheduledHour;
    return hr >= 12 ? 'PM' : 'AM';
  });
  const [randomPreviewHour, setRandomPreviewHour] = useState(12);
  const filteredOptions = options.map(o => o.trim()).filter(Boolean);

  function pickStarter(presetName: string) {
    const list = STARTER_PRESETS[presetName];
    if (list) {
      setOptions([...list]);
    }
  }

  async function queue() {
    const filtered = options.map(o => o.trim()).filter(Boolean);
    if (filtered.length === 0) return;

    const granted = await requestPermission();
    if (!granted) {
      setPendingQueue(filtered);
      setNotifDenied(true);
      return;
    }

    proceedWithQueue(filtered);
  }

  function proceedWithQueue(filtered: string[]) {
    let resolvedHour = 9;
    let resolvedMinute = 0;
    if (arrivalDay === 'now') {
      resolvedHour = -2;
    } else if (arrivalDay === 'random') {
      resolvedHour = -1;
    } else if (aroundTime === 'custom') {
      const h = customHour % 12;
      resolvedHour = customAmPm === 'PM' ? h + 12 : h;
      resolvedMinute = customMinute;
    } else {
      const match = AROUND_TIMES.find(t => t.id === aroundTime);
      resolvedHour = match ? match.hour : 9;
    }

    // Save as JSON string if multiple options, else save plain string
    const finalBody = filtered.length > 1 ? JSON.stringify(filtered) : filtered[0];
    onQueue(finalBody, resolvedHour, senderName.trim() || shipName, resolvedMinute);
  }

  const showAround = arrivalDay !== 'now' && arrivalDay !== 'random';

  let previewText = '';
  if (arrivalDay === 'now') {
    previewText = 'arrives now';
  } else if (arrivalDay === 'random') {
    previewText = 'arrives daily at a random time';
  } else {
    const dayLabel = arrivalDay === 'today' ? 'later today' : arrivalDay === 'tomorrow' ? 'tomorrow' : 'every day';
    if (aroundTime === 'custom') {
      previewText = `arrives ${dayLabel} at ${customHour}:${String(customMinute).padStart(2, '0')} ${customAmPm}`;
    } else {
      const timeLabel = AROUND_TIMES.find(t => t.id === aroundTime)?.label.toLowerCase();
      const matchHour = AROUND_TIMES.find(t => t.id === aroundTime)?.hour ?? 9;
      const hour12 = matchHour > 12 ? `${matchHour - 12} PM` : `${matchHour} AM`;
      previewText = `arrives ${dayLabel} in the ${timeLabel} (${hour12})`;
    }
  }

  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' } as const;
  let lockscreenDateText = '';
  let lockscreenTimeText = '';
  const now = new Date();

  if (arrivalDay === 'now') {
    lockscreenDateText = now.toLocaleDateString('en-US', dateOptions);
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    lockscreenTimeText = `${hrs}:${mins}`;
  } else if (arrivalDay === 'random') {
    lockscreenDateText = now.toLocaleDateString('en-US', dateOptions);
    lockscreenTimeText = `${String(randomPreviewHour).padStart(2, '0')}:00`;
  } else {
    if (arrivalDay === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      lockscreenDateText = tomorrow.toLocaleDateString('en-US', dateOptions);
    } else {
      lockscreenDateText = now.toLocaleDateString('en-US', dateOptions);
    }

    if (aroundTime === 'custom') {
      const h = (customHour % 12) + (customAmPm === 'PM' ? 12 : 0);
      lockscreenTimeText = `${String(h).padStart(2, '0')}:${String(customMinute).padStart(2, '0')}`;
    } else {
      const match = AROUND_TIMES.find(t => t.id === aroundTime);
      const hr = match ? match.hour : 9;
      lockscreenTimeText = `${String(hr).padStart(2, '0')}:00`;
    }
  }

  const hasContent = options.some(o => o.trim().length > 0);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={fo.compose} keyboardVerticalOffset={120}>
      <CozyModal
        visible={notifDenied}
        title="notifications off"
        message="Enable notifications in Settings to receive their nudges. Save to vault anyway?"
        confirmText="save anyway"
        cancelText="cancel"
        onConfirm={() => { setNotifDenied(false); if (pendingQueue) { proceedWithQueue(pendingQueue); setPendingQueue(null); } }}
        onClose={() => { setNotifDenied(false); setPendingQueue(null); }}
      />
      <ScrollView contentContainerStyle={fo.composeContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()} showsVerticalScrollIndicator={false}>
        <Text style={fo.sectionLabel}>START WITH</Text>
        <View style={fo.starterRow}>
          {STARTERS.map((s) => (
            <Pressable
              key={s.text}
              style={fo.starter}
              onPress={() => pickStarter(s.text)}
            >
              <Text style={fo.starterEmoji}>{s.emoji}</Text>
              <Text style={fo.starterText} numberOfLines={2}>{s.text}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={fo.sectionLabel}>FROM</Text>
        {isPoly(ship) && shipPartners(ship).length > 0 ? (
          <View style={{ marginBottom: 8 }}>
            <MemberPicker
              ship={ship}
              selectedId={getMembers(ship).find((m) => m.name === senderName)?.id}
              onSelect={(_, name) => setSenderName(name)}
            />
          </View>
        ) : (
          <View style={fo.fromInputWrap}>
            <TextInput
              value={senderName}
              onChangeText={setSenderName}
              placeholder={shipName}
              placeholderTextColor={Colors.ink3}
              style={fo.fromInput}
            />
          </View>
        )}

        <Text style={fo.sectionLabel}>WHAT THEY MIGHT SEND</Text>
        {options.map((opt, index) => (
          <View key={index} style={[fo.msgInputWrap, { marginBottom: 8, flexDirection: 'row', alignItems: 'center' }]}>
            <TextInput
              value={opt}
              onChangeText={(val) => {
                const copy = [...options];
                copy[index] = val;
                setOptions(copy);
              }}
              placeholder={`${senderName || shipName} says...`}
              placeholderTextColor={Colors.ink3}
              style={[fo.msgInput, { flex: 1, minHeight: 40 }]}
              multiline
              textAlignVertical="top"
            />
            {options.length > 1 && (
              <Pressable
                onPress={() => {
                  setOptions(options.filter((_, i) => i !== index));
                }}
                style={{ padding: 4, marginLeft: 8 }}
              >
                <Text style={{ color: Colors.ember, fontSize: sf(16), fontFamily: FontFamily.uiMedium }}>✕</Text>
              </Pressable>
            )}
          </View>
        ))}

        <Pressable
          onPress={() => setOptions([...options, ''])}
          style={fo.addMsgBtn}
        >
          <IconPlus size={12} color={Colors.sakuraDeep} />
          <Text style={fo.addMsgBtnText}>Add another message option</Text>
        </Pressable>

        <Text style={fo.sectionLabel}>WHEN SHOULD THIS ARRIVE?</Text>
        <View style={fo.chipRow}>
          {ARRIVAL_DAYS.map((d) => (
            <Pressable
              key={d.id}
              style={[fo.chip, arrivalDay === d.id && fo.chipActive]}
              onPress={() => {
                setArrivalDay(d.id);
                if (d.id === 'random') {
                  const pool = [6, 8, 10, 12, 14, 16, 18, 20, 22];
                  setRandomPreviewHour(pool[Math.floor(Math.random() * pool.length)]);
                }
              }}
            >
              <Text style={[fo.chipText, arrivalDay === d.id && fo.chipTextActive]}>{d.label}</Text>
            </Pressable>
          ))}
        </View>

        {showAround && (
          <>
            <Text style={fo.sectionLabel}>AROUND</Text>
            <View style={fo.chipRow}>
              {AROUND_TIMES.map((t) => (
                <Pressable
                  key={t.id}
                  style={[fo.chip, aroundTime === t.id && fo.chipActive]}
                  onPress={() => setAroundTime(t.id as any)}
                >
                  <Text style={[fo.chipText, aroundTime === t.id && fo.chipTextActive]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            {aroundTime === 'custom' && (
              <View style={fo.customTimeRow}>
                <TextInput
                  value={customHourText}
                  onChangeText={(v) => {
                    const digits = v.replace(/\D/g, '');
                    setCustomHourText(digits);
                    const n = parseInt(digits, 10);
                    if (!isNaN(n) && n >= 1 && n <= 12) setCustomHour(n);
                  }}
                  onBlur={() => setCustomHourText(String(customHour).padStart(2, '0'))}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={fo.customTimeInput}
                  selectTextOnFocus
                  placeholder="12"
                  placeholderTextColor={Colors.ink3}
                />
                <Text style={fo.customTimeSep}>:</Text>
                <TextInput
                  value={customMinuteText}
                  onChangeText={(v) => {
                    const digits = v.replace(/\D/g, '');
                    setCustomMinuteText(digits);
                    const n = parseInt(digits, 10);
                    if (!isNaN(n) && n >= 0 && n <= 59) setCustomMinute(n);
                  }}
                  onBlur={() => setCustomMinuteText(String(customMinute).padStart(2, '0'))}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={fo.customTimeInput}
                  selectTextOnFocus
                  placeholder="00"
                  placeholderTextColor={Colors.ink3}
                />
                <Pressable
                  style={fo.customTimeAmPm}
                  onPress={() => setCustomAmPm(p => p === 'AM' ? 'PM' : 'AM')}
                >
                  <Text style={fo.customTimeAmPmText}>{customAmPm}</Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        <Text style={fo.sectionLabel}>PREVIEW</Text>
        <MockPhoneTop>
          <LinearGradient
            colors={['#4a80f0', '#74b9ff']}
            style={[fo.lockscreenBg, filteredOptions.length > 1 && fo.lockscreenBgActive]}
          >
            {/* Status bar + Dynamic Island — pixel-perfect SVG */}
            <Svg width="100%" height={44} viewBox="0 0 906 102" preserveAspectRatio="xMidYMin meet">
              {/* Dynamic Island */}
              <Path d="M274.054 0H631.015V31.0902V31.9875C631.015 53.7501 613.373 71.3922 591.611 71.3922H314.75C292.274 71.3922 274.054 53.1721 274.054 30.6963V0Z" fill="black" />
              {/* Cellular bars */}
              <Path d="M709.317 52.9684C709.317 51.6965 710.29 50.6654 711.492 50.6654H713.667C714.868 50.6654 715.842 51.6965 715.842 52.9684V57.5744C715.842 58.8463 714.868 59.8773 713.667 59.8773H711.492C710.29 59.8773 709.317 58.8463 709.317 57.5744V52.9684Z" fill="white" />
              <Path d="M720.192 47.211C720.192 45.9391 721.166 44.908 722.367 44.908H724.542C725.743 44.908 726.717 45.9391 726.717 47.211V57.5744C726.717 58.8463 725.743 59.8773 724.542 59.8773H722.367C721.166 59.8773 720.192 58.8463 720.192 57.5744V47.211Z" fill="white" />
              <Path d="M731.067 39.1506C731.067 37.8787 732.041 36.8476 733.242 36.8476H735.417C736.618 36.8476 737.592 37.8787 737.592 39.1506V57.5744C737.592 58.8463 736.618 59.8773 735.417 59.8773H733.242C732.041 59.8773 731.067 58.8463 731.067 57.5744V39.1506Z" fill="white" />
              <Path d="M741.942 34.5446C741.942 33.2727 742.916 32.2416 744.117 32.2416H746.292C747.493 32.2416 748.467 33.2727 748.467 34.5446V57.5744C748.467 58.8463 747.493 59.8773 746.292 59.8773H744.117C742.916 59.8773 741.942 58.8463 741.942 57.5744V34.5446Z" fill="white" />
              {/* WiFi */}
              <Path fillRule="evenodd" clipRule="evenodd" d="M777.255 38.3918C782.936 38.392 788.399 40.6199 792.516 44.6151C792.826 44.9235 793.321 44.9196 793.627 44.6063L796.59 41.5536C796.745 41.3947 796.831 41.1794 796.83 40.9555C796.828 40.7316 796.74 40.5174 796.583 40.3604C785.778 29.7902 768.731 29.7902 757.926 40.3604C757.769 40.5173 757.68 40.7314 757.679 40.9553C757.678 41.1793 757.764 41.3946 757.918 41.5536L760.882 44.6063C761.187 44.9201 761.683 44.924 761.993 44.6151C766.111 40.6197 771.574 38.3917 777.255 38.3918ZM777.337 47.6079C780.458 47.6077 783.468 48.7918 785.781 50.9302C786.094 51.2337 786.587 51.2271 786.892 50.9153L789.852 47.8626C790.008 47.7024 790.094 47.4852 790.092 47.2595C790.09 47.0338 789.999 46.8184 789.84 46.6615C782.795 39.9723 771.885 39.9723 764.84 46.6615C764.681 46.8184 764.59 47.0339 764.588 47.2597C764.586 47.4855 764.673 47.7027 764.829 47.8626L767.788 50.9153C768.093 51.2271 768.586 51.2337 768.899 50.9302C771.211 48.7932 774.218 47.6092 777.337 47.6079ZM783.357 53.5665C783.361 53.7928 783.274 54.0111 783.116 54.1696L777.996 59.444C777.846 59.599 777.641 59.6862 777.428 59.6862C777.214 59.6862 777.009 59.599 776.859 59.444L771.738 54.1696C771.58 54.0109 771.493 53.7926 771.498 53.5663C771.502 53.3399 771.598 53.1256 771.763 52.9738C775.033 50.1507 779.822 50.1507 783.092 52.9738C783.257 53.1257 783.352 53.3401 783.357 53.5665Z" fill="white" />
              {/* Battery outline */}
              <Rect x="806.041" y="31.0901" width="57.5744" height="29.9387" rx="9.2119" fill="white" fillOpacity="0.4" />
              {/* Battery fill */}
              <Path d="M806.041 45.8292C806.041 40.67 806.041 38.0905 807.045 36.1199C807.929 34.3866 809.338 32.9774 811.071 32.0942C813.042 31.0901 815.621 31.0901 820.78 31.0901H854.404V61.0288H820.78C815.621 61.0288 813.042 61.0288 811.071 60.0248C809.338 59.1416 807.929 57.7324 807.045 55.999C806.041 54.0285 806.041 51.4489 806.041 46.2898V45.8292Z" fill="white" />
              {/* Battery nub */}
              <Path d="M864.767 41.4535C865.683 41.4535 866.562 41.9388 867.21 42.8026C867.858 43.6663 868.222 44.8379 868.222 46.0595C868.222 47.281 867.858 48.4526 867.21 49.3164C866.562 50.1801 865.683 50.6654 864.767 50.6654L864.767 46.0595V41.4535Z" fill="white" />
              {/* Battery 99% */}
              <Path d="M826.732 37.4363C830.488 37.4363 833.434 40.1126 833.434 45.8138V45.8363C833.434 51.2677 830.87 54.495 826.71 54.495C823.572 54.495 821.245 52.6395 820.739 50.0982L820.716 49.997H824.045L824.078 50.0982C824.472 51.1102 825.394 51.7962 826.699 51.7962C829.049 51.7962 830.083 49.4909 830.207 46.5335C830.207 46.4211 830.207 46.2974 830.207 46.1737H829.982C829.397 47.4219 828.048 48.5464 825.799 48.5464C822.639 48.5464 820.514 46.2974 820.514 43.2275V43.205C820.514 39.8877 823.078 37.4363 826.732 37.4363ZM826.732 46.0387C828.408 46.0387 829.701 44.8468 829.701 43.1713V43.1488C829.701 41.4508 828.408 40.1351 826.755 40.1351C825.113 40.1351 823.797 41.4283 823.797 43.0813V43.1038C823.797 44.813 825.034 46.0387 826.732 46.0387ZM842.475 37.4363C846.231 37.4363 849.177 40.1126 849.177 45.8138V45.8363C849.177 51.2677 846.613 54.495 842.453 54.495C839.315 54.495 836.988 52.6395 836.482 50.0982L836.459 49.997H839.788L839.821 50.0982C840.215 51.1102 841.137 51.7962 842.442 51.7962C844.792 51.7962 845.826 49.4909 845.95 46.5335C845.95 46.4211 845.95 46.2974 845.95 46.1737H845.725C845.14 47.4219 843.791 48.5464 841.542 48.5464C838.382 48.5464 836.257 46.2974 836.257 43.2275V43.205C836.257 39.8877 838.821 37.4363 842.475 37.4363ZM842.475 46.0387C844.151 46.0387 845.444 44.8468 845.444 43.1713V43.1488C845.444 41.4508 844.151 40.1351 842.498 40.1351C840.856 40.1351 839.54 41.4283 839.54 43.0813V43.1038C839.54 44.813 840.777 46.0387 842.475 46.0387Z" fill="black" />
            </Svg>

            {/* Centered open padlock below status bar */}
            <View style={{ alignSelf: 'center', marginTop: 2 }}>
              <OpenLockIcon size={14} color="#ffffff" />
            </View>

            <View style={fo.lockscreenClockContainer}>
              <Text style={fo.lockscreenDate}>{lockscreenDateText}</Text>
              <Text style={fo.lockscreenTime}>{lockscreenTimeText}</Text>
            </View>

            <View style={[fo.notifStackContainer, filteredOptions.length > 1 && fo.notifStackActive]}>
              {filteredOptions.length > 1 && (
                <>
                  <View style={[fo.notifBanner, fo.notifCardBack2]} />
                  <View style={[fo.notifBanner, fo.notifCardBack1]} />
                </>
              )}
              <View style={fo.notifBanner}>
                <Image style={fo.notifIcon} source={require('@/assets/images/icon.png')} />
                <View style={fo.notifRight}>
                  <View style={fo.notifHeader}>
                    <Text style={fo.notifTitle} numberOfLines={1}>{senderName.trim() || shipName}</Text>
                    <Text style={fo.notifTime}>now</Text>
                  </View>
                  <Text style={fo.notifBody} numberOfLines={2}>{filteredOptions[0] || 'a message for you~'}</Text>
                </View>
              </View>
            </View>

          </LinearGradient>
        </MockPhoneTop>



        <Pressable
          style={[fo.queueBtn, !hasContent && fo.queueBtnDisabled]}
          onPress={queue}
          disabled={!hasContent}
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
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s3,
    paddingBottom: Spacing.s4,
  },
  subHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  subHeaderCenter: { flex: 1, alignItems: 'center' },
  subHeaderTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  subHeaderPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subHeaderShipName: {
    fontFamily: FontFamily.uiMedium,
    fontSize: FontSize.h5,
    color: Colors.ink,
    maxWidth: 180,
  },
  subHeaderChevron: {
    fontSize: sf(16),
    color: Colors.ink3,
    fontFamily: FontFamily.ui,
    marginTop: 2,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titlePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.uiMedium,
    fontSize: FontSize.h3,
    color: Colors.ink,
  },
  titleShipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  titleChevron: {
    fontSize: sf(22),
    color: Colors.ink3,
    fontFamily: FontFamily.ui,
    marginLeft: 4,
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9,
  },
  featureCard: {
    width: '47%', padding: Spacing.s4, borderRadius: Radius.r4,
    minHeight: 90, justifyContent: 'flex-end', ...Shadow.s1,
    borderWidth: 1.5, borderColor: INK, position: 'relative', overflow: 'hidden',
  },
  featureCardLocked: { opacity: 0.55 },
  featureJa: { fontFamily: FontFamily.ja, fontSize: sf(22), marginBottom: 2 },
  featureLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), marginBottom: 2 },
  featureDesc: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3, lineHeight: 14 },
  featureTextLocked: { opacity: 0.7 },
  lockBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.vellum, borderRadius: 99,
    width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.line,
  },

  featureWrap: { flex: 1 },

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(43,26,38,0.4)', justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.vellum, borderTopLeftRadius: Radius.r4, borderTopRightRadius: Radius.r4,
    padding: Spacing.s5, paddingBottom: Spacing.s9, gap: 4,
  },
  pickerTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(18), color: Colors.ink, marginBottom: Spacing.s3 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: Spacing.s3, paddingHorizontal: Spacing.s4,
    borderRadius: Radius.r3,
  },
  pickerRowActive: { backgroundColor: Colors.sakuraSoft },
  pickerDot: { width: 12, height: 12, borderRadius: 6 },
  pickerName: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.ink },
  pickerFandom: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3 },
  pickerCheck: { fontSize: sf(14), color: Colors.sakuraDeep, fontFamily: FontFamily.uiSemiBold },

  msgSenderToggle: { flexDirection: 'row', backgroundColor: Colors.paperDeep, borderRadius: Radius.pill, padding: 2, borderWidth: 1, borderColor: Colors.line },
  msgSenderBtn: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: Radius.pill },
  msgSenderBtnActive: { backgroundColor: Colors.sakuraDeep },
  msgSenderBtnText: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink2 },
  msgSenderBtnTextActive: { color: Colors.vellum },
  emptyShips: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.s3, paddingBottom: Spacing.s9 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink3, textAlign: 'center', paddingHorizontal: Spacing.s7 },
  decoTL: {
    position: 'absolute',
    top: 130,
    left: 20,
  },
  decoTR: {
    position: 'absolute',
    top: 130,
    right: 20,
  },
  decoBR: {
    position: 'absolute',
    bottom: 120,
    right: 30,
  },
});

const hc = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, paddingBottom: Spacing.s6 },
  hint: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, marginBottom: Spacing.s4 },
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
  catJa: { fontFamily: FontFamily.ja, fontSize: sf(18), color: INK },
  catLabelText: { fontFamily: FontFamily.markerBold, fontSize: sf(13), color: INK, letterSpacing: 0.5 },
  catCountBadge: {
    marginLeft: 'auto',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: INK,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  catCountText: { fontFamily: FontFamily.markerBold, fontSize: sf(10), color: INK },
  catContent: { padding: 10 },
  catEmptyText: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, paddingVertical: 4 },
  catItemRow: { paddingVertical: 6 },
  catItemRowBorder: { borderBottomWidth: 1, borderBottomColor: INK + '22' },
  moreText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.sakuraDeep, marginTop: 4 },
  emptyHint: { fontFamily: FontFamily.ui, fontSize: sf(12), color: INK, opacity: 0.45 },

  overviewHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  editBtn: {
    paddingHorizontal: 12, paddingVertical: 5, marginTop: 4,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.vellum,
  },
  editBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2 },
  itemBody: { fontFamily: FontFamily.ui, fontSize: sf(13), color: INK, lineHeight: 18 },

  editorHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  editorTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(14), color: Colors.ink },
  doneBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.sakuraDeep },
  doneBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum },
  editorList: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, paddingBottom: Spacing.s9, gap: 16 },
  editorSection: { gap: 8 },
  editorSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  editorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6,
  },
  editorRowNum: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, width: 18 },
  editorInput: { flex: 1, fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink, lineHeight: 18 },
  editorAddRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  editorAddText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13) },
  addCatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, marginTop: 4 },
  addCatText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.sakuraDeep },
});

const sc = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.s4 },
  eyebrow: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 12,
    backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill,
  },
  newBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.vellum },

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
  promptJa: { fontFamily: FontFamily.ja, fontSize: sf(14), color: Colors.sakuraDeep },
  promptLabel: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2 },

  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    overflow: 'hidden', ...Shadow.s1,
  },
  cardStripe: { width: 4, backgroundColor: Colors.sakura },
  cardBody: { flex: 1, padding: Spacing.s4, gap: 3 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  cardTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink, flex: 1 },
  cardPreview: { fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink2, lineHeight: 20 },
  cardEmpty: { fontFamily: FontFamily.displayItalic, fontSize: sf(13), color: Colors.ink3 },
  cardDate: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 0.5, marginTop: 4 },

  editor: { flex: 1, backgroundColor: Colors.paper },
  editorBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s4, paddingVertical: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  barBackBtn: {
    width: 32, height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  barBack: { fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink2 },
  barWords: { fontFamily: FontFamily.ja, fontSize: sf(11), color: Colors.ink3, letterSpacing: 0.5 },
  barDelete: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ember },
  barSave: { paddingVertical: 5, paddingHorizontal: 16, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  barSaveText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum },
  titleInput: {
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s5, paddingBottom: Spacing.s4,
    fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: Colors.ink,
    borderBottomWidth: 1.5, borderBottomColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  bodyWrap: {
    flex: 1,
    backgroundColor: Colors.vellum,
    margin: Spacing.s4,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadow.s1,
  },
  bodyInput: {
    flex: 1, padding: Spacing.s4,
    fontFamily: FontFamily.script, fontSize: sf(15), color: Colors.ink, lineHeight: 26,
    minHeight: 260,
  },
});

const fo = StyleSheet.create({
  // Hub
  wrap: { flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  hubHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3, marginBottom: Spacing.s3,
  },
  hubLeft: { gap: 2 },
  eyebrow: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4 },
  activeCount: { fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: Colors.ink },
  noSaved: { fontFamily: FontFamily.ja, fontSize: sf(11), color: Colors.ink3, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 12,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill,
  },
  newBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.sakuraDeep },

  emptyCard: {
    padding: Spacing.s5, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    alignItems: 'flex-start', gap: Spacing.s3,
  },
  emptyCardText: { fontFamily: FontFamily.ja, fontSize: sf(12), color: Colors.ink3 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill,
  },
  createBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.sakuraDeep },

  list: { gap: 12 },

  // Notification card
  msgCard: {
    paddingTop: Spacing.s5, paddingHorizontal: Spacing.s4, paddingBottom: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    gap: 6, overflow: 'visible', position: 'relative',
  },
  msgCardOff: { opacity: 0.5 },
  msgCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  msgSender: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink, lineHeight: 18 },
  msgTime: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase' },
  msgBody: { fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink, lineHeight: 22 },
  msgBodyOff: { color: Colors.ink3 },
  msgVariation: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.sakuraDeep },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  actionBtn: {
    paddingVertical: 5, paddingHorizontal: 12, borderRadius: Radius.pill,
    backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.line,
  },
  actionBtnResume: { backgroundColor: Colors.sageSoft, borderColor: Colors.sage },
  actionBtnPause: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakura },
  actionBtnDelete: { borderColor: Colors.ember },
  actionBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2 },
  actionBtnTextResume: { color: Colors.sageDeep },
  actionBtnTextPause: { color: Colors.sakuraInk },
  actionBtnTextDelete: { color: Colors.ember },

  fromInputWrap: {
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, paddingHorizontal: Spacing.s3, paddingVertical: 10,
  },
  fromInput: {
    fontFamily: FontFamily.script, fontSize: sf(15), color: Colors.ink,
    padding: 0,
  },

  // Compose
  compose: { flex: 1, backgroundColor: Colors.paper },
  composeContent: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9 },
  composeBack: { paddingVertical: Spacing.s3 },
  composeBackText: { fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink2 },

  sectionLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3,
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
  starterEmoji: { fontSize: sf(14) },
  starterText: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2 },

  msgInputWrap: {
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, padding: Spacing.s3,
  },
  msgInput: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink,
    minHeight: 72, textAlignVertical: 'top', lineHeight: 24,
  },
  addMsgBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: 'rgba(243,182,196,0.15)', borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill, marginTop: 4, marginBottom: Spacing.s4,
  },
  addMsgBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.sakuraDeep },
  customTimeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.s2, marginBottom: Spacing.s2,
  },
  customTimeInput: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(24), color: Colors.ink,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r2, paddingVertical: 8, paddingHorizontal: 14,
    textAlign: 'center', minWidth: 58,
  },
  customTimeSep: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(24), color: Colors.ink2,
  },
  customTimeAmPm: {
    backgroundColor: Colors.sakuraDeep, borderRadius: Radius.r2,
    paddingVertical: 8, paddingHorizontal: 14, marginLeft: 4,
  },
  customTimeAmPmText: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(14), color: Colors.vellum,
  },

  notifBanner: {
    backgroundColor: 'rgba(20, 20, 22, 0.72)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
  },
  notifRight: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  notifTitle: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: sf(11),
    color: '#ffffff',
  },
  notifTime: {
    fontFamily: FontFamily.ui,
    fontSize: sf(11),
    color: 'rgba(255, 255, 255, 0.45)',
  },
  notifBody: {
    fontFamily: FontFamily.ui,
    fontSize: sf(10),
    color: 'rgba(255, 255, 255, 0.80)',
    lineHeight: 13,
  },

  lockscreenBg: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  lockscreenBgActive: {
    paddingBottom: 28,
  },
  lockscreenPadlock: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  lockscreenClockContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  lockscreenDate: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: sf(13),
    fontFamily: FontFamily.ui,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  lockscreenTime: {
    color: '#ffffff',
    fontSize: sf(64),
    fontFamily: FontFamily.ui,
    marginTop: 0,
    letterSpacing: -3,
  },

  notifStackContainer: {
    position: 'relative',
  },
  notifStackActive: {},
  notifCardBack1: {
    position: 'absolute',
    bottom: -6,
    left: 8,
    right: 8,
    height: 48,
    zIndex: -1,
    opacity: 0.6,
    borderTopWidth: 0,
  },
  notifCardBack2: {
    position: 'absolute',
    bottom: -12,
    left: 16,
    right: 16,
    height: 40,
    zIndex: -2,
    opacity: 0.35,
    borderTopWidth: 0,
  },

  lockscreenBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  lockscreenCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 120,
    height: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2.25,
    alignSelf: 'center',
    marginTop: 16,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill,
  },
  chipActive: { backgroundColor: Colors.paperDeep, borderColor: Colors.lineStrong },
  chipText: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2 },
  chipTextActive: { color: Colors.ink, fontFamily: FontFamily.uiMedium },

  previewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.s4, paddingVertical: Spacing.s3,
    borderTopWidth: 1, borderTopColor: Colors.line,
  },
  previewLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
  previewValue: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3 },

  queueBtn: {
    marginTop: Spacing.s4, backgroundColor: Colors.sakuraDeep,
    borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center',
  },
  queueBtnDisabled: { opacity: 0.4 },
  queueBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.vellum },
});

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
