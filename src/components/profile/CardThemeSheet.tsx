import { persistImage } from '@/lib/localMedia';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { BeadedFrame } from '@/components/deco/BeadedFrame';
import { BracketFrame } from '@/components/deco/BracketFrame';
import { DoubleLineFrame } from '@/components/deco/DoubleLineFrame';
import { FlourishCorners } from '@/components/deco/FlourishCorners';
import { HeartRippleBackdrop } from '@/components/deco/HeartRippleBackdrop';
import { HeartsBackdrop } from '@/components/deco/HeartsBackdrop';
import { LaceFrame } from '@/components/deco/LaceFrame';
import { LatticeFrame } from '@/components/deco/LatticeFrame';
import { MixedBackdrop } from '@/components/deco/MixedBackdrop';
import { PatternBackdrop } from '@/components/deco/PatternBackdrop';
import { SakuraDriftBackdrop } from '@/components/deco/SakuraDriftBackdrop';
import { ScatterBackdrop } from '@/components/deco/ScatterBackdrop';
import { StarsBackdrop } from '@/components/deco/StarsBackdrop';
import { StitchFrame } from '@/components/deco/StitchFrame';
import { WashBackdrop } from '@/components/deco/WashBackdrop';
import { BG_COLORS, TEXT_COLORS } from '@/constants/bgPalette';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';
import { BORDER_FRAMES, CARD_LAYOUTS, GRADIENT_PRESETS, NAME_FONTS, buildBorderFrame, parseBorderFrame, type BorderFrameKey } from './cardTheme';
import type { CardTheme } from './cardTheme';

type Tab = 'card' | 'page' | 'text' | 'style';
const TABS: { key: Tab; label: string }[] = [
  { key: 'card', label: 'card' },
  { key: 'page', label: 'page' },
  { key: 'style', label: 'style' },
  { key: 'text', label: 'text' },
];

const NAME_FONT_PREVIEW: Record<string, string> = {
  '': FontFamily.displayItalic,
  script: FontFamily.script,
  marker: FontFamily.uiSemiBold,
  klee: FontFamily.ja,
};
const NAME_FONT_LABEL: Record<string, string> = { '': 'display', script: 'script', marker: 'marker', klee: 'klee' };
const CARD_LAYOUT_LABEL: Record<string, string> = { '': 'center', left: 'left' };
const BORDER_FRAME_LABEL: Record<BorderFrameKey, string> = {
  lace: 'lace', lattice: 'lattice', stitch: 'stitch', flourish: 'flourish',
  bracket: 'bracket', beaded: 'beaded', double: 'double-line',
  pattern: 'pattern', scatter: 'scatter', wash: 'wash',
  heartRipple: 'heart ripple', sakuraDrift: 'sakura drift',
  hearts: 'hearts', stars: 'stars', mixed: 'mixed',
};

type Props = {
  visible: boolean;
  onClose: () => void;
  theme: CardTheme;
  onChange: (patch: Partial<CardTheme>) => void;
  /** browsing the sheet is always free — only applying a color/image/style is premium */
  premium: boolean;
};

async function pickImage(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'] as ImagePicker.MediaType[],
    allowsEditing: false,
    quality: 0.8,
  });
  if (!result.canceled && result.assets[0]) return persistImage(result.assets[0].uri);
  return undefined;
}

const BORDER_PREVIEW: Partial<Record<BorderFrameKey, (w: number, h: number) => React.ReactElement>> = {
  lace: (w, h) => <LaceFrame width={w} height={h} radius={5} bandWidth={4} scallopSize={4} />,
  lattice: (w, h) => <LatticeFrame width={w} height={h} radius={5} bandWidth={4} cell={5} />,
  stitch: (w, h) => <StitchFrame width={w} height={h} radius={5} inset={3} />,
  flourish: (w, h) => <FlourishCorners width={w} height={h} size={9} inset={3} />,
  bracket: (w, h) => <BracketFrame width={w} height={h} size={8} inset={3} />,
  beaded: (w, h) => <BeadedFrame width={w} height={h} radius={5} inset={3} />,
  double: (w, h) => <DoubleLineFrame width={w} height={h} radius={5} />,
  pattern: (w, h) => <PatternBackdrop width={w} height={h} />,
  scatter: (w, h) => <ScatterBackdrop width={w} height={h} />,
  wash: (w, h) => <WashBackdrop width={w} height={h} />,
  heartRipple: (w, h) => <HeartRippleBackdrop width={w} height={h} />,
  sakuraDrift: (w, h) => <SakuraDriftBackdrop width={w} height={h} />,
  hearts: (w, h) => <HeartsBackdrop width={w} height={h} />,
  stars: (w, h) => <StarsBackdrop width={w} height={h} />,
  mixed: (w, h) => <MixedBackdrop width={w} height={h} />,
};

function CardLayoutPreview({ layout }: { layout: string }) {
  if (layout === 'left') {
    return (
      <View style={styles.layoutPreviewLeftRow}>
        <View style={styles.layoutPreviewDot} />
        <View style={styles.layoutPreviewLinesCol}>
          <View style={styles.layoutPreviewLine} />
          <View style={[styles.layoutPreviewLine, styles.layoutPreviewLineShort]} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.layoutPreviewCenterCol}>
      <View style={styles.layoutPreviewDot} />
      <View style={styles.layoutPreviewLine} />
      <View style={[styles.layoutPreviewLine, styles.layoutPreviewLineShort]} />
    </View>
  );
}

function BorderPreview({ kind }: { kind: BorderFrameKey }) {
  const render = BORDER_PREVIEW[kind];
  if (!render) return <View style={styles.borderPreviewBox} />;
  return <View style={[styles.borderPreviewBox, { overflow: 'hidden' }]}>{render(28, 20)}</View>;
}

export function CardThemeSheet({ visible, onClose, theme, onChange, premium }: Props) {
  const [tab, setTab] = useState<Tab>('card');

  const bgColorKey = tab === 'page' ? 'pageBgColor' : 'cardBgColor';
  const bgImageKey = tab === 'page' ? 'pageBgImage' : 'cardBgImage';
  const currentColor = tab === 'page' ? theme.pageBgColor : theme.cardBgColor;
  const currentImage = tab === 'page' ? theme.pageBgImage : theme.cardBgImage;
  const isCardTab = tab === 'card';

  function requirePremium() {
    onClose();
    router.push('/paywall?reason=customize-theme' as any);
  }

  function cardClearPatch(): Partial<CardTheme> {
    return isCardTab ? { cardBgGradient: '', cardTransparent: false } : {};
  }

  async function handlePickImage() {
    if (!premium) { requirePremium(); return; }
    const uri = await pickImage();
    if (uri) onChange({ [bgImageKey]: uri, [bgColorKey]: '', ...cardClearPatch() } as Partial<CardTheme>);
  }

  function handlePickColor(c: string) {
    if (!premium) { requirePremium(); return; }
    onChange({ [bgColorKey]: c, [bgImageKey]: '', ...cardClearPatch() } as Partial<CardTheme>);
  }

  function handlePickTextColor(c: string) {
    if (!premium) { requirePremium(); return; }
    onChange({ textColor: c });
  }

  function handlePickGradient(g: readonly [string, string]) {
    if (!premium) { requirePremium(); return; }
    onChange({ cardBgGradient: g.join(','), cardBgColor: '', cardBgImage: '', cardTransparent: false });
  }

  function handlePickTransparent() {
    if (!premium) { requirePremium(); return; }
    onChange({ cardTransparent: true, cardBgColor: '', cardBgImage: '', cardBgGradient: '' });
  }

  function handleReset() {
    if (isCardTab) {
      onChange({ cardBgColor: '', cardBgImage: '', cardBgGradient: '', cardTransparent: false });
    } else {
      onChange({ [bgColorKey]: '', [bgImageKey]: '' } as Partial<CardTheme>);
    }
  }

  function handleToggleBorderFrame(key: BorderFrameKey) {
    if (!premium) { requirePremium(); return; }
    const parsed = parseBorderFrame(theme.borderStyle);
    onChange({ borderStyle: buildBorderFrame({ ...parsed, [key]: !parsed[key] }) });
  }

  function handlePickNameFont(f: string) {
    if (!premium) { requirePremium(); return; }
    onChange({ nameFont: f });
  }

  function handlePickCardLayout(l: string) {
    if (!premium) { requirePremium(); return; }
    onChange({ cardLayout: l });
  }

  const isTransparentActive = isCardTab && !!theme.cardTransparent;
  const activeGradient = isCardTab && theme.cardBgGradient ? theme.cardBgGradient : '';
  const borderParsed = parseBorderFrame(theme.borderStyle);

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

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            ) : tab === 'style' ? (
              <>
                <Text style={styles.sectionLabel}>border frame</Text>
                <Text style={styles.sectionHint}>stack any of these, or leave them all off for a plain card</Text>
                <View style={styles.chipGrid}>
                  {BORDER_FRAMES.map((frame) => (
                    <Pressable
                      key={frame}
                      onPress={() => handleToggleBorderFrame(frame)}
                      style={[styles.chip, borderParsed[frame] && styles.chipActive]}
                    >
                      <View style={styles.chipIconBox}><BorderPreview kind={frame} /></View>
                      <Text style={styles.chipLabel}>{BORDER_FRAME_LABEL[frame]}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>name style</Text>
                <View style={styles.chipGrid}>
                  {NAME_FONTS.map((f) => (
                    <Pressable
                      key={f || 'display'}
                      onPress={() => handlePickNameFont(f)}
                      style={[styles.chip, (theme.nameFont || '') === f && styles.chipActive]}
                    >
                      <View style={styles.chipIconBox}>
                        <Text style={{ fontFamily: NAME_FONT_PREVIEW[f], fontSize: sf(18), color: Colors.ink }}>Aa</Text>
                      </View>
                      <Text style={styles.chipLabel}>{NAME_FONT_LABEL[f]}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>layout</Text>
                <View style={styles.chipGrid}>
                  {CARD_LAYOUTS.map((l) => (
                    <Pressable
                      key={l || 'center'}
                      onPress={() => handlePickCardLayout(l)}
                      style={[styles.chip, (theme.cardLayout || '') === l && styles.chipActive]}
                    >
                      <View style={styles.chipIconBox}><CardLayoutPreview layout={l} /></View>
                      <Text style={styles.chipLabel}>{CARD_LAYOUT_LABEL[l]}</Text>
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
                  {isCardTab && (
                    <Pressable
                      style={[styles.actionBtn, isTransparentActive && styles.actionBtnActive]}
                      onPress={handlePickTransparent}
                    >
                      <View style={styles.checkerIcon}>
                        <View style={[styles.checkerCell, { top: 0, left: 0 }]} />
                        <View style={[styles.checkerCell, { top: 10, left: 10 }]} />
                      </View>
                      <Text style={styles.actionLabel}>clear</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.actionBtn, !currentColor && !currentImage && !isTransparentActive && !activeGradient && styles.actionBtnActive]}
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

                {isCardTab && (
                  <>
                    <Text style={styles.sectionLabel}>gradients</Text>
                    <View style={styles.swatchGrid}>
                      {GRADIENT_PRESETS.map(([c1, c2]) => {
                        const key = `${c1},${c2}`;
                        return (
                          <Pressable
                            key={key}
                            onPress={() => handlePickGradient([c1, c2])}
                            style={[styles.gradientSwatchWrap, activeGradient === key && styles.swatchSelected]}
                          >
                            <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientSwatch}>
                              {activeGradient === key && <View style={styles.swatchCheck}><Text style={styles.swatchCheckText}>✓</Text></View>}
                            </LinearGradient>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}

                <Text style={[styles.sectionLabel, isCardTab && styles.sectionLabelSpaced]}>colors</Text>
                <View style={styles.swatchGrid}>
                  {BG_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => handlePickColor(c)}
                      style={[
                        styles.swatch,
                        { backgroundColor: c },
                        c === '#ffffff' && styles.swatchBordered,
                        currentColor === c && !isTransparentActive && styles.swatchSelected,
                      ]}
                    >
                      {currentColor === c && !isTransparentActive && <View style={styles.swatchCheck}><Text style={styles.swatchCheckText}>✓</Text></View>}
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
  sheet: {
    backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5,
    paddingBottom: 34, maxHeight: '80%', overflow: 'hidden',
  },
  // flexShrink (not flex/flexGrow) — `sheet` has no fixed height, only a
  // maxHeight cap, so a flexGrow child has nothing determinate to grow into
  // and collapses to zero. flexShrink lets this size to its content up to
  // that cap, only shrinking (and becoming internally scrollable) once
  // content actually exceeds it.
  scrollBody: { flexShrink: 1 },
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
  content: { padding: Spacing.s5 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.s4, flexWrap: 'wrap' },
  actionBtn: {
    width: 64, height: 56, borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.vellum,
    alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden',
  },
  actionBtnActive: { borderColor: Colors.sakuraDeep, borderWidth: 1.5, backgroundColor: Colors.sakuraSoft },
  actionLabel: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3 },
  actionThumb: { width: '100%', height: 40 },
  checkerIcon: { width: 20, height: 20, position: 'relative', overflow: 'hidden', borderRadius: 3 },
  checkerCell: { position: 'absolute', width: 10, height: 10, backgroundColor: Colors.line },
  sectionLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3, marginBottom: Spacing.s3, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionLabelSpaced: { marginTop: Spacing.s4 },
  sectionHint: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3, marginTop: -6, marginBottom: Spacing.s3 },
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
  gradientSwatchWrap: { width: 38, height: 38, borderRadius: Radius.r2, overflow: 'hidden' },
  gradientSwatch: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    width: 66, paddingVertical: 10, borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.vellum,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  chipActive: { borderColor: Colors.sakuraDeep, borderWidth: 1.5, backgroundColor: Colors.sakuraSoft },
  chipIconBox: { width: 32, height: 22, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontFamily: FontFamily.ui, fontSize: sf(9), color: Colors.ink3, textTransform: 'capitalize' },

  borderPreviewBox: { width: 28, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.ink },

  layoutPreviewCenterCol: { alignItems: 'center', gap: 3 },
  layoutPreviewLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  layoutPreviewDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.sakuraDeep },
  layoutPreviewLinesCol: { gap: 3 },
  layoutPreviewLine: { width: 16, height: 3, borderRadius: 2, backgroundColor: Colors.ink3 },
  layoutPreviewLineShort: { width: 10 },
});
