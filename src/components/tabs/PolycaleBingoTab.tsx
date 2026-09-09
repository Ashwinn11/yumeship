import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIPad } from '@/hooks/use-ipad';
import { persistImage } from '@/lib/localMedia';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { loadTemplateData, saveTemplateData } from '@/store/templateData';
import { BG_COLORS } from '@/constants/bgPalette';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';

const INK = '#1f1219';
const TEMPLATE_KEY = 'polycule-bingo';

const POOL = [
  'group cuddle pile', 'fell asleep on the group call', 'matching phone wallpapers', 'the group chat is unhinged',
  'all three under one umbrella', "nobody knows whose hoodie this is", 'a date that became a quad date', 'jealous for 0.2s, then over it',
  '"who is cooking tonight??"', 'we all fell for the same trope', 'not a third wheel — a third partner', 'scheduling needs a spreadsheet',
  'everyone has a different nickname for you', 'synchronized forehead kisses', 'someone bought matching rings "as a joke"', 'the 3am deep talk',
  '"i love you" said in a chain', 'one designated driver, always', 'shared playlist hit 400 songs', 'met all the parents in one week',
  'cried over fan art of us', 'calendars fully synced', 'argued about pizza toppings', 'someone stole the blanket',
  'a group nap happened', 'hand-holding train through a crowd', 'double-booked two dates, went to both', 'wrote each other letters',
  'the "good morning" texts overlap', 'a polycule movie night', 'someone is the designated hugger', 'we share one (1) braincell',
  'all wore the same color by accident', 'planned a trip for all of us', 'someone said "our" not "my"', 'slow dance in the kitchen',
];

// Winning lines: 5 rows, 5 columns, 2 diagonals (indices into the 25-cell grid).
const LINES: number[][] = (() => {
  const L: number[][] = [];
  for (let r = 0; r < 5; r++) L.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c++) L.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  L.push([0, 6, 12, 18, 24]);
  L.push([4, 8, 12, 16, 20]);
  return L;
})();

// The glyph shown on a marked square (and, bigger, on the free centre square).
// Plain dingbat characters — not emoji — so the `color` style can still tint
// them, same as the original hardcoded ♥ did.
const MARKERS: { key: string; glyph: string }[] = [
  { key: 'heart', glyph: '♥' },
  { key: 'star', glyph: '★' },
  { key: 'sparkle', glyph: '✦' },
  { key: 'flower', glyph: '✿' },
  { key: 'check', glyph: '✓' },
  { key: 'diamond', glyph: '◆' },
];
const DEFAULT_MARKER_KEY = 'heart';
function markerGlyph(key: string): string {
  return MARKERS.find((m) => m.key === key)?.glyph ?? MARKERS[0].glyph;
}

type Cell = { text: string; free: boolean; marked: boolean };

// The saved shape: the 25 squares plus the card's own customization, so a
// chosen marker/background survives app restarts the same way the squares do.
type BoardState = {
  cells: Cell[];
  markerKey: string;
  /** only meaningful when markerKey === 'custom' */
  markerImageUri: string;
  bgColor: string;
  bgImage: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCells(): Cell[] {
  const picks = shuffle(POOL).slice(0, 24);
  const cells: Cell[] = [];
  let p = 0;
  for (let i = 0; i < 25; i++) {
    // free centre carries no text of its own — it only ever shows the chosen marker
    if (i === 12) cells.push({ text: '', free: true, marked: true });
    else cells.push({ text: picks[p++], free: false, marked: false });
  }
  return cells;
}

function loadBoard(shipId: string): BoardState {
  const saved = loadTemplateData(shipId, TEMPLATE_KEY);
  if (saved.state) {
    try {
      const parsed = JSON.parse(saved.state);
      // legacy save: a bare 25-cell array, from before customization existed
      if (Array.isArray(parsed) && parsed.length === 25) {
        return { cells: parsed, markerKey: DEFAULT_MARKER_KEY, markerImageUri: '', bgColor: '', bgImage: '' };
      }
      if (parsed && Array.isArray(parsed.cells) && parsed.cells.length === 25) {
        return {
          cells: parsed.cells,
          markerKey: typeof parsed.markerKey === 'string' ? parsed.markerKey : DEFAULT_MARKER_KEY,
          markerImageUri: typeof parsed.markerImageUri === 'string' ? parsed.markerImageUri : '',
          bgColor: typeof parsed.bgColor === 'string' ? parsed.bgColor : '',
          bgImage: typeof parsed.bgImage === 'string' ? parsed.bgImage : '',
        };
      }
    } catch (_) {}
  }
  return { cells: makeCells(), markerKey: DEFAULT_MARKER_KEY, markerImageUri: '', bgColor: '', bgImage: '' };
}

export function PolycaleBingoTab({ shipId }: { shipId: string }) {
  const { column } = useIPad();
  const insets = useSafeAreaInsets();

  const [board, setBoard] = useState<BoardState>(() => loadBoard(shipId));
  const [edit, setEdit] = useState(false);
  const [gridW, setGridW] = useState(320);
  const [showStyle, setShowStyle] = useState(false);
  const [styleTab, setStyleTab] = useState<'background' | 'marker'>('background');

  const cells = board.cells;

  function persist(next: BoardState) {
    setBoard(next);
    saveTemplateData(shipId, TEMPLATE_KEY, { state: JSON.stringify(next) });
  }

  const win = useMemo(() => {
    const w = new Set<number>();
    LINES.forEach((line) => { if (line.every((i) => cells[i].marked)) line.forEach((i) => w.add(i)); });
    return w;
  }, [cells]);

  const markedCount = cells.filter((c) => c.marked && !c.free).length;

  function toggle(i: number) {
    if (edit || cells[i].free) return;
    persist({ ...board, cells: cells.map((c, j) => (j === i ? { ...c, marked: !c.marked } : c)) });
  }
  function setText(i: number, v: string) {
    persist({ ...board, cells: cells.map((c, j) => (j === i ? { ...c, text: v } : c)) });
  }
  // a fresh card keeps whatever marker/background you picked — those are your
  // preferences for the board, not part of any one card's prompts
  function newCard() { setEdit(false); persist({ ...board, cells: makeCells() }); }
  function clearMarks() { persist({ ...board, cells: cells.map((c) => (c.free ? c : { ...c, marked: false })) }); }

  function applyMarker(key: string) { persist({ ...board, markerKey: key, markerImageUri: '' }); }
  function resetMarker() { persist({ ...board, markerKey: DEFAULT_MARKER_KEY, markerImageUri: '' }); }
  async function pickMarkerImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (res.canceled || !res.assets[0]) return;
    const uri = await persistImage(res.assets[0].uri);
    persist({ ...board, markerKey: 'custom', markerImageUri: uri });
  }

  function applyBgColor(color: string) { persist({ ...board, bgColor: color, bgImage: '' }); }
  function resetBg() { persist({ ...board, bgColor: '', bgImage: '' }); }
  async function pickBgImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (res.canceled || !res.assets[0]) return;
    const uri = await persistImage(res.assets[0].uri);
    persist({ ...board, bgImage: uri, bgColor: '' });
  }

  const GAP = 6;
  const cellSize = Math.floor((gridW - GAP * 4) / 5);
  const usingCustomMarker = board.markerKey === 'custom' && !!board.markerImageUri;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.wrap, column]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()}>
      <View style={s.headerWrap}>
        <View style={s.titlePill}><Text style={s.titlePillText}>POLYCULE BINGO</Text></View>
        <Text style={s.subtitle}>tap a square when it happens to your polycule ♡</Text>
      </View>

      {/* banner */}
      {win.size > 0 ? (
        <View style={s.bannerWin}>
          <View style={s.bingoPill}><Text style={s.bingoText}>★ BINGO! ★</Text></View>
          <Text style={s.bingoSub}>your polycule is disgustingly in love ♡</Text>
        </View>
      ) : (
        <Text style={s.countText}>{markedCount} / 24 squares marked</Text>
      )}

      {/* the card itself — one container, so a chosen color or photo sits behind
          the whole 25-square grid rather than any single square */}
      <View style={[s.cardFrame, { backgroundColor: board.bgImage ? undefined : (board.bgColor || 'transparent') }]}>
        {!!board.bgImage && (
          <Image source={{ uri: board.bgImage }} style={StyleSheet.absoluteFill} contentFit="cover" {...MEDIA_IMAGE} />
        )}
        <View style={s.grid} onLayout={(e) => setGridW(e.nativeEvent.layout.width)}>
          {cells.map((c, i) => {
            const isWin = win.has(i);
            if (edit && !c.free) {
              return (
                <View key={i} style={[s.cell, { width: cellSize, height: cellSize, backgroundColor: '#fff' }]}>
                  <TextInput
                    value={c.text}
                    onChangeText={(v) => setText(i, v)}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={() => Keyboard.dismiss()}
                    style={s.cellInput}
                  />
                </View>
              );
            }
            // marked no longer swaps the fill — only the free centre keeps its own
            // tint; a tapped square stays white and the marker glyph carries the state
            const bg = c.free ? '#fbecc4' : '#fff';
            return (
              <Pressable
                key={i}
                onPress={() => toggle(i)}
                style={[s.cell, {
                  width: cellSize, height: cellSize, backgroundColor: bg,
                  borderColor: isWin ? Colors.sakuraDeep : INK, borderWidth: isWin ? 2.5 : 1.5,
                }]}
              >
                {c.free ? (
                  usingCustomMarker ? (
                    <Image source={{ uri: board.markerImageUri }} style={s.freeMarkerImage} contentFit="contain" />
                  ) : (
                    <Text style={s.freeMarkerGlyph}>{markerGlyph(board.markerKey)}</Text>
                  )
                ) : (
                  <>
                    {c.marked && (
                      usingCustomMarker ? (
                        <Image source={{ uri: board.markerImageUri }} style={s.markOverlayImage} contentFit="contain" />
                      ) : (
                        <Text style={s.heartOverlay}>{markerGlyph(board.markerKey)}</Text>
                      )
                    )}
                    <Text style={[s.cellText, c.marked && { opacity: 0.85 }]} numberOfLines={4} adjustsFontSizeToFit minimumFontScale={0.7}>
                      {c.text}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* controls */}
      <View style={s.controls}>
        <Pressable style={[s.btn, s.btnPrimary]} onPress={newCard}>
          <Text style={s.btnPrimaryText}>🎲 new card</Text>
        </Pressable>
        <Pressable style={[s.btn, edit ? s.btnActive : s.btnGhost]} onPress={() => { Keyboard.dismiss(); setEdit((e) => !e); }}>
          <Text style={edit ? s.btnActiveText : s.btnGhostText}>{edit ? '✓ done editing' : '✎ edit squares'}</Text>
        </Pressable>
        <Pressable style={[s.btn, s.btnGhost]} onPress={clearMarks}>
          <Text style={s.btnGhostText}>✗ clear</Text>
        </Pressable>
        <Pressable style={[s.btn, s.btnGhost]} onPress={() => setShowStyle(true)}>
          <Text style={s.btnGhostText}>🎨 style</Text>
        </Pressable>
      </View>

      {/* Card style customizer — background and marker */}
      <Modal visible={showStyle} transparent animationType="slide" onRequestClose={() => setShowStyle(false)}>
        <View style={s.modalRoot}>
          <TouchableWithoutFeedback onPress={() => setShowStyle(false)}>
            <View style={s.overlay} />
          </TouchableWithoutFeedback>
          <View style={[s.sheet, SheetColumn, { paddingBottom: insets.bottom + Spacing.s4, maxHeight: '80%' }]}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>customize card</Text>
              <Pressable onPress={() => setShowStyle(false)} hitSlop={8}>
                <Text style={s.sheetClose}>✕</Text>
              </Pressable>
            </View>

            <View style={s.bgTabRow}>
              {(['background', 'marker'] as const).map((t) => (
                <Pressable key={t} onPress={() => setStyleTab(t)} style={[s.bgTabBtn, styleTab === t && s.bgTabBtnActive]}>
                  <Text style={[s.bgTabText, styleTab === t && s.bgTabTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <ScrollView contentContainerStyle={s.bgSheetContent} showsVerticalScrollIndicator={false}>
              {styleTab === 'background' ? (
                <>
                  <View style={s.bgActionRow}>
                    <Pressable style={s.bgActionBtn} onPress={pickBgImage}>
                      <Text style={s.bgActionIcon}>🖼️</Text>
                      <Text style={s.bgActionLabel}>photo</Text>
                    </Pressable>
                    <Pressable style={[s.bgActionBtn, !board.bgColor && !board.bgImage && s.bgActionBtnActive]} onPress={resetBg}>
                      <Text style={s.bgActionIcon}>↺</Text>
                      <Text style={s.bgActionLabel}>default</Text>
                    </Pressable>
                    {board.bgImage ? (
                      <View style={[s.bgActionBtn, s.bgActionBtnActive]}>
                        <Image source={{ uri: board.bgImage }} style={s.bgActionThumb} contentFit="cover" />
                        <Text style={s.bgActionLabel}>current</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={s.bgSectionLabel}>colors</Text>
                  <View style={s.bgSwatchGrid}>
                    {BG_COLORS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => applyBgColor(c)}
                        style={[s.bgSwatch, { backgroundColor: c }, c === '#ffffff' && s.bgSwatchBordered, board.bgColor === c && s.bgSwatchSelected]}
                      >
                        {board.bgColor === c && <View style={s.bgSwatchCheck}><Text style={s.bgSwatchCheckText}>✓</Text></View>}
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <View style={s.bgActionRow}>
                    <Pressable style={s.bgActionBtn} onPress={pickMarkerImage}>
                      <Text style={s.bgActionIcon}>🖼️</Text>
                      <Text style={s.bgActionLabel}>photo</Text>
                    </Pressable>
                    <Pressable style={[s.bgActionBtn, board.markerKey === DEFAULT_MARKER_KEY && !board.markerImageUri && s.bgActionBtnActive]} onPress={resetMarker}>
                      <Text style={s.bgActionIcon}>♥</Text>
                      <Text style={s.bgActionLabel}>default</Text>
                    </Pressable>
                    {usingCustomMarker ? (
                      <View style={[s.bgActionBtn, s.bgActionBtnActive]}>
                        <Image source={{ uri: board.markerImageUri }} style={s.bgActionThumb} contentFit="contain" />
                        <Text style={s.bgActionLabel}>current</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={s.bgSectionLabel}>marker</Text>
                  <View style={s.bgSwatchGrid}>
                    {MARKERS.map((m) => (
                      <Pressable
                        key={m.key}
                        onPress={() => applyMarker(m.key)}
                        style={[s.bgSwatch, s.markerSwatchBg, board.markerKey === m.key && !board.markerImageUri && s.bgSwatchSelected]}
                      >
                        <Text style={s.markerSwatchGlyph}>{m.glyph}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s8 },
  headerWrap: { alignItems: 'center', marginBottom: 14 },
  titlePill: { backgroundColor: Colors.plum, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 22 },
  titlePillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(18), color: '#fff', letterSpacing: 0.5 },
  subtitle: { fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.plum, marginTop: 5, textAlign: 'center' },

  bannerWin: { alignItems: 'center', marginBottom: 12, gap: 4 },
  bingoPill: { backgroundColor: Colors.sakuraDeep, borderRadius: 999, borderWidth: 2, borderColor: INK, paddingVertical: 7, paddingHorizontal: 24 },
  bingoText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(18), color: '#fff', letterSpacing: 1 },
  bingoSub: { fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.plum },
  countText: { textAlign: 'center', fontFamily: FontFamily.uiMedium, fontSize: sf(11), letterSpacing: 1.2, textTransform: 'uppercase', color: '#9a7e92', marginBottom: 12 },

  // the card container — invisible until a color or photo is chosen, so the
  // default look is unchanged from before this existed
  cardFrame: { borderRadius: Radius.r4, padding: 8, overflow: 'hidden' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' },
  cell: { borderRadius: 8, borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center', padding: 3, overflow: 'hidden' },
  cellText: { fontFamily: FontFamily.uiMedium, fontSize: sf(9), lineHeight: sf(11), color: INK, textAlign: 'center' },
  cellInput: { width: '100%', height: '100%', fontFamily: FontFamily.uiMedium, fontSize: sf(9), lineHeight: sf(11), color: INK, textAlign: 'center', padding: 0 },
  heartOverlay: { position: 'absolute', fontSize: sf(28), color: 'rgba(215,122,141,0.4)' },
  markOverlayImage: { position: 'absolute', width: sf(28), height: sf(28), opacity: 0.4 },

  // the free centre square shows only the marker — solid, not translucent,
  // since there's no text underneath it to keep legible
  freeMarkerGlyph: { fontSize: sf(30), color: Colors.sakuraInk },
  freeMarkerImage: { width: sf(34), height: sf(34) },

  controls: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 },
  btn: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16, borderWidth: 1.5, borderColor: INK },
  btnPrimary: { backgroundColor: Colors.plum, borderColor: Colors.plum },
  btnPrimaryText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },
  btnActive: { backgroundColor: Colors.sageDeep, borderColor: INK },
  btnActiveText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },
  btnGhost: { backgroundColor: '#fff' },
  btnGhostText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#5a3f53' },

  // ─── style sheet ────────────────────────────────────────────────────────
  modalRoot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line },
  sheetTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink },
  sheetClose: { fontSize: sf(13), color: Colors.ink3, fontFamily: FontFamily.ui },

  bgTabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3 },
  bgTabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line },
  bgTabBtnActive: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakuraDeep },
  bgTabText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2, textTransform: 'capitalize' },
  bgTabTextActive: { color: Colors.sakuraDeep },

  bgSheetContent: { padding: Spacing.s5, paddingBottom: 40 },
  bgActionRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.s4 },
  bgActionBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: Colors.vellum, borderRadius: Radius.r2, borderWidth: 1, borderColor: Colors.line, gap: 4 },
  bgActionBtnActive: { borderColor: Colors.sakuraDeep, borderWidth: 1.5, backgroundColor: Colors.sakuraSoft },
  bgActionIcon: { fontSize: sf(18) },
  bgActionLabel: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3 },
  bgActionThumb: { width: '100%', height: 40, borderRadius: Radius.r1 },

  bgSectionLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3, marginBottom: Spacing.s3, textTransform: 'uppercase', letterSpacing: 0.8 },
  bgSwatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bgSwatch: { width: 42, height: 42, borderRadius: Radius.r2, alignItems: 'center', justifyContent: 'center' },
  bgSwatchBordered: { borderWidth: 1, borderColor: Colors.line },
  bgSwatchSelected: { borderWidth: 2.5, borderColor: Colors.ink },
  bgSwatchCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  bgSwatchCheckText: { fontSize: sf(10), color: '#fff', fontFamily: FontFamily.uiSemiBold },

  markerSwatchBg: { backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line },
  markerSwatchGlyph: { fontSize: sf(20), color: Colors.sakuraInk },
});
