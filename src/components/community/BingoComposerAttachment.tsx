import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { BingoGrid } from '@/components/bingo/BingoGrid';
import { BingoStyleSheet } from '@/components/bingo/BingoStyleSheet';
import { makeBingoCells, type BingoCard } from '@/lib/bingo';
import { Colors, FontFamily, Spacing, sf } from '@/constants/theme';

type Props = {
  card: BingoCard;
  onChange: (next: BingoCard) => void;
};

/**
 * The Bingo tab's body: the live, tappable board plus the controls to
 * reshuffle its prompts, edit them, and customize its look — everything
 * needed to build a card worth posting, none of it tied to a ship.
 */
export function BingoComposerAttachment({ card, onChange }: Props) {
  const [editingText, setEditingText] = useState(false);
  const [showStyle, setShowStyle] = useState(false);

  function toggle(i: number) {
    if (editingText || card.cells[i].free) return;
    onChange({ ...card, cells: card.cells.map((c, j) => (j === i ? { ...c, marked: !c.marked } : c)) });
  }
  function editText(i: number, v: string) {
    onChange({ ...card, cells: card.cells.map((c, j) => (j === i ? { ...c, text: v } : c)) });
  }
  function reshuffle() {
    setEditingText(false);
    onChange({ ...card, cells: makeBingoCells() });
  }

  const markedCount = card.cells.filter((c) => c.marked && !c.free).length;

  return (
    <View style={s.wrap}>
      <Text style={s.countText}>{markedCount} / 24 squares marked</Text>

      <BingoGrid card={card} onToggle={toggle} editingText={editingText} onEditText={editText} />

      <View style={s.controls}>
        <Pressable style={[s.btn, s.btnPrimary]} onPress={reshuffle}>
          <Text style={s.btnPrimaryText}>🎲 new card</Text>
        </Pressable>
        <Pressable style={[s.btn, editingText ? s.btnActive : s.btnGhost]} onPress={() => { Keyboard.dismiss(); setEditingText((e) => !e); }}>
          <Text style={editingText ? s.btnActiveText : s.btnGhostText}>{editingText ? '✓ done editing' : '✎ edit squares'}</Text>
        </Pressable>
        <Pressable style={[s.btn, s.btnGhost]} onPress={() => setShowStyle(true)}>
          <Text style={s.btnGhostText}>🎨 style</Text>
        </Pressable>
      </View>

      <BingoStyleSheet
        visible={showStyle}
        onClose={() => setShowStyle(false)}
        style={card}
        onChange={(nextStyle) => onChange({ ...card, ...nextStyle })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: Spacing.s3, gap: 10 },
  countText: { textAlign: 'center', fontFamily: FontFamily.uiMedium, fontSize: sf(11), letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.ink3 },

  controls: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  btn: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#1f1219' },
  btnPrimary: { backgroundColor: Colors.plum, borderColor: Colors.plum },
  btnPrimaryText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },
  btnActive: { backgroundColor: Colors.sageDeep, borderColor: '#1f1219' },
  btnActiveText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#fff' },
  btnGhost: { backgroundColor: '#fff' },
  btnGhostText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: '#5a3f53' },
});
