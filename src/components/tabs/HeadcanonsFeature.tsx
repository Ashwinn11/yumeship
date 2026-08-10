import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { WashiTape } from '@/components/deco';
import { IconEdit, IconPlus, IconTrashSolid } from '@/components/ui/Icon';
import { Heart } from '@/components/deco/Heart';
import { FILL_GRAY, INK, SquareCheck, TitleHeader } from '@/components/templates/primitives';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import { getGlobalSetting, saveGlobalSetting } from '@/store/onboarding';
import {
  addHeadcanon, clearCategoryHeadcanons, deleteHeadcanon, getHeadcanons,
  updateHeadcanon, useHeadcanonCounts, useHeadcanons,
} from '@/store/headcanons';

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

export function HeadcanonsFeature({ shipId, shipName: _shipName, setCustomBack: _setCustomBack }: { shipId: string; shipName: string; setCustomBack: (fn: (() => void) | null) => void }) {
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

