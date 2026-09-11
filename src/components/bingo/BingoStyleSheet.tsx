import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { persistImage } from '@/lib/localMedia';
import { DEFAULT_MARKER_KEY, MARKERS, type BingoStyle } from '@/lib/bingo';
import { BG_COLORS } from '@/constants/bgPalette';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  style: BingoStyle;
  onChange: (next: BingoStyle) => void;
};

/** The marker/background customizer bottom sheet — a card's whole visual identity. */
export function BingoStyleSheet({ visible, onClose, style, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'background' | 'marker'>('background');
  const usingCustomMarker = style.markerKey === 'custom' && !!style.markerImageUri;

  async function pickMarkerImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (res.canceled || !res.assets[0]) return;
    const uri = await persistImage(res.assets[0].uri);
    onChange({ ...style, markerKey: 'custom', markerImageUri: uri });
  }
  async function pickBgImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (res.canceled || !res.assets[0]) return;
    const uri = await persistImage(res.assets[0].uri);
    onChange({ ...style, bgImage: uri, bgColor: '' });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalRoot}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>
        <View style={[s.sheet, SheetColumn, { paddingBottom: insets.bottom + Spacing.s4, maxHeight: '80%' }]}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>customize card</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={s.sheetClose}>✕</Text>
            </Pressable>
          </View>

          <View style={s.bgTabRow}>
            {(['background', 'marker'] as const).map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[s.bgTabBtn, tab === t && s.bgTabBtnActive]}>
                <Text style={[s.bgTabText, tab === t && s.bgTabTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView contentContainerStyle={s.bgSheetContent} showsVerticalScrollIndicator={false}>
            {tab === 'background' ? (
              <>
                <View style={s.bgActionRow}>
                  <Pressable style={s.bgActionBtn} onPress={pickBgImage}>
                    <Text style={s.bgActionIcon}>🖼️</Text>
                    <Text style={s.bgActionLabel}>photo</Text>
                  </Pressable>
                  <Pressable style={[s.bgActionBtn, !style.bgColor && !style.bgImage && s.bgActionBtnActive]} onPress={() => onChange({ ...style, bgColor: '', bgImage: '' })}>
                    <Text style={s.bgActionIcon}>↺</Text>
                    <Text style={s.bgActionLabel}>default</Text>
                  </Pressable>
                  {style.bgImage ? (
                    <View style={[s.bgActionBtn, s.bgActionBtnActive]}>
                      <Image source={{ uri: style.bgImage }} style={s.bgActionThumb} contentFit="cover" />
                      <Text style={s.bgActionLabel}>current</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={s.bgSectionLabel}>colors</Text>
                <View style={s.bgSwatchGrid}>
                  {BG_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => onChange({ ...style, bgColor: c, bgImage: '' })}
                      style={[s.bgSwatch, { backgroundColor: c }, c === '#ffffff' && s.bgSwatchBordered, style.bgColor === c && s.bgSwatchSelected]}
                    >
                      {style.bgColor === c && <View style={s.bgSwatchCheck}><Text style={s.bgSwatchCheckText}>✓</Text></View>}
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
                  <Pressable style={[s.bgActionBtn, style.markerKey === DEFAULT_MARKER_KEY && !style.markerImageUri && s.bgActionBtnActive]} onPress={() => onChange({ ...style, markerKey: DEFAULT_MARKER_KEY, markerImageUri: '' })}>
                    <Text style={s.bgActionIcon}>♥</Text>
                    <Text style={s.bgActionLabel}>default</Text>
                  </Pressable>
                  {usingCustomMarker ? (
                    <View style={[s.bgActionBtn, s.bgActionBtnActive]}>
                      <Image source={{ uri: style.markerImageUri }} style={s.bgActionThumb} contentFit="contain" />
                      <Text style={s.bgActionLabel}>current</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={s.bgSectionLabel}>marker</Text>
                <View style={s.bgSwatchGrid}>
                  {MARKERS.map((m) => (
                    <Pressable
                      key={m.key}
                      onPress={() => onChange({ ...style, markerKey: m.key, markerImageUri: '' })}
                      style={[s.bgSwatch, s.markerSwatchBg, style.markerKey === m.key && !style.markerImageUri && s.bgSwatchSelected]}
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
  );
}

const s = StyleSheet.create({
  modalRoot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line },
  sheetTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink },
  sheetClose: { fontSize: sf(13), color: Colors.ink3, fontFamily: FontFamily.ui },

  // one pill "track" behind both segments, same chrome as the message sender
  // toggle, instead of two separately-bordered buttons
  bgTabRow: { flexDirection: 'row', backgroundColor: Colors.paperDeep, borderRadius: Radius.pill, padding: 3, borderWidth: 1, borderColor: Colors.line, marginHorizontal: Spacing.s5, marginTop: Spacing.s3 },
  bgTabBtn: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: Radius.pill },
  bgTabBtnActive: { backgroundColor: Colors.sakuraDeep },
  bgTabText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2, textTransform: 'capitalize' },
  bgTabTextActive: { color: '#fff', fontFamily: FontFamily.uiSemiBold },

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
