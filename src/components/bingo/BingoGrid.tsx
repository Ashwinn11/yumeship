import { Image } from 'expo-image';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';

import { MEDIA_IMAGE } from '@/lib/imageProps';
import { markerGlyph, type BingoCard } from '@/lib/bingo';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';

const INK = '#1f1219';

type Props = {
  card: BingoCard;
  /** omit for a read-only card (feed/detail) — no press feedback, no toggling */
  onToggle?: (i: number) => void;
  /** non-free squares render as TextInputs instead of Pressables */
  editingText?: boolean;
  onEditText?: (i: number, v: string) => void;
};

/**
 * The 25-square board itself, shared by the post composer's bingo attachment
 * and the read-only feed/detail card, so a posted card and its "use this
 * template" clone always look identical.
 */
export function BingoGrid({ card, onToggle, editingText, onEditText }: Props) {
  const { cells, markerKey, markerImageUri, bgColor, bgImage } = card;
  const [gridW, setGridW] = useState(320);
  const usingCustomMarker = markerKey === 'custom' && !!markerImageUri;

  const GAP = 6;
  const cellSize = Math.floor((gridW - GAP * 4) / 5);

  return (
    <View style={[s.cardFrame, { backgroundColor: bgImage ? undefined : (bgColor || 'transparent') }]}>
      {!!bgImage && (
        <Image source={{ uri: bgImage }} style={StyleSheet.absoluteFill} contentFit="cover" {...MEDIA_IMAGE} />
      )}
      <View style={s.grid} onLayout={(e) => setGridW(e.nativeEvent.layout.width)}>
        {cells.map((c, i) => {
          if (editingText && !c.free) {
            return (
              <View key={i} style={[s.cell, { width: cellSize, height: cellSize, backgroundColor: '#fff' }]}>
                <TextInput
                  value={c.text}
                  // a bingo prompt is one flowing line that wraps — strip any
                  // literal newline the return key would otherwise insert
                  onChangeText={(v) => onEditText?.(i, v.replace(/\n/g, ''))}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={() => Keyboard.dismiss()}
                  style={s.cellInput}
                />
              </View>
            );
          }
          // marked doesn't swap the fill — only the free centre keeps its own
          // tint; a tapped square stays white and the marker glyph carries the state
          const bg = c.free ? '#fbecc4' : '#fff';
          return (
            <Pressable
              key={i}
              onPress={onToggle && !c.free ? () => onToggle(i) : undefined}
              disabled={!onToggle || c.free}
              style={[s.cell, { width: cellSize, height: cellSize, backgroundColor: bg }]}
            >
              {c.free ? (
                usingCustomMarker ? (
                  <Image source={{ uri: markerImageUri }} style={s.freeMarkerImage} contentFit="contain" />
                ) : (
                  <Text style={s.freeMarkerGlyph}>{markerGlyph(markerKey)}</Text>
                )
              ) : (
                <>
                  {c.marked && (
                    usingCustomMarker ? (
                      <Image source={{ uri: markerImageUri }} style={s.markOverlayImage} contentFit="contain" />
                    ) : (
                      <Text style={s.heartOverlay}>{markerGlyph(markerKey)}</Text>
                    )
                  )}
                  <Text style={[s.cellText, c.marked && { opacity: 0.85 }]} numberOfLines={4} ellipsizeMode="tail">
                    {c.text}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // invisible until a color or photo is chosen, so an uncustomized card looks plain
  cardFrame: { borderRadius: Radius.r4, padding: 8, overflow: 'hidden' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' },
  cell: { borderRadius: 8, borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center', padding: 3, overflow: 'hidden' },
  cellText: { fontFamily: FontFamily.uiMedium, fontSize: sf(9), lineHeight: sf(11), color: INK, textAlign: 'center' },
  cellInput: { width: '100%', height: '100%', fontFamily: FontFamily.uiMedium, fontSize: sf(9), lineHeight: sf(11), color: INK, textAlign: 'center', textAlignVertical: 'center', padding: 0 },
  heartOverlay: { position: 'absolute', fontSize: sf(28), color: 'rgba(215,122,141,0.4)' },
  markOverlayImage: { position: 'absolute', width: sf(28), height: sf(28), opacity: 0.4 },

  // the free centre square shows only the marker — solid, not translucent,
  // since there's no text underneath it to keep legible
  freeMarkerGlyph: { fontSize: sf(30), color: Colors.sakuraInk },
  freeMarkerImage: { width: sf(34), height: sf(34) },
});
