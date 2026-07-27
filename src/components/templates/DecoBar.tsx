import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Linking, Modal, Pressable, ScrollView, StyleSheet,
  Text, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, type SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { PaperLined, PaperScalloped, PaperPolaroid, PaperGrid } from '@/components/deco/Papers';
import { WashiTape } from '@/components/deco/WashiTape';
import { SNIPSY_URL } from '@/constants/links';
import { BUILTIN_STICKERS as STICKERS } from '@/constants/stickers';
import { FontFamily, SheetColumn ,sf } from '@/constants/theme';
import { useCustomStickers } from '@/store/customStickers';
import { INK, Polaroid } from './primitives';

// Custom sticker DecoItems reference a customStickers row, namespaced so
// they never collide with a BUILTIN_STICKERS key.
const CUSTOM_PREFIX = 'custom:';

// ─── Types ────────────────────────────────────────────────────────────────────
export type DecoItem =
  | { id: string; type: 'photo';   uri: string;       x: number; y: number; scale?: number }
  | { id: string; type: 'sticker'; stickerKey: string; x: number; y: number; scale?: number }
  | { id: string; type: 'paper';   paperKey: string; paperText: string; x: number; y: number; scale?: number };

type AddableDecoItem<T extends DecoItem = DecoItem> = T extends DecoItem
  ? Omit<T, 'id' | 'x' | 'y'>
  : never;

type DecoTab = 'photo' | 'sticker' | 'paper';

const PAPERS: {
  key: string; label: string;
  El: React.ComponentType<{ width?: number; height?: number; children?: React.ReactNode }>;
}[] = [
  { key: 'lined',   label: 'Lined',   El: PaperLined },
  { key: 'grid',    label: 'Grid',    El: PaperGrid },
  { key: 'scallop', label: 'Scallop', El: PaperScalloped },
  { key: 'frame',   label: 'Frame',   El: PaperPolaroid },
];

const CANVAS_H = 180;

function parseItems(json: string): DecoItem[] {
  try { const v = JSON.parse(json); return Array.isArray(v) ? v : []; } catch { return []; }
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function newPos(type: DecoItem['type'], count: number, canvasW: number): [number, number] {
  const offset = count * 18;
  if (type === 'photo')   return [12 + offset,             14 + offset];
  if (type === 'sticker') return [canvasW - 72 - offset,   8 + offset];
  return [Math.max(10, canvasW / 2 - 50 + offset), 16 + offset];
}

// ─── Draggable item ───────────────────────────────────────────────────────────
function DraggableItem({
  initX, initY, initScale, canvasW: canvasWSv, editing, onEnd, onRemove, children,
}: {
  initX: number; initY: number; initScale: number;
  canvasW: SharedValue<number>;
  editing: boolean;
  onEnd: (x: number, y: number, scale: number) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const x         = useSharedValue(initX);
  const y         = useSharedValue(initY);
  const ox        = useSharedValue(initX);
  const oy        = useSharedValue(initY);
  const scale     = useSharedValue(initScale);
  const baseScale = useSharedValue(initScale);

  const pan = Gesture.Pan()
    .enabled(editing)
    .minDistance(6)
    .onBegin(() => { ox.value = x.value; oy.value = y.value; })
    .onUpdate((e) => {
      x.value = ox.value + e.translationX;
      y.value = oy.value + e.translationY;
    })
    .onEnd(() => {
      x.value = Math.max(0, Math.min(x.value, canvasWSv.value - 48));
      y.value = Math.max(0, Math.min(y.value, CANVAS_H - 48));
      runOnJS(onEnd)(x.value, y.value, scale.value);
    });

  const pinch = Gesture.Pinch()
    .enabled(editing)
    .onUpdate((e) => {
      scale.value = Math.max(0.3, Math.min(baseScale.value * e.scale, 3));
    })
    .onEnd(() => {
      baseScale.value = scale.value;
      runOnJS(onEnd)(x.value, y.value, scale.value);
    });

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
      <Animated.View style={style}>
        {children}
        {editing && (
          <Pressable style={s.removeX} onPress={onRemove} hitSlop={6}>
            <Text style={s.removeXText}>×</Text>
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  editing: boolean;
  itemsJson: string;
  onItemsChange: (json: string) => void;
};

// ─── DecoBar ──────────────────────────────────────────────────────────────────
export function DecoBar({ editing, itemsJson, onItemsChange }: Props) {
  const [showSheet, setShowSheet] = useState(false);
  const [sheetTab, setSheetTab] = useState<DecoTab>('sticker');
  const canvasW = useSharedValue(300);
  const customStickers = useCustomStickers();

  const items = parseItems(itemsJson);

  function save(next: DecoItem[]) {
    onItemsChange(JSON.stringify(next));
  }

  function addItem(item: AddableDecoItem) {
    const sameType = items.filter(i => i.type === item.type).length;
    const [x, y] = newPos(item.type, sameType, canvasW.value);
    save([...items, { ...item, id: uid(), x, y } as DecoItem]);
  }

  function removeItem(id: string) {
    save(items.filter(i => i.id !== id));
  }

  function updateItem(id: string, x: number, y: number, scale: number) {
    save(items.map(i => i.id === id ? { ...i, x, y, scale } : i));
  }

  function updatePaperText(id: string, text: string) {
    save(items.map(i => i.id === id && i.type === 'paper' ? { ...i, paperText: text } : i));
  }

  async function pickPhoto() {
    setShowSheet(false);
    // wait for modal to dismiss before launching native picker
    await new Promise<void>(r => setTimeout(r, 350));
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      addItem({ type: 'photo', uri: result.assets[0].uri });
    }
  }

  return (
    <View style={s.wrap}>
      {/* ── Canvas ─────────────────────────────────────────────────────── */}
      <Pressable
        style={[s.canvas, items.length === 0 && s.canvasEmpty]}
        onPress={items.length === 0 && editing ? () => setShowSheet(true) : undefined}
        onLayout={(e) => { canvasW.value = e.nativeEvent.layout.width; }}
      >
        {items.length === 0 && editing ? (
          <View style={s.emptyPolaroid}>
            <View pointerEvents="none">
              <Polaroid size={110} rotate={-3} tapeColor="#fadde5" editing />
            </View>
          </View>
        ) : (
          items.map((item) => {
            const isCustomSticker = item.type === 'sticker' && item.stickerKey.startsWith(CUSTOM_PREFIX);
            const StickerEl = item.type === 'sticker' && !isCustomSticker
              ? STICKERS.find(s => s.key === item.stickerKey)?.El
              : undefined;
            const customStickerUri = isCustomSticker && item.type === 'sticker'
              ? customStickers.find(cs => cs.id === item.stickerKey.slice(CUSTOM_PREFIX.length))?.uri
              : undefined;
            const PaperEl = item.type === 'paper'
              ? PAPERS.find(p => p.key === item.paperKey)?.El
              : undefined;

            const tapeProps = item.type === 'photo'
              ? { pattern: 'floral' as const, color: '#fadde5', rotate: -3 }
              : { pattern: 'dot'    as const, color: '#c7b5e3', rotate: -1 };

            return (
              <DraggableItem
                key={item.id}
                initX={item.x} initY={item.y} initScale={item.scale ?? 1}
                canvasW={canvasW}
                editing={editing}
                onEnd={(x, y, sc) => updateItem(item.id, x, y, sc)}
                onRemove={() => removeItem(item.id)}
              >
                <View style={s.decoItem}>
                  {item.type !== 'sticker' && <WashiTape width={40} height={10} {...tapeProps} />}
                  {item.type === 'photo' && (
                    <Polaroid
                      size={90} rotate={-4} tapeColor="transparent"
                      editing={editing} uri={item.uri}
                      onUriChange={editing
                        ? (u) => save(items.map(i => i.id === item.id ? { ...i, uri: u } : i))
                        : undefined}
                    />
                  )}
                  {item.type === 'sticker' && StickerEl && <StickerEl size={80} />}
                  {item.type === 'sticker' && customStickerUri && (
                    <Image source={{ uri: customStickerUri }} style={s.customStickerImg} contentFit="contain" />
                  )}
                  {item.type === 'paper' && PaperEl && (
                    <PaperEl width={100} height={76}>
                      <TextInput
                        value={item.paperText}
                        onChangeText={editing ? (t) => updatePaperText(item.id, t) : undefined}
                        editable={editing}
                        multiline
                        placeholder="write here..."
                        placeholderTextColor={INK + '55'}
                        underlineColorAndroid="transparent"
                        style={s.paperInput}
                      />
                    </PaperEl>
                  )}
                </View>
              </DraggableItem>
            );
          })
        )}
      </Pressable>

      {/* ── Add button (when items exist) ───────────────────────────────── */}
      {editing && items.length > 0 && (
        <Pressable style={s.addBtn} onPress={() => setShowSheet(true)}>
          <Text style={s.addBtnText}>＋ deco</Text>
        </Pressable>
      )}

      {/* ── Bottom sheet ────────────────────────────────────────────────── */}
      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSheet(false)}
      >
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={() => setShowSheet(false)}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>

        <View style={[s.sheet, SheetColumn]}>
          <View style={s.sheetHandle} />

          <View style={s.sheetTabs}>
            <Pressable style={s.sheetTab} onPress={pickPhoto}>
              <Text style={s.sheetTabText}>photo</Text>
            </Pressable>
            {(['sticker', 'paper'] as DecoTab[]).map((t) => (
              <Pressable
                key={t}
                style={[s.sheetTab, sheetTab === t && s.sheetTabOn]}
                onPress={() => setSheetTab(t)}
              >
                <Text style={[s.sheetTabText, sheetTab === t && s.sheetTabTextOn]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {sheetTab === 'sticker' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerRow}>
              {STICKERS.map(({ key, El }) => (
                <Pressable
                  key={key}
                  style={s.decoCell}
                  onPress={() => { addItem({ type: 'sticker', stickerKey: key }); setShowSheet(false); }}
                >
                  <El size={56} />
                </Pressable>
              ))}
              {customStickers.map((cs) => (
                <Pressable
                  key={cs.id}
                  style={s.decoCell}
                  onPress={() => { addItem({ type: 'sticker', stickerKey: `${CUSTOM_PREFIX}${cs.id}` }); setShowSheet(false); }}
                >
                  <Image source={{ uri: cs.uri }} style={s.customStickerCellImg} contentFit="contain" />
                </Pressable>
              ))}
              <Pressable
                style={[s.decoCell, s.snipsyCell]}
                onPress={() => Linking.openURL(SNIPSY_URL)}
              >
                <Text style={s.snipsyEmoji}>✂️</Text>
                <Text style={s.snipsyLabel}>make more{'\n'}in Snipsy</Text>
              </Pressable>
            </ScrollView>
          )}

          {sheetTab === 'paper' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerRow}>
              {PAPERS.map(({ key, label, El }) => (
                <Pressable
                  key={key}
                  style={s.decoCell}
                  onPress={() => { addItem({ type: 'paper', paperKey: key, paperText: '' }); setShowSheet(false); }}
                >
                  <El width={72} height={56} />
                  <Text style={s.paperLabel}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 14 },

  canvas: {
    height: CANVAS_H,
    position: 'relative',
    marginBottom: 8,
  },
  canvasEmpty: {},
  emptyPolaroid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  decoItem: { alignItems: 'center' },
  customStickerImg: { width: 80, height: 80 },
  customStickerCellImg: { width: 56, height: 56 },

  removeX: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8b3a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeXText: {
    color: '#fff',
    fontSize: sf(12),
    lineHeight: 14,
    fontFamily: FontFamily.ui,
  },

  addBtn: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1.2,
    borderColor: INK + '30',
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  addBtnText: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(10),
    color: INK,
    letterSpacing: 0.5,
  },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: {
    backgroundColor: '#fffbf6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
    paddingTop: 10,
  },
  sheetHandle: {
    width: 36, height: 4,
    backgroundColor: INK + '33',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTabs: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sheetTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: INK + '30',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sheetTabOn:     { backgroundColor: '#fadde5', borderColor: '#e8a8b5' },
  sheetTabText:   { fontFamily: FontFamily.markerBold, fontSize: sf(10), color: INK, letterSpacing: 0.5 },
  sheetTabTextOn: { color: '#8b3a4a' },


  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  decoCell: {
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: INK + '20',
  },
  paperLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(8),
    color: INK,
    letterSpacing: 0.4,
  },

  snipsyCell: {
    borderStyle: 'dashed',
    borderColor: INK + '40',
    backgroundColor: '#fdf6ee',
    minWidth: 58,
    justifyContent: 'center',
  },
  snipsyEmoji: { fontSize: sf(20) },
  snipsyLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(8),
    color: INK,
    letterSpacing: 0.2,
    textAlign: 'center',
    marginTop: 2,
  },

  paperInput: {
    fontFamily: FontFamily.ja,
    fontSize: sf(10),
    color: INK,
    padding: 0,
    flex: 1,
    textAlignVertical: 'top',
  },
});
