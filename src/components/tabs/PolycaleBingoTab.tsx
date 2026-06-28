import { useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';

import { useIPad } from '@/hooks/use-ipad';
import { loadTemplateData, saveTemplateData } from '@/store/templateData';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';

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

type Cell = { text: string; free: boolean; marked: boolean };

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
    if (i === 12) cells.push({ text: 'FREE ♡', free: true, marked: true });
    else cells.push({ text: picks[p++], free: false, marked: false });
  }
  return cells;
}

export function PolycaleBingoTab({ shipId }: { shipId: string }) {
  const { column } = useIPad();

  const [cells, setCells] = useState<Cell[]>(() => {
    const saved = loadTemplateData(shipId, TEMPLATE_KEY);
    if (saved.state) {
      try {
        const parsed = JSON.parse(saved.state) as Cell[];
        if (Array.isArray(parsed) && parsed.length === 25) return parsed;
      } catch (_) {}
    }
    return makeCells();
  });
  const [edit, setEdit] = useState(false);
  const [gridW, setGridW] = useState(320);

  function persist(next: Cell[]) {
    setCells(next);
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
    persist(cells.map((c, j) => (j === i ? { ...c, marked: !c.marked } : c)));
  }
  function setText(i: number, v: string) {
    persist(cells.map((c, j) => (j === i ? { ...c, text: v } : c)));
  }
  function newCard() { setEdit(false); persist(makeCells()); }
  function clearMarks() { persist(cells.map((c) => (c.free ? c : { ...c, marked: false }))); }

  const GAP = 6;
  const cellSize = Math.floor((gridW - GAP * 4) / 5);

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

      {/* grid */}
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
          const bg = c.free ? '#fbecc4' : c.marked ? '#fadde5' : '#fff';
          return (
            <Pressable
              key={i}
              onPress={() => toggle(i)}
              style={[s.cell, {
                width: cellSize, height: cellSize, backgroundColor: bg,
                borderColor: isWin ? Colors.sakuraDeep : INK, borderWidth: isWin ? 2.5 : 1.5,
              }]}
            >
              {c.marked && !c.free && <Text style={s.heartOverlay}>♥</Text>}
              <Text style={[
                s.cellText,
                c.free && s.cellFreeText,
                c.marked && !c.free && { opacity: 0.85 },
              ]} numberOfLines={4} adjustsFontSizeToFit minimumFontScale={0.7}>
                {c.text}
              </Text>
            </Pressable>
          );
        })}
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
      </View>
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

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' },
  cell: { borderRadius: 8, borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center', padding: 3, overflow: 'hidden' },
  cellText: { fontFamily: FontFamily.uiMedium, fontSize: sf(9), lineHeight: 11, color: INK, textAlign: 'center' },
  cellFreeText: { fontFamily: FontFamily.script, fontSize: sf(15), lineHeight: 17, color: '#7a5e15' },
  cellInput: { width: '100%', height: '100%', fontFamily: FontFamily.uiMedium, fontSize: sf(9), lineHeight: 11, color: INK, textAlign: 'center', padding: 0 },
  heartOverlay: { position: 'absolute', fontSize: sf(28), color: 'rgba(215,122,141,0.4)' },

  controls: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 },
  btn: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16, borderWidth: 1.5, borderColor: INK },
  btnPrimary: { backgroundColor: Colors.plum, borderColor: Colors.plum },
  btnPrimaryText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },
  btnActive: { backgroundColor: Colors.sageDeep, borderColor: INK },
  btnActiveText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },
  btnGhost: { backgroundColor: '#fff' },
  btnGhostText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#5a3f53' },
});
