import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TitleHeader, INK, FILL_GRAY, Check, BlankPill } from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';

import { AlbumsTab } from '@/components/tabs/AlbumsTab';
import { DatesTab } from '@/components/tabs/DatesTab';
import { MessagesTab } from '@/components/tabs/MessagesTab';
import { OutfitsTab } from '@/components/tabs/OutfitsTab';
import { StorylineTab } from '@/components/tabs/StorylineTab';
import { Sparkle } from '@/components/deco/Sparkle';
import { IconPlus } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { addFoMessage, deleteFoMessage, toggleFoMessage, useFoMessages } from '@/store/foNotifications';
import { addHeadcanon, deleteHeadcanon, useHeadcanons, useHeadcanonCounts } from '@/store/headcanons';
import { addScenario, deleteScenario, useScenarios } from '@/store/scenarios';
import { useShips } from '@/store/ships';

type Feature =
  | 'headcanons'
  | 'scenarios'
  | 'messages'
  | 'albums'
  | 'outfits'
  | 'storyline'
  | 'dates'
  | 'fo-messages';

const FEATURES: { id: Feature; ja: string; label: string; desc: string; color: string; bg: string }[] = [
  { id: 'headcanons',  ja: '想', label: 'Headcanons',     desc: 'personality · habits · favorites', color: Colors.sakuraDeep,    bg: Colors.sakuraSoft },
  { id: 'scenarios',  ja: '物', label: 'Scenarios',       desc: 'write your stories',               color: Colors.lavenderDeep,  bg: Colors.lavenderSoft },
  { id: 'messages',   ja: '話', label: 'Messages',        desc: 'conversations & threads',          color: Colors.peachDeep,     bg: Colors.peachSoft },
  { id: 'albums',     ja: '写', label: 'Albums',          desc: 'photo collections',                color: Colors.sageDeep,      bg: Colors.sageSoft },
  { id: 'outfits',    ja: '服', label: 'Outfits',         desc: 'fit pics & looks',                 color: Colors.butterDeep,    bg: Colors.butterSoft },
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
      case 'outfits':      return <OutfitsTab shipId={ship.id} shipName={ship.name} />;
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
          <Text style={styles.shipName}>{ship?.name ?? '—'}</Text>
          {ship?.fandom ? <Text style={styles.shipFandom}>· {ship.fandom}</Text> : null}
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
                  <Text style={[styles.pickerName, i === selectedShipIdx && { color: Colors.sakuraDeep }]}>{s.name}</Text>
                  {s.fandom ? <Text style={styles.pickerFandom}>{s.fandom}</Text> : null}
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

// ─── Scenarios feature ────────────────────────────────────────────────────────

const PROMPTS = ['雨 rainy day', '夜 late call', '朝 morning after', '初 first meeting'];

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
      <View style={sc.header}>
        <Text style={sc.label}>scenarios · {scenarios.length}</Text>
        <Pressable hitSlop={8} onPress={() => setEditing({ id: null, title: '', body: '' })}>
          <IconPlus size={14} color={Colors.sakuraDeep} />
        </Pressable>
      </View>

      {scenarios.length === 0 ? (
        <View style={sc.empty}>
          <Text style={sc.emptyTitle}>no scenarios yet.</Text>
          <Text style={sc.emptySub}>what would happen if {shipName} walked in right now?</Text>
          <View style={sc.prompts}>
            {PROMPTS.map((p) => (
              <Pressable key={p} style={sc.prompt} onPress={() => setEditing({ id: null, title: p, body: '' })}>
                <Text style={sc.promptText}>{p}</Text>
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
            >
              <Text style={sc.cardTitle}>{s.title || 'untitled'}</Text>
              {s.body ? <Text style={sc.cardPreview} numberOfLines={2}>{s.body}</Text> : null}
            </Pressable>
          ))}
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={sc.editor} keyboardVerticalOffset={120}>
      <View style={sc.editorHeader}>
        <Pressable onPress={onBack} hitSlop={8}><Text style={sc.backText}>‹</Text></Pressable>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {onDelete && (
            <Pressable onPress={() => Alert.alert('Delete scenario?', '', [
              { text: 'Delete', style: 'destructive', onPress: onDelete },
              { text: 'Cancel', style: 'cancel' },
            ])}>
              <Text style={sc.deleteText}>delete</Text>
            </Pressable>
          )}
          <Pressable onPress={() => onSave(title, body)} style={sc.saveBtn}>
            <Text style={sc.saveBtnText}>save</Text>
          </Pressable>
        </View>
      </View>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="title..."
        placeholderTextColor={Colors.ink3}
        style={sc.titleInput}
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={`write about ${shipName}...`}
        placeholderTextColor={Colors.ink3}
        style={sc.bodyInput}
        multiline
        textAlignVertical="top"
      />
    </KeyboardAvoidingView>
  );
}

// ─── F/O Messages feature ─────────────────────────────────────────────────────

function FoMessagesFeature({ shipId, shipName }: { shipId: string; shipName: string }) {
  const messages = useFoMessages(shipId);
  const [draft, setDraft] = useState('');
  const [hour, setHour] = useState('9');

  function add() {
    const h = parseInt(hour, 10);
    if (!draft.trim() || isNaN(h)) return;
    addFoMessage(shipId, draft.trim(), Math.max(0, Math.min(23, h)));
    setDraft('');
  }

  return (
    <View style={fo.wrap}>
      <Text style={fo.hint}>write messages {shipName} would send you. they arrive as notifications ♡</Text>

      <View style={fo.addBox}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={`${shipName} says...`}
          placeholderTextColor={Colors.ink3}
          style={fo.draftInput}
          multiline
        />
        <View style={fo.addFooter}>
          <View style={fo.hourRow}>
            <Text style={fo.hourLabel}>send at</Text>
            <TextInput
              value={hour}
              onChangeText={setHour}
              keyboardType="number-pad"
              style={fo.hourInput}
              maxLength={2}
            />
            <Text style={fo.hourLabel}>:00</Text>
          </View>
          <Pressable style={fo.addBtn} onPress={add}>
            <Text style={fo.addBtnText}>add ♡</Text>
          </Pressable>
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={fo.empty}>
          <Text style={fo.emptyTitle}>no messages yet.</Text>
          <Text style={fo.emptySub}>write what {shipName} might say to you</Text>
        </View>
      ) : (
        <View style={fo.list}>
          {messages.map((m) => (
            <Pressable
              key={m.id}
              style={[fo.msgCard, !m.active && fo.msgCardInactive]}
              onLongPress={() => Alert.alert('Delete?', m.body.slice(0, 60), [
                { text: 'Delete', style: 'destructive', onPress: () => deleteFoMessage(m.id) },
                { text: 'Cancel', style: 'cancel' },
              ])}
            >
              <Text style={[fo.msgBody, !m.active && fo.msgBodyInactive]}>{m.body}</Text>
              <View style={fo.msgMeta}>
                <Text style={fo.msgHour}>{m.scheduledHour}:00</Text>
                <Pressable onPress={() => toggleFoMessage(m.id, !m.active)} style={[fo.toggle, m.active && fo.toggleActive]}>
                  <Text style={[fo.toggleText, m.active && fo.toggleTextActive]}>{m.active ? 'active' : 'paused'}</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
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
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, paddingBottom: Spacing.s6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s3 },
  label: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  empty: { alignItems: 'center', gap: Spacing.s3, paddingVertical: Spacing.s7 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2, textAlign: 'center' },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: Spacing.s2 },
  prompt: {
    paddingVertical: 6, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill,
  },
  promptText: { fontFamily: FontFamily.ja, fontSize: 12, color: Colors.ink2 },
  list: { gap: 10 },
  card: {
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3, gap: 4,
  },
  cardTitle: { fontFamily: FontFamily.displayItalic, fontSize: 15, color: Colors.ink },
  cardPreview: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink2, lineHeight: 18 },

  editor: { flex: 1, backgroundColor: Colors.paper },
  editorHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  backText: { fontSize: 22, color: Colors.ink2, fontFamily: FontFamily.ui },
  deleteText: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ember },
  saveBtn: { paddingVertical: 5, paddingHorizontal: 16, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  saveBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 13, color: Colors.vellum },
  titleInput: {
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s2,
    fontFamily: FontFamily.displayItalic, fontSize: 22, color: Colors.ink,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  bodyInput: {
    flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4,
    fontFamily: FontFamily.ui, fontSize: 14, color: Colors.ink, lineHeight: 22,
    minHeight: 300,
  },
});

const fo = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, paddingBottom: Spacing.s6, gap: 16 },
  hint: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink3, lineHeight: 18 },
  addBox: {
    padding: Spacing.s4, backgroundColor: Colors.sakuraSoft,
    borderWidth: 1, borderColor: Colors.sakura, borderRadius: Radius.r3, gap: 10,
  },
  draftInput: {
    fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink,
    minHeight: 60, textAlignVertical: 'top',
  },
  addFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hourRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hourLabel: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink3 },
  hourInput: {
    width: 36, paddingVertical: 3, paddingHorizontal: 8,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r2, fontFamily: FontFamily.uiMedium, fontSize: 13, color: Colors.ink,
    textAlign: 'center',
  },
  addBtn: {
    paddingVertical: 6, paddingHorizontal: 18,
    backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill,
  },
  addBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 13, color: Colors.vellum },

  empty: { alignItems: 'center', gap: Spacing.s2, paddingVertical: Spacing.s5 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink3, textAlign: 'center' },

  list: { gap: 10 },
  msgCard: {
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.sakura, borderRadius: Radius.r3,
    borderLeftWidth: 3, borderLeftColor: Colors.sakuraDeep, gap: 8,
  },
  msgCardInactive: { borderLeftColor: Colors.line, opacity: 0.6 },
  msgBody: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink, lineHeight: 20 },
  msgBodyInactive: { color: Colors.ink3 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  msgHour: { fontFamily: FontFamily.marker, fontSize: 10, color: Colors.ink3, letterSpacing: 0.6 },
  toggle: {
    paddingVertical: 3, paddingHorizontal: 10, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
  },
  toggleActive: { backgroundColor: Colors.sageSoft, borderColor: Colors.sage },
  toggleText: { fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3 },
  toggleTextActive: { color: Colors.sageDeep },
});
