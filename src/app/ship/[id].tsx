import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiniHC } from '@/components/cards/MiniHC';
import { Heart } from '@/components/deco/Heart';
import { Ribbon } from '@/components/deco/Ribbon';
import { Sakura } from '@/components/deco/Sakura';
import { WashiTape, Sparkle } from '@/components/deco';
import { Chip } from '@/components/ui/Chip';
import { CozyModal } from '@/components/ui/CozyModal';
import { GradientCover } from '@/components/ui/GradientCover';
import { IconEdit, IconPlus, IconTrashSolid } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, SheetColumn, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import {
  addHeadcanon, deleteHeadcanon, updateHeadcanon, useHeadcanonCounts, useHeadcanons,
} from '@/store/headcanons';
import { getGlobalSetting, saveGlobalSetting } from '@/store/onboarding';
import { deleteShip, daysTogetherLabel, isPoly, membersLabel, shipTitle, updateShip, useShip } from '@/store/ships';

const TEMPLATES = [
  { key: 'get-to-know',  title: 'All About Us',     tapePattern: 'heart'  as const, color: Colors.sakuraDeep,   bg: Colors.sakuraSoft },
  { key: 'kawaii-ui',    title: 'Kawaii UI',          tapePattern: 'dot'    as const, color: Colors.lavenderDeep, bg: Colors.lavenderSoft },
  { key: 'heart-frame',  title: 'Heart Frame',        tapePattern: 'stripe' as const, color: Colors.peachDeep,   bg: Colors.peachSoft },
  { key: 'aesthetic',    title: 'Aesthetic Board',    tapePattern: 'check'  as const, color: Colors.butterDeep,  bg: Colors.butterSoft },
  { key: 'bond-banner',  title: 'Bond Banner',        tapePattern: 'floral' as const, color: Colors.sageDeep,    bg: Colors.sageSoft },
  { key: 'flip-phone',   title: 'Flip Phone',         tapePattern: 'dot'    as const, color: Colors.ink2,        bg: Colors.paperDeep },
  { key: 'talking-about',title: 'Talking About',      tapePattern: 'heart'  as const, color: Colors.plum,        bg: Colors.lavenderSoft },
];

// Polyship ships use their own dedicated templates.
const POLY_TEMPLATES = [
  { key: 'poly-chart',    title: 'Poly Ship Chart',    tapePattern: 'heart'  as const, color: Colors.plum,        bg: Colors.lavenderSoft },
  { key: 'poly-quick',    title: 'In 5 Minutes',       tapePattern: 'dot'    as const, color: Colors.lavenderDeep, bg: Colors.lavenderSoft },
  { key: 'poly-dynamics', title: 'Polycule Dynamics',  tapePattern: 'check'  as const, color: Colors.sageDeep,    bg: Colors.sageSoft },
];

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



export default function ShipDetail() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ship = useShip(id ?? '');

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
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Background accents */}
      <View style={styles.decoTR} pointerEvents="none">
        <Ribbon size={24} color={Colors.sakura} />
      </View>
      <View style={styles.decoBL} pointerEvents="none">
        <Sakura size={22} color={Colors.sakura} />
      </View>

      <CozyModal
        visible={confirmDelete}
        title="let them go?"
        message={`Remove ${ship.name} and all their memories. This can't be undone.`}
        confirmText="Delete"
        cancelText="keep them"
        isDestructive
        onConfirm={() => { setConfirmDelete(false); deleteShip(ship.id); router.back(); }}
        onClose={() => setConfirmDelete(false)}
      />

      <View style={[styles.appBar, column]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.appBarTitle}>{ship.fandom?.toUpperCase() || 'F/O'}</Text>
        <Pressable hitSlop={8} onPress={() => setConfirmDelete(true)}>
          <IconEdit size={14} color={Colors.ink2} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()}>
        <View style={column}>
        <GradientCover gradStart={ship.gradStart} gradEnd={ship.gradEnd} style={styles.hero}>
          <Text style={styles.heroInitial}>{ship.name.charAt(0).toUpperCase() || '♡'}</Text>
          <View style={styles.heroTape}>
            <WashiTape width={90} height={18} pattern={ship.tapePattern as any} color="rgba(255,255,255,0.9)" rotate={-5} />
          </View>
          {ship.pinned && (
            <View style={styles.heroPin}>
              <Ribbon size={13} color={Colors.sakuraDeep} />
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
            <Text style={styles.name}>{isPoly(ship) ? shipTitle(ship) : ship.name}</Text>
          </View>
          {isPoly(ship) && membersLabel(ship) ? <Text style={styles.polyMembers}>{membersLabel(ship)}</Text> : null}
        </View>

        <ProfileTab ship={ship} id={id!} />

        {/* Templates */}
        <View style={styles.templatesSection}>
          <Text style={styles.templatesSectionLabel}>TEMPLATES</Text>
          <View style={styles.templatesGrid}>
            {(isPoly(ship) ? POLY_TEMPLATES : TEMPLATES).map((t) => (
              <Pressable
                key={t.key}
                style={[styles.templateCard, { backgroundColor: t.bg }]}
                onPress={() => router.push(`/template/${t.key}?shipId=${id}` as any)}
              >
                <View style={styles.templateTape}>
                  <WashiTape width={48} height={12} pattern={t.tapePattern} color={t.color} rotate={-5} />
                </View>
                <View style={styles.templateCardInner}>
                  <Text style={[styles.templateCardTitle, { color: t.color }]}>{t.title}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
        </View>
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
  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(ship!.startDate);
const daysLabel = daysTogetherLabel(ship!.startDate);

  function saveAbout() {
    updateShip(id, { aboutText: aboutDraft });
    setEditingAbout(false);
  }

  return (
    <View style={styles.profileContent}>
      <CozyModal
        visible={editingDate}
        title="when did you meet?"
        confirmText="save"
        cancelText="cancel"
        onConfirm={() => { updateShip(id, { startDate: dateDraft }); setEditingDate(false); }}
        onClose={() => { setDateDraft(ship!.startDate); setEditingDate(false); }}
      >
        <TextInput
          value={dateDraft}
          onChangeText={setDateDraft}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.ink3}
          style={styles.dateInput}
          autoFocus
        />
      </CozyModal>

      {/* Anniversary */}
      <Pressable style={styles.anniversary} onPress={() => { setDateDraft(ship!.startDate); setEditingDate(true); }}>
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

const HC_COLLAPSE_LIMIT = 5;

function HCSheet({
  shipId, categoryId, cat, onClose,
}: {
  shipId: string;
  categoryId: string;
  cat: { ja: string; label: string; color: string };
  onClose: () => void;
}) {
  const labelKey = `hc_label_${shipId}_${categoryId}`;
  const hcs = useHeadcanons(shipId, categoryId);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(() => getGlobalSetting(labelKey, cat.label));
  const inputRef = useRef<TextInput>(null);

  const visible = showAll ? hcs : hcs.slice(0, HC_COLLAPSE_LIMIT);
  const hiddenCount = hcs.length - HC_COLLAPSE_LIMIT;

  function submit() {
    if (!draft.trim()) return;
    addHeadcanon(shipId, categoryId, draft.trim());
    setDraft('');
  }

  function saveEdit() {
    if (editingId && editDraft.trim()) updateHeadcanon(editingId, editDraft.trim());
    setEditingId(null);
  }

  function saveTitle() {
    saveGlobalSetting(labelKey, titleDraft.trim() || cat.label);
    setEditingTitle(false);
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <CozyModal
        visible={!!deleteTarget}
        title="remove this?"
        message={hcs.find((h) => h.id === deleteTarget)?.body.slice(0, 80)}
        confirmText="Delete"
        cancelText="keep it"
        isDestructive
        onConfirm={() => { if (deleteTarget) deleteHeadcanon(deleteTarget); setDeleteTarget(null); }}
        onClose={() => setDeleteTarget(null)}
      />
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sheetOverlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
        <View style={[styles.sheet, SheetColumn]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetJa, { color: cat.color }]}>{cat.ja}</Text>
            {editingTitle ? (
              <TextInput
                value={titleDraft}
                onChangeText={setTitleDraft}
                onBlur={saveTitle}
                onSubmitEditing={saveTitle}
                autoFocus
                style={[styles.sheetTitle, { borderBottomWidth: 1, borderBottomColor: cat.color, flex: 1 }]}
              />
            ) : (
              <Pressable style={{ flex: 1 }} onPress={() => setEditingTitle(true)}>
                <Text style={styles.sheetTitle}>{titleDraft}</Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.sheetClose}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.sheetList} keyboardShouldPersistTaps="handled">
            {hcs.length === 0 && (
              <Text style={styles.sheetEmpty}>nothing yet · add one below</Text>
            )}
            {visible.map((hc) => (
              <View key={hc.id} style={styles.hcItem}>
                {editingId === hc.id ? (
                  <View style={styles.hcEditRow}>
                    <TextInput
                      value={editDraft}
                      onChangeText={setEditDraft}
                      onSubmitEditing={saveEdit}
                      autoFocus
                      style={[styles.hcEditInput, { flex: 1 }]}
                      multiline
                    />
                    <Pressable hitSlop={8} onPress={saveEdit} style={styles.hcSaveBtn}>
                      <Text style={[styles.hcSaveBtnText, { color: cat.color }]}>done</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.hcEditRow}>
                    <Pressable onPress={() => { setEditingId(hc.id); setEditDraft(hc.body); }} style={styles.hcBodyWrap}>
                      <Text style={styles.hcBody}>{hc.body}</Text>
                    </Pressable>
                    <Pressable hitSlop={10} onPress={() => setDeleteTarget(hc.id)} style={styles.hcDeleteBtn}>
                      <Text style={styles.hcDeleteText}>✕</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
            {!showAll && hiddenCount > 0 && (
              <Pressable style={styles.hcShowMore} onPress={() => setShowAll(true)}>
                <Text style={[styles.hcShowMoreText, { color: cat.color }]}>+{hiddenCount} more</Text>
              </Pressable>
            )}
          </ScrollView>
          <View style={styles.sheetInputRow}>
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder="what do you know about them?"
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


// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  backBtn: { padding: Spacing.s3 },
  backText: { fontSize: sf(22), color: Colors.ink2, fontFamily: FontFamily.ui },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink2 },
  appBar: {
    paddingHorizontal: Spacing.s5, paddingVertical: 6,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  back: { fontSize: sf(22), color: Colors.ink2, fontFamily: FontFamily.ui },
  appBarTitle: { fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3, letterSpacing: 1.4 },
  scroll: { flex: 1 },
  hero: {
    marginHorizontal: Spacing.s4, height: 180,
    borderRadius: Radius.r4, alignItems: 'center', justifyContent: 'center',
  },
  heroInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(100), color: 'rgba(255,255,255,0.95)', lineHeight: 100 },
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
  name: { fontFamily: FontFamily.displayItalic, fontSize: sf(32), lineHeight: 33, color: Colors.ink },
  polyMembers: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.plum, marginTop: 2 },
  // Profile tab
  profileContent: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s1, paddingBottom: Spacing.s6, gap: 14 },
  anniversary: {
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.r3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  anniversaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  anniversaryText: { fontFamily: FontFamily.displayItalic, fontSize: sf(14), color: Colors.sakuraDeep },
  anniversaryDate: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.sakuraDeep },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionLabel: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  aboutSection: { gap: 2 },
  aboutEditBox: {
    borderWidth: 1, borderColor: Colors.sakura, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum, padding: Spacing.s3,
  },
  aboutInput: {
    fontFamily: FontFamily.ui, fontSize: sf(14),
    color: Colors.ink, lineHeight: 21, minHeight: 80, textAlignVertical: 'top',
  },
  aboutEditActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  aboutCancelBtn: { padding: 4 },
  aboutCancelText: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3 },
  aboutSaveBtn: { paddingVertical: 4, paddingHorizontal: 12, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  aboutSaveText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum },
  aboutText: { fontFamily: FontFamily.displayItalic, fontSize: sf(14), color: Colors.ink2, lineHeight: 21 },
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
  sheetJa: { fontFamily: FontFamily.ja, fontSize: sf(18) },
  sheetTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.ink, flex: 1 },
  sheetClose: { fontSize: sf(13), color: Colors.ink3, fontFamily: FontFamily.ui },
  sheetList: { flex: 0, maxHeight: 280, paddingHorizontal: Spacing.s4 },
  sheetEmpty: { fontFamily: FontFamily.displayItalic, fontSize: sf(13), color: Colors.ink3, textAlign: 'center', padding: Spacing.s5 },
  hcItem: {
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.paperDeep,
  },
  hcBody: { fontFamily: FontFamily.displayItalic, fontSize: sf(14), color: Colors.ink, lineHeight: 20 },
  hcEditRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hcBodyWrap: { flex: 1 },
  hcEditInput: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(14), color: Colors.ink, lineHeight: 20,
    borderBottomWidth: 1, borderBottomColor: Colors.sakura, paddingVertical: 2,
  },
  hcDeleteBtn: { padding: 4 },
  hcDeleteText: { fontSize: sf(12), color: Colors.ink3, fontFamily: FontFamily.ui },
  hcSaveBtn: { padding: 4 },
  hcSaveBtnText: { fontSize: sf(12), fontFamily: FontFamily.uiMedium },
  hcShowMore: {
    alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10,
    marginVertical: 4, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep,
  },
  hcShowMoreText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12) },
  dateInput: {
    fontFamily: FontFamily.ui, fontSize: sf(15), color: Colors.ink,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r2,
    paddingVertical: 8, paddingHorizontal: 12, backgroundColor: Colors.vellum,
  },
  sheetInputRow: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    padding: Spacing.s4, borderTopWidth: 1, borderTopColor: Colors.line,
  },
  sheetInput: {
    flex: 1, paddingVertical: 9, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill, fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink,
  },
  sheetAdd: {
    width: 36, height: 36, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', ...Shadow.s1,
  },

  decoTR: { position: 'absolute', top: 150, right: 24 },
  decoBL: { position: 'absolute', bottom: 140, left: 24 },

  // Templates section
  templatesSection: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s5, paddingBottom: Spacing.s9 },
  templatesSectionLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3,
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: Spacing.s3,
  },
  templatesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  templateCard: {
    width: '47%', aspectRatio: 3 / 4,
    borderRadius: Radius.r4, borderWidth: 1, borderColor: Colors.line,
    overflow: 'hidden', position: 'relative',
  },
  templateTape: { position: 'absolute', top: -4, left: 8 },
  templateCardInner: { flex: 1, padding: Spacing.s4, justifyContent: 'flex-end' },
  templateCardTitle: {
    fontFamily: FontFamily.markerBold, fontSize: sf(13),
    lineHeight: 17, textTransform: 'uppercase', letterSpacing: 0.3,
  },
});
