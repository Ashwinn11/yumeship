import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiniHC } from '@/components/cards/MiniHC';
import { Heart } from '@/components/deco/Heart';
import { Pin } from '@/components/deco/Pin';
import { Sparkle } from '@/components/deco/Sparkle';
import { WashiTape } from '@/components/deco/WashiTape';
import { SubTabBar, type DetailTab } from '@/components/nav/SubTabBar';
import { AlbumsTab } from '@/components/tabs/AlbumsTab';
import { DatesTab } from '@/components/tabs/DatesTab';
import { MessagesTab } from '@/components/tabs/MessagesTab';
import { OutfitsTab } from '@/components/tabs/OutfitsTab';
import { StorylineTab } from '@/components/tabs/StorylineTab';
import { Chip } from '@/components/ui/Chip';
import { GradientCover } from '@/components/ui/GradientCover';
import { IconEdit, IconPlus } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import {
  addHeadcanon, deleteHeadcanon, useHeadcanonCounts, useHeadcanons,
} from '@/store/headcanons';
import { addScenario, deleteScenario, useScenarios } from '@/store/scenarios';
import { deleteShip, daysTogetherLabel, updateShip, useShip } from '@/store/ships';

const REL_CHIP_COLOR: Record<string, string> = {
  romantic: Colors.sakuraDeep,
  platonic: Colors.sageDeep,
  familial: Colors.peachDeep,
};

const SHARE_CHIP: Record<string, { label: string; color: string }> = {
  ng:      { label: '禁 NG',    color: Colors.ember },
  welcome: { label: '可 open',  color: Colors.sageDeep },
  mirror:  { label: '鏡 mirror', color: Colors.lavenderDeep },
};

const HC_CATS = [
  { id: 'personality', ja: '性', label: 'Personality', color: Colors.sakuraDeep },
  { id: 'habits',      ja: '癖', label: 'Habits',       color: Colors.lavenderDeep },
  { id: 'favorites',   ja: '好', label: 'Favorites',    color: Colors.butterDeep },
  { id: 'howmet',      ja: '逢', label: 'How met',      color: Colors.peachDeep },
] as const;

const SCENARIO_PROMPTS = [
  { ja: '雨', label: 'rainy day' },
  { ja: '夜', label: 'late call' },
  { ja: '朝', label: 'morning after' },
  { ja: '初', label: 'first meeting' },
];

export default function ShipDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ship = useShip(id ?? '');
  const [activeTab, setActiveTab] = useState<DetailTab>('profile');

  if (!ship) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>ship not found</Text>
        </View>
      </View>
    );
  }

  const relChipColor = REL_CHIP_COLOR[ship.relType] ?? Colors.sakuraDeep;
  const shareChip = SHARE_CHIP[ship.shareType];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.appBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.appBarTitle}>{ship.fandom?.toUpperCase() || 'F/O'}</Text>
        <Pressable
          hitSlop={8}
          onPress={() => Alert.alert(
            ship.name,
            'What would you like to do?',
            [
              { text: 'Delete ship', style: 'destructive', onPress: () => { deleteShip(ship.id); router.back(); } },
              { text: 'Cancel', style: 'cancel' },
            ],
          )}
        >
          <IconEdit size={14} color={Colors.ink2} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <GradientCover gradStart={ship.gradStart} gradEnd={ship.gradEnd} style={styles.hero}>
          <Text style={styles.heroInitial}>{ship.name.charAt(0).toUpperCase() || '♡'}</Text>
          <View style={styles.heroTape}>
            <WashiTape width={90} height={18} pattern={ship.tapePattern as any} color="rgba(255,255,255,0.9)" rotate={-5} />
          </View>
          {ship.pinned && (
            <View style={styles.heroPin}>
              <Pin size={13} color={Colors.sakuraDeep} />
            </View>
          )}
          <View style={styles.heroSparkle1}><Sparkle size={14} color={Colors.butter} /></View>
          <View style={styles.heroSparkle2}><Sparkle size={8} color={Colors.butterSoft} /></View>
          <View style={styles.heroChips}>
            <Chip color={relChipColor} bg="rgba(255,255,255,0.92)">♡ {ship.relType}</Chip>
            {shareChip && <Chip color={shareChip.color} bg="rgba(255,255,255,0.92)">{shareChip.label}</Chip>}
          </View>
        </GradientCover>

        <View style={styles.nameBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{ship.name}</Text>
            {ship.nickname ? (
              <Text style={styles.nickname}>· "{ship.nickname}"</Text>
            ) : null}
          </View>
        </View>

        <SubTabBar active={activeTab} onPress={setActiveTab} />

        {activeTab === 'profile'   && <ProfileTab ship={ship} id={id!} />}
        {activeTab === 'scenarios' && <ScenariosTab shipId={id!} shipName={ship.name} />}
        {activeTab === 'albums'    && <AlbumsTab shipId={id!} />}
        {activeTab === 'storyline' && <StorylineTab shipId={id!} shipName={ship.name} />}
        {activeTab === 'messages'  && <MessagesTab shipId={id!} shipName={ship.name} />}
        {activeTab === 'outfits'   && <OutfitsTab shipId={id!} shipName={ship.name} />}
        {activeTab === 'dates'     && <DatesTab shipId={id!} />}
      </ScrollView>
    </View>
  );
}

// ── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ ship, id }: { ship: NonNullable<ReturnType<typeof useShip>>; id: string }) {
  const counts = useHeadcanonCounts(id);
  const totalHC = Object.values(counts).reduce((s, n) => s + n, 0);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(ship!.aboutText);
  const [hcSheet, setHcSheet] = useState<string | null>(null);
  const daysLabel = daysTogetherLabel(ship!.startDate);

  function saveAbout() {
    updateShip(id, { aboutText: aboutDraft });
    setEditingAbout(false);
  }

  return (
    <View style={styles.profileContent}>
      {/* Anniversary */}
      <Pressable
        style={styles.anniversary}
        onPress={() => {
          Alert.prompt(
            'Start date',
            'Enter the date you first met (YYYY-MM-DD)',
            (text) => { if (text) updateShip(id, { startDate: text }); },
            'plain-text',
            ship!.startDate,
          );
        }}
      >
        <View style={styles.anniversaryLeft}>
          <Heart size={11} color={Colors.sakuraDeep} />
          <Text style={styles.anniversaryText}>
            {daysLabel ? `together ${daysLabel}` : 'add a start date'}
          </Text>
        </View>
        {ship!.startDate ? (
          <Text style={styles.anniversaryDate}>since {ship!.startDate}</Text>
        ) : null}
      </Pressable>

      {/* About */}
      <View style={styles.aboutSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>about</Text>
          <Pressable onPress={() => setEditingAbout(true)} hitSlop={8}>
            <IconEdit size={11} color={Colors.ink3} />
          </Pressable>
        </View>
        {editingAbout ? (
          <View style={styles.aboutEditBox}>
            <TextInput
              value={aboutDraft}
              onChangeText={setAboutDraft}
              multiline
              autoFocus
              placeholder="write something about them..."
              placeholderTextColor={Colors.ink3}
              style={styles.aboutInput}
            />
            <View style={styles.aboutEditActions}>
              <Pressable onPress={() => { setAboutDraft(ship!.aboutText); setEditingAbout(false); }} style={styles.aboutCancelBtn}>
                <Text style={styles.aboutCancelText}>cancel</Text>
              </Pressable>
              <Pressable onPress={saveAbout} style={styles.aboutSaveBtn}>
                <Text style={styles.aboutSaveText}>save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setEditingAbout(true)}>
            <Text style={styles.aboutText}>
              {ship!.aboutText || 'tap to add something about them...'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Headcanons */}
      <View style={styles.hcSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>headcanons · {totalHC}</Text>
        </View>
        <View style={styles.hcRow}>
          {HC_CATS.map((cat) => (
            <Pressable key={cat.id} onPress={() => setHcSheet(cat.id)}>
              <MiniHC ja={cat.ja} label={cat.label} count={counts[cat.id] ?? 0} color={cat.color} />
            </Pressable>
          ))}
        </View>
      </View>

      {hcSheet && (
        <HCSheet
          shipId={id}
          categoryId={hcSheet}
          cat={HC_CATS.find((c) => c.id === hcSheet)!}
          onClose={() => setHcSheet(null)}
        />
      )}
    </View>
  );
}

// ── Headcanon Sheet ─────────────────────────────────────────────────────────

function HCSheet({
  shipId, categoryId, cat, onClose,
}: {
  shipId: string;
  categoryId: string;
  cat: { ja: string; label: string; color: string };
  onClose: () => void;
}) {
  const hcs = useHeadcanons(shipId, categoryId);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);

  function submit() {
    if (!draft.trim()) return;
    addHeadcanon(shipId, categoryId, draft.trim());
    setDraft('');
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sheetOverlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetJa, { color: cat.color }]}>{cat.ja}</Text>
            <Text style={styles.sheetTitle}>{cat.label}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.sheetClose}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.sheetList} keyboardShouldPersistTaps="handled">
            {hcs.length === 0 && (
              <Text style={styles.sheetEmpty}>no headcanons yet · add one below</Text>
            )}
            {hcs.map((hc) => (
              <Pressable
                key={hc.id}
                style={styles.hcItem}
                onLongPress={() => Alert.alert('Delete?', hc.body, [
                  { text: 'Delete', style: 'destructive', onPress: () => deleteHeadcanon(hc.id) },
                  { text: 'Cancel', style: 'cancel' },
                ])}
              >
                <Text style={styles.hcBody}>{hc.body}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.sheetInputRow}>
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder="add a headcanon..."
              placeholderTextColor={Colors.ink3}
              style={styles.sheetInput}
              onSubmitEditing={submit}
              returnKeyType="done"
            />
            <Pressable style={[styles.sheetAdd, { backgroundColor: cat.color }]} onPress={submit}>
              <IconPlus size={14} color={Colors.vellum} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Scenarios Tab ────────────────────────────────────────────────────────────

function ScenariosTab({ shipId, shipName }: { shipId: string; shipName: string }) {
  const scenarios = useScenarios(shipId);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function save() {
    if (!body.trim()) return;
    addScenario(shipId, title.trim(), body.trim());
    setTitle('');
    setBody('');
    setComposing(false);
  }

  if (composing) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.scenarioCompose}>
        <View style={styles.sceneHeader}>
          <Pressable onPress={() => setComposing(false)} hitSlop={8}>
            <Text style={styles.sceneCancel}>cancel</Text>
          </Pressable>
          <Pressable onPress={save} style={styles.sceneSaveBtn}>
            <Text style={styles.sceneSaveText}>save</Text>
          </Pressable>
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="title (optional)"
          placeholderTextColor={Colors.ink3}
          style={styles.sceneTitleInput}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder={`what would happen if ${shipName} walked into the room right now?`}
          placeholderTextColor={Colors.ink3}
          multiline
          autoFocus
          style={styles.sceneBodyInput}
        />
        <View style={styles.promptRow}>
          {SCENARIO_PROMPTS.map((p) => (
            <Pressable
              key={p.ja}
              style={styles.promptChip}
              onPress={() => setTitle((t) => t || p.label)}
            >
              <Text style={styles.promptJa}>{p.ja}</Text>
              <Text style={styles.promptLabel}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.scenarioTab}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>scenarios · {scenarios.length}</Text>
        <Pressable onPress={() => setComposing(true)} hitSlop={8}>
          <IconPlus size={14} color={Colors.sakuraDeep} />
        </Pressable>
      </View>

      {scenarios.length === 0 ? (
        <View style={styles.sceneEmpty}>
          <Text style={styles.sceneEmptyTitle}>no scenarios written.</Text>
          <Text style={styles.sceneEmptySub}>
            what would happen if {shipName} walked into the room right now?
          </Text>
          <View style={styles.promptRow}>
            {SCENARIO_PROMPTS.map((p) => (
              <Pressable
                key={p.ja}
                style={styles.promptChip}
                onPress={() => { setTitle(p.label); setComposing(true); }}
              >
                <Text style={styles.promptJa}>{p.ja}</Text>
                <Text style={styles.promptLabel}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.sceneAddBtn} onPress={() => setComposing(true)}>
            <IconPlus size={13} color={Colors.vellum} />
            <Text style={styles.sceneAddText}>write a scene</Text>
          </Pressable>
        </View>
      ) : (
        scenarios.map((sc) => (
          <Pressable
            key={sc.id}
            style={styles.scenarioCard}
            onLongPress={() => Alert.alert('Delete scenario?', sc.title || sc.body.slice(0, 60), [
              { text: 'Delete', style: 'destructive', onPress: () => deleteScenario(sc.id) },
              { text: 'Cancel', style: 'cancel' },
            ])}
          >
            {sc.title ? <Text style={styles.scCardTitle}>{sc.title}</Text> : null}
            <Text style={styles.scCardPreview} numberOfLines={2}>{sc.body}</Text>
            <Text style={styles.scCardDate}>{new Date(sc.createdAt).toLocaleDateString()}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}


// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  backBtn: { padding: Spacing.s3 },
  backText: { fontSize: 22, color: Colors.ink2, fontFamily: FontFamily.ui },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink2 },
  appBar: {
    paddingHorizontal: Spacing.s5, paddingVertical: 6,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  back: { fontSize: 22, color: Colors.ink2, fontFamily: FontFamily.ui },
  appBarTitle: { fontFamily: FontFamily.marker, fontSize: 10, color: Colors.ink3, letterSpacing: 1.4 },
  scroll: { flex: 1 },
  hero: {
    marginHorizontal: Spacing.s4, height: 180,
    borderRadius: Radius.r4, alignItems: 'center', justifyContent: 'center',
  },
  heroInitial: { fontFamily: FontFamily.displayItalic, fontSize: 100, color: 'rgba(255,255,255,0.95)', lineHeight: 100 },
  heroTape: { position: 'absolute', top: -2, left: 14 },
  heroPin: {
    position: 'absolute', top: 12, right: 12,
    width: 28, height: 28, borderRadius: Radius.pill,
    backgroundColor: Colors.vellum, alignItems: 'center', justifyContent: 'center', ...Shadow.s1,
  },
  heroSparkle1: { position: 'absolute', top: 30, right: 50 },
  heroSparkle2: { position: 'absolute', top: 50, right: 65 },
  heroChips: { position: 'absolute', bottom: 10, left: 12, flexDirection: 'row', gap: 6 },
  nameBlock: { paddingHorizontal: Spacing.s5, paddingTop: 12, paddingBottom: Spacing.s1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: FontFamily.displayItalic, fontSize: 32, lineHeight: 33, color: Colors.ink },
  nickname: { fontFamily: FontFamily.displayItalic, fontSize: 14, color: Colors.ink2, fontStyle: 'italic' },

  // Profile tab
  profileContent: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s1, paddingBottom: Spacing.s6, gap: 14 },
  anniversary: {
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.r3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  anniversaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  anniversaryText: { fontFamily: FontFamily.displayItalic, fontSize: 14, color: Colors.sakuraDeep },
  anniversaryDate: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.sakuraDeep },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionLabel: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  aboutSection: { gap: 2 },
  aboutEditBox: {
    borderWidth: 1, borderColor: Colors.sakura, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum, padding: Spacing.s3,
  },
  aboutInput: {
    fontFamily: FontFamily.displayItalic, fontSize: 14,
    color: Colors.ink, lineHeight: 21, minHeight: 80, textAlignVertical: 'top',
  },
  aboutEditActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  aboutCancelBtn: { padding: 4 },
  aboutCancelText: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink3 },
  aboutSaveBtn: { paddingVertical: 4, paddingHorizontal: 12, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  aboutSaveText: { fontFamily: FontFamily.uiMedium, fontSize: 13, color: Colors.vellum },
  aboutText: { fontFamily: FontFamily.displayItalic, fontSize: 14, color: Colors.ink2, lineHeight: 21 },
  hcSection: { gap: 2 },
  hcRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  // HC Sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheetWrap: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5,
    paddingBottom: 34, maxHeight: '70%',
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.s4, paddingBottom: Spacing.s3, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  sheetJa: { fontFamily: FontFamily.ja, fontSize: 18, fontWeight: '600' },
  sheetTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: 15, color: Colors.ink, flex: 1 },
  sheetClose: { fontSize: 13, color: Colors.ink3, fontFamily: FontFamily.ui },
  sheetList: { flex: 0, maxHeight: 280, paddingHorizontal: Spacing.s4 },
  sheetEmpty: { fontFamily: FontFamily.displayItalic, fontSize: 13, color: Colors.ink3, textAlign: 'center', padding: Spacing.s5 },
  hcItem: {
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.paperDeep,
  },
  hcBody: { fontFamily: FontFamily.displayItalic, fontSize: 14, color: Colors.ink, lineHeight: 20 },
  sheetInputRow: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    padding: Spacing.s4, borderTopWidth: 1, borderTopColor: Colors.line,
  },
  sheetInput: {
    flex: 1, paddingVertical: 9, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill, fontFamily: FontFamily.displayItalic, fontSize: 14, color: Colors.ink,
  },
  sheetAdd: {
    width: 36, height: 36, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', ...Shadow.s1,
  },

  // Scenarios tab
  scenarioTab: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s6, gap: 10 },
  sceneEmpty: { alignItems: 'center', gap: Spacing.s3, paddingVertical: Spacing.s7, paddingHorizontal: Spacing.s4 },
  sceneEmptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  sceneEmptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2, textAlign: 'center', lineHeight: 20 },
  promptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 },
  promptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 10,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill,
  },
  promptJa: { fontFamily: FontFamily.ja, fontSize: 11, color: Colors.sakuraDeep, fontWeight: '600' },
  promptLabel: { fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink2 },
  sceneAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.sakuraDeep, paddingHorizontal: Spacing.s5, paddingVertical: 10, borderRadius: Radius.pill,
    ...Shadow.s1,
  },
  sceneAddText: { fontFamily: FontFamily.uiMedium, fontSize: FontSize.body, color: Colors.vellum },
  scenarioCard: {
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3, gap: 4,
  },
  scCardTitle: { fontFamily: FontFamily.displayItalic, fontSize: 17, color: Colors.ink },
  scCardPreview: { fontFamily: FontFamily.displayItalic, fontSize: 13, color: Colors.ink2, lineHeight: 19 },
  scCardDate: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 0.6, marginTop: 2 },

  // Compose scenario
  scenarioCompose: { flex: 1, padding: Spacing.s5, gap: 12, backgroundColor: Colors.paper },
  sceneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sceneCancel: { fontFamily: FontFamily.ui, fontSize: 14, color: Colors.ink2 },
  sceneSaveBtn: { paddingVertical: 6, paddingHorizontal: 16, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  sceneSaveText: { fontFamily: FontFamily.uiMedium, fontSize: 14, color: Colors.vellum },
  sceneTitleInput: {
    fontFamily: FontFamily.displayItalic, fontSize: 22, color: Colors.ink,
    borderBottomWidth: 1, borderBottomColor: Colors.line, paddingVertical: 6,
  },
  sceneBodyInput: {
    fontFamily: FontFamily.displayItalic, fontSize: 16, color: Colors.ink,
    lineHeight: 26, flex: 1, textAlignVertical: 'top',
  },

});
