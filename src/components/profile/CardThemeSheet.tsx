import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { BG_COLORS, TEXT_COLORS } from '@/constants/bgPalette';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';
import type { CardTheme } from './cardTheme';

type Tab = 'card' | 'page' | 'text';
const TABS: { key: Tab; label: string }[] = [
  { key: 'card', label: 'card' },
  { key: 'page', label: 'page' },
  { key: 'text', label: 'text' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  theme: CardTheme;
  onChange: (patch: Partial<CardTheme>) => void;
  /** browsing the sheet is always free — only applying a color/image is premium */
  premium: boolean;
};

async function pickImage(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'] as ImagePicker.MediaType[],
    allowsEditing: false,
    quality: 0.8,
  });
  if (!result.canceled && result.assets[0]) return result.assets[0].uri;
  return undefined;
}

export function CardThemeSheet({ visible, onClose, theme, onChange, premium }: Props) {
  const [tab, setTab] = useState<Tab>('card');

  const bgColorKey = tab === 'card' ? 'cardBgColor' : 'pageBgColor';
  const bgImageKey = tab === 'card' ? 'cardBgImage' : 'pageBgImage';
  const currentColor = tab === 'card' ? theme.cardBgColor : theme.pageBgColor;
  const currentImage = tab === 'card' ? theme.cardBgImage : theme.pageBgImage;

  function requirePremium() {
    onClose();
    router.push('/paywall?reason=customize-theme' as any);
  }

  async function handlePickImage() {
    if (!premium) { requirePremium(); return; }
    const uri = await pickImage();
    if (uri) onChange({ [bgImageKey]: uri, [bgColorKey]: '' } as Partial<CardTheme>);
  }

  function handlePickColor(c: string) {
    if (!premium) { requirePremium(); return; }
    onChange({ [bgColorKey]: c, [bgImageKey]: '' } as Partial<CardTheme>);
  }

  function handlePickTextColor(c: string) {
    if (!premium) { requirePremium(); return; }
    onChange({ textColor: c });
  }

  function handleReset() {
    onChange({ [bgColorKey]: '', [bgImageKey]: '' } as Partial<CardTheme>);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.sheet, SheetColumn]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>customize</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            {TABS.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {tab === 'text' ? (
              <>
                <Text style={styles.sectionLabel}>text color</Text>
                <View style={styles.swatchGrid}>
                  <Pressable
                    onPress={() => onChange({ textColor: '' })}
                    style={[styles.resetSwatch, !theme.textColor && styles.swatchSelected]}
                  >
                    <Text style={styles.resetSwatchText}>Aa</Text>
                  </Pressable>
                  {TEXT_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => handlePickTextColor(c)}
                      style={[styles.swatch, { backgroundColor: c }, theme.textColor === c && styles.swatchSelected]}
                    >
                      {theme.textColor === c && <View style={styles.swatchCheck}><Text style={styles.swatchCheckText}>✓</Text></View>}
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <View style={styles.actionRow}>
                  <Pressable style={styles.actionBtn} onPress={handlePickImage}>
                    <Svg width={20} height={20} viewBox="0 0 22 22" fill="none">
                      <Rect x="2" y="4" width="18" height="14" rx="2" stroke={Colors.ink} strokeWidth="1.4" />
                      <Path d="M2 15l5-5 4 4 3-3 6 6" stroke={Colors.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      <Circle cx="15" cy="8.5" r="1.5" fill={Colors.ink} />
                    </Svg>
                    <Text style={styles.actionLabel}>image</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, !currentColor && !currentImage && styles.actionBtnActive]}
                    onPress={handleReset}
                  >
                    <Svg width={20} height={20} viewBox="0 0 22 22" fill="none">
                      <Path d="M4 11a7 7 0 1 1 1.5 4.5" stroke={Colors.ink} strokeWidth="1.4" strokeLinecap="round" />
                      <Path d="M4 15.5V11h4.5" stroke={Colors.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.actionLabel}>default</Text>
                  </Pressable>
                  {currentImage ? (
                    <View style={[styles.actionBtn, styles.actionBtnActive]}>
                      <Image source={{ uri: currentImage }} style={styles.actionThumb} />
                      <Text style={styles.actionLabel}>current</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.sectionLabel}>colors</Text>
                <View style={styles.swatchGrid}>
                  {BG_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => handlePickColor(c)}
                      style={[
                        styles.swatch,
                        { backgroundColor: c },
                        c === '#ffffff' && styles.swatchBordered,
                        currentColor === c && styles.swatchSelected,
                      ]}
                    >
                      {currentColor === c && <View style={styles.swatchCheck}><Text style={styles.swatchCheckText}>✓</Text></View>}
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

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, paddingBottom: 34, maxHeight: '80%' },
  handle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line },
  title: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink },
  close: { fontSize: sf(13), color: Colors.ink3, fontFamily: FontFamily.ui },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3 },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: Radius.pill, backgroundColor: Colors.paperDeep,
    borderWidth: 1, borderColor: Colors.line,
  },
  tabBtnActive: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakuraDeep },
  tabText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2, textTransform: 'capitalize' },
  tabTextActive: { color: Colors.sakuraDeep },
  content: { padding: Spacing.s5, paddingBottom: 40 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.s4 },
  actionBtn: {
    width: 64, height: 56, borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.vellum,
    alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden',
  },
  actionBtnActive: { borderColor: Colors.sakuraDeep, borderWidth: 1.5, backgroundColor: Colors.sakuraSoft },
  actionLabel: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3 },
  actionThumb: { width: '100%', height: 40 },
  sectionLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3, marginBottom: Spacing.s3, textTransform: 'uppercase', letterSpacing: 0.8 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: {
    width: 38, height: 38, borderRadius: Radius.r2,
    alignItems: 'center', justifyContent: 'center',
  },
  swatchBordered: { borderWidth: 1, borderColor: Colors.line },
  swatchSelected: { borderWidth: 2.5, borderColor: Colors.ink },
  swatchCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  swatchCheckText: { fontSize: sf(10), color: '#fff', fontFamily: FontFamily.uiSemiBold },
  resetSwatch: {
    width: 38, height: 38, borderRadius: Radius.r2,
    borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.paperDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  resetSwatchText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
});
