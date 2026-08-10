import { useIPad } from '@/hooks/use-ipad';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { Image } from 'expo-image';
import { persistImage } from '@/lib/localMedia';
import { Cloud } from '@/components/deco/Cloud';
import { Heart } from '@/components/deco/Heart';
import { Ribbon } from '@/components/deco/Ribbon';
import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { Star } from '@/components/deco/Star';
import { WashiTape } from '@/components/deco/WashiTape';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconEdit, IconExport, IconTrashSolid } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, Shadow, SheetColumn, Spacing ,sf } from '@/constants/theme';
import { BG_COLORS, TEXT_COLORS } from '@/constants/bgPalette';
import { TemplateTextColorCtx } from '@/components/templates/primitives';
import { usePremium } from '@/store/premium';
import { askForReview } from '@/store/review';
import { deleteShip, getShip, isPoly, updateShip } from '@/store/ships';
import { TemplateDataCtx, buildPreFill, loadTemplateData, migrateTemplateData, saveTemplateData } from '@/store/templateData';
import { router } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const VISUAL_TEMPLATES = [
  { key: 'get-to-know', label: 'All About Us', desc: 'popular · fill out their info', color: Colors.sakuraDeep, bg: Colors.sakuraSoft, tape: 'floral' },
  { key: 'kawaii-ui', label: 'Kawaii UI', desc: 'stats card · aesthetics', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, tape: 'dot' },
  { key: 'heart-frame', label: 'Heart Frame', desc: 'romantic · twin portraits', color: Colors.peachDeep, bg: Colors.peachSoft, tape: 'heart' },
  { key: 'aesthetic', label: 'Aesthetic', desc: 'mood board · palette · photos', color: Colors.butterDeep, bg: Colors.butterSoft, tape: 'star' },
  { key: 'flip-phone', label: 'Flip Phone', desc: 'Y2K windows · chat · music', color: Colors.sakuraDeep, bg: Colors.sakura, tape: 'floral' },
  { key: 'talking-about', label: 'Talking About', desc: 'dual portrait · sliders · tropes', color: Colors.sageDeep, bg: Colors.sageSoft, tape: 'dot' },
  { key: 'bond-banner', label: 'Bond Banner', desc: 'heart shield · personality bars', color: Colors.plum, bg: Colors.lavenderSoft, tape: 'heart' },
] as const;

// Polyship ships switch among their own dedicated templates.
const POLY_VISUAL = [
  { key: 'poly-chart', label: 'Poly Ship Chart', desc: 'the whole polycule · roster · map', color: Colors.plum, bg: Colors.lavenderSoft, tape: 'heart' },
  { key: 'poly-quick', label: 'In 5 Minutes', desc: 'quick · roles · meters · facts', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, tape: 'dot' },
  { key: 'poly-dynamics', label: 'Polycule Dynamics', desc: 'charts · differences · who\'s the one', color: Colors.sageDeep, bg: Colors.sageSoft, tape: 'check' },
] as const;

type Props = {
  templateKey: string;
  shipId?: string;
  children: React.ReactNode;
};

export function TemplateScreenWrapper({ templateKey, shipId, children }: Props) {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const ship = shipId ? getShip(shipId) : undefined;
  const pickerTemplates = isPoly(ship) ? POLY_VISUAL : VISUAL_TEMPLATES;
  const premium = usePremium();
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState(templateKey);
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [bgSheetTab, setBgSheetTab] = useState<'background' | 'text'>('background');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const exportRef = useRef<View>(null);

  const initBg = () => {
    if (!shipId) return { color: '', image: '' };
    const saved = loadTemplateData(shipId, templateKey);
    return { color: saved['_bgColor'] ?? '', image: saved['_bgImage'] ?? '' };
  };
  const bgRef = useRef(initBg());
  const [bgColor, setBgColor] = useState(bgRef.current.color);
  const [bgImage, setBgImage] = useState(bgRef.current.image);

  const initTextColor = () => {
    if (!shipId) return '';
    const saved = loadTemplateData(shipId, templateKey);
    return saved['_textColor'] ?? '';
  };
  const textColorRef = useRef(initTextColor());
  const [textColor, setTextColor] = useState(textColorRef.current);

  const initData = (): Record<string, string> => {
    if (!shipId) return {};
    const saved = loadTemplateData(shipId, templateKey);
    const prefill = ship ? buildPreFill(ship, templateKey) : {};
    // Merge: prefill fills in fields that are missing or empty in saved data
    const merged: Record<string, string> = { ...saved };
    for (const [k, v] of Object.entries(prefill)) {
      if (!merged[k]) merged[k] = v;
    }
    return merged;
  };
  const dataRef = useRef<Record<string, string>>(null as unknown as Record<string, string>);
  if (dataRef.current === null) {
    dataRef.current = initData();
  }

  const ctx = useMemo(() => ({
    get: (key: string, fb = '') => (dataRef.current as Record<string, string>)[key] ?? fb,
    set: (key: string, val: string) => {
      (dataRef.current as Record<string, string>)[key] = val;
      if (shipId) {
        saveTemplateData(shipId, templateKey, dataRef.current as Record<string, string>);
        if (key === 'anniv') {
          updateShip(shipId, { startDate: val });
        }
      }
    },
    bgColor,
    bgImage,
    textColor,
  }), [shipId, templateKey, bgColor, bgImage, textColor]);

  async function exportImage() {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const uri = await captureRef(exportRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'save or share' });
      askForReview();
    } catch (e) {
      // user cancelled or error — do nothing
    } finally {
      setExporting(false);
    }
  }

  function saveBgColor(color: string) {
    ctx.set('_bgColor', color);
    ctx.set('_bgImage', '');
    setBgColor(color);
    setBgImage('');
  }

  function clearBg() {
    ctx.set('_bgColor', '');
    ctx.set('_bgImage', '');
    setBgColor('');
    setBgImage('');
  }

  function saveTextColor(color: string) {
    ctx.set('_textColor', color);
    setTextColor(color);
  }

  async function pickBgImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = await persistImage(result.assets[0].uri);
      ctx.set('_bgImage', uri);
      ctx.set('_bgColor', '');
      setBgImage(uri);
      setBgColor('');
    }
  }

  function applyTemplate() {
    if (!shipId || selected === templateKey) { setShowPicker(false); return; }
    if (!premium) {
      setShowPicker(false);
      router.push('/paywall?reason=switch-template' as any);
      return;
    }
    migrateTemplateData(shipId, templateKey, selected);
    updateShip(shipId, { templateKey: selected });
    router.replace(`/template/${selected}?shipId=${shipId}` as any);
  }

  const renderTemplateDecos = () => {
    switch (templateKey) {
      case 'get-to-know':
        return (
          <>
            <View style={s.decoTL} pointerEvents="none"><Sakura size={24} color={Colors.sakura} /></View>
            <View style={s.decoBR} pointerEvents="none"><Sparkle size={18} color={Colors.lavenderDeep} /></View>
          </>
        );
      case 'kawaii-ui':
        return (
          <>
            <View style={s.decoTL} pointerEvents="none"><Cloud size={28} color={Colors.sakura} /></View>
            <View style={s.decoBR} pointerEvents="none"><Ribbon size={24} color={Colors.lavenderDeep} /></View>
          </>
        );
      case 'heart-frame':
        return (
          <>
            <View style={s.decoTL} pointerEvents="none"><Heart size={20} color={Colors.sakura} /></View>
            <View style={s.decoBR} pointerEvents="none"><Heart size={18} color={Colors.lavenderDeep} outline /></View>
          </>
        );
      case 'love-letter':
        return (
          <>
            <View style={s.decoTL} pointerEvents="none"><Ribbon size={24} color={Colors.sakura} /></View>
            <View style={s.decoBR} pointerEvents="none"><Sparkle size={18} color={Colors.butter} /></View>
          </>
        );
      case 'aesthetic':
        return (
          <>
            <View style={s.decoTL} pointerEvents="none"><Star size={20} color={Colors.butter} /></View>
            <View style={s.decoBR} pointerEvents="none"><Cloud size={28} color={Colors.sakura} /></View>
          </>
        );
      default:
        return (
          <>
            <View style={s.decoTL} pointerEvents="none"><Star size={18} color={Colors.lavenderDeep} /></View>
            <View style={s.decoBR} pointerEvents="none"><Heart size={16} color={Colors.sakura} outline /></View>
          </>
        );
    }
  };

  return (
    <TemplateDataCtx.Provider value={ctx}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={[s.screen, { paddingTop: insets.top }]}>
        {renderTemplateDecos()}
        <View style={[s.appBar, column]}>
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}
            style={s.back}
          >
            <Text style={s.backText}>‹</Text>
          </Pressable>

          <View style={s.nameArea}>
            {shipId && (() => {
              const tpl = pickerTemplates.find(t => t.key === templateKey);
              return (
                <Pressable
                  style={s.styleChip}
                  onPress={() => setShowPicker(true)}
                >
                  <View style={[s.styleChipDot, { backgroundColor: tpl?.color ?? Colors.sakuraDeep }]} />
                  <Text style={s.styleChipText}>{tpl?.label ?? 'style'}</Text>
                  <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                    <Rect x="1" y="1" width="3" height="3" rx="0.5" stroke={Colors.ink} strokeWidth="1.1" />
                    <Rect x="6" y="1" width="3" height="3" rx="0.5" stroke={Colors.ink} strokeWidth="1.1" />
                    <Rect x="1" y="6" width="3" height="3" rx="0.5" stroke={Colors.ink} strokeWidth="1.1" />
                    <Rect x="6" y="6" width="3" height="3" rx="0.5" stroke={Colors.ink} strokeWidth="1.1" />
                  </Svg>
                </Pressable>
              );
            })()}
          </View>

          {shipId && (
            <>
              <Pressable
                style={s.exportBtn}
                onPress={() => router.push(`/onboarding/fo?mode=edit&shipId=${shipId}` as any)}
              >
                <IconEdit size={14} color={Colors.ink2} />
              </Pressable>
              <Pressable style={s.exportBtn} onPress={() => setConfirmDelete(true)}>
                <IconTrashSolid size={14} color={Colors.ink2} />
              </Pressable>
            </>
          )}

          <Pressable style={s.exportBtn} onPress={exportImage} disabled={exporting}>
            {exporting
              ? <ActivityIndicator size="small" color={Colors.ink2} />
              : <IconExport size={14} color={Colors.ink2} />
            }
          </Pressable>

          <Pressable style={[s.bgBtn, (bgColor || bgImage) && s.bgBtnActive]} onPress={() => setShowBgPicker(true)}>
            {bgImage ? (
              <Image source={{ uri: bgImage }} style={s.bgBtnThumb} />
            ) : (
              <View style={[s.bgBtnSwatch, { backgroundColor: bgColor || Colors.paper }]} />
            )}
          </Pressable>

        </View>

        <CozyModal
          visible={confirmDelete}
          title="let them go?"
          message={`Remove ${ship?.shipName || ship?.name || 'this ship'} and all their memories. This can't be undone.`}
          confirmText="Delete"
          cancelText="keep them"
          isDestructive
          onConfirm={() => {
            setConfirmDelete(false);
            if (shipId) deleteShip(shipId);
            router.replace('/(tabs)' as any);
          }}
          onClose={() => setConfirmDelete(false)}
        />

        <ScrollView
          contentContainerStyle={[s.scroll, column]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <View ref={exportRef} style={s.exportCapture} collapsable={false}>
            {bgImage ? (
              <Image
                source={{ uri: bgImage }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                {...MEDIA_IMAGE}
              />
            ) : bgColor ? (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
            ) : null}
            <TemplateTextColorCtx.Provider value={textColor}>
              {children}
            </TemplateTextColorCtx.Provider>
          </View>
        </ScrollView>

        {/* Background customizer */}
        <Modal visible={showBgPicker} transparent animationType="slide" onRequestClose={() => setShowBgPicker(false)}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={() => setShowBgPicker(false)}>
            <View style={s.overlay} />
          </TouchableWithoutFeedback>
          <View style={[s.sheet, SheetColumn]}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>customize</Text>
              <Pressable onPress={() => setShowBgPicker(false)} hitSlop={8}>
                <Text style={s.sheetClose}>✕</Text>
              </Pressable>
            </View>

            <View style={s.bgTabRow}>
              {(['background', 'text'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setBgSheetTab(t)}
                  style={[s.bgTabBtn, bgSheetTab === t && s.bgTabBtnActive]}
                >
                  <Text style={[s.bgTabText, bgSheetTab === t && s.bgTabTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <ScrollView contentContainerStyle={s.bgSheetContent} showsVerticalScrollIndicator={false}>
              {bgSheetTab === 'text' ? (
                <>
                  <Text style={s.bgSectionLabel}>text color</Text>
                  <View style={s.bgSwatchGrid}>
                    <Pressable
                      onPress={() => saveTextColor('')}
                      style={[s.bgResetSwatch, !textColor && s.bgSwatchSelected]}
                    >
                      <Text style={s.bgResetSwatchText}>Aa</Text>
                    </Pressable>
                    {TEXT_COLORS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => saveTextColor(c)}
                        style={[
                          s.bgSwatch,
                          { backgroundColor: c },
                          c === '#ffffff' && s.bgSwatchBordered,
                          textColor === c && s.bgSwatchSelected,
                        ]}
                      >
                        {textColor === c && <View style={s.bgSwatchCheck}><Text style={s.bgSwatchCheckText}>✓</Text></View>}
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  {/* Action row */}
                  <View style={s.bgActionRow}>
                    <Pressable style={s.bgActionBtn} onPress={pickBgImage}>
                      <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
                        <Rect x="2" y="4" width="18" height="14" rx="2" stroke={Colors.ink} strokeWidth="1.4" />
                        <Path d="M2 15l5-5 4 4 3-3 6 6" stroke={Colors.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <Circle cx="15" cy="8.5" r="1.5" fill={Colors.ink} />
                      </Svg>
                      <Text style={s.bgActionLabel}>image</Text>
                    </Pressable>
                    <Pressable style={[s.bgActionBtn, (!bgColor && !bgImage) && s.bgActionBtnActive]} onPress={clearBg}>
                      <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
                        <Path d="M4 11a7 7 0 1 1 1.5 4.5" stroke={Colors.ink} strokeWidth="1.4" strokeLinecap="round" />
                        <Path d="M4 15.5V11h4.5" stroke={Colors.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={s.bgActionLabel}>default</Text>
                    </Pressable>
                    {bgImage ? (
                      <View style={[s.bgActionBtn, s.bgActionBtnActive]}>
                        <Image source={{ uri: bgImage }} style={s.bgActionThumb} />
                        <Text style={s.bgActionLabel}>current</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={s.bgSectionLabel}>colors</Text>
                  <View style={s.bgSwatchGrid}>
                    {BG_COLORS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => saveBgColor(c)}
                        style={[
                          s.bgSwatch,
                          { backgroundColor: c },
                          c === '#ffffff' && s.bgSwatchBordered,
                          bgColor === c && s.bgSwatchSelected,
                        ]}
                      >
                        {bgColor === c && <View style={s.bgSwatchCheck}><Text style={s.bgSwatchCheckText}>✓</Text></View>}
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
          </View>
        </Modal>

        {/* Change template picker */}
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={s.overlay} />
          </TouchableWithoutFeedback>
          <View style={[s.sheet, SheetColumn]}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>change style</Text>
              <Pressable onPress={() => setShowPicker(false)} hitSlop={8}>
                <Text style={s.sheetClose}>✕</Text>
              </Pressable>
            </View>
            <Text style={s.sheetSub}>common info and photos carry over automatically</Text>

            <ScrollView contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
              {pickerTemplates.map((t) => (
                <Pressable
                  key={t.key}
                  style={[s.tplCard, { backgroundColor: t.bg }, selected === t.key && { borderColor: t.color, borderWidth: 2 }]}
                  onPress={() => setSelected(t.key)}
                >
                  <View style={s.tplTape}>
                    <WashiTape width={40} height={10} pattern={t.tape} color={t.color} rotate={-5} />
                  </View>
                  <Text style={[s.tplLabel, { color: t.color }]}>{t.label}</Text>
                  <Text style={s.tplDesc}>{t.desc}</Text>
                  {selected === t.key && (
                    <View style={[s.tplCheck, { backgroundColor: t.color }]}>
                      <Text style={s.tplCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <CozyModal
              visible={confirming}
              title="switch style?"
              message="Your content in both styles is saved. Common fields carry over."
              confirmText="switch"
              cancelText="nevermind"
              onConfirm={() => { setConfirming(false); applyTemplate(); }}
              onClose={() => setConfirming(false)}
            />

            <View style={s.sheetActions}>
              <Pressable
                style={[s.applyBtn, selected === templateKey && s.applyBtnDisabled]}
                onPress={() => {
                  if (selected === templateKey) { setShowPicker(false); return; }
                  if (!premium) {
                    setShowPicker(false);
                    router.push('/paywall?reason=switch-template' as any);
                    return;
                  }
                  setConfirming(true);
                }}
              >
                <Text style={s.applyBtnText}>
                  {selected === templateKey ? 'no changes' : `switch to ${pickerTemplates.find(t => t.key === selected)?.label}`}
                </Text>
              </Pressable>
            </View>
          </View>
          </View>
        </Modal>
      </View>
      </KeyboardAvoidingView>
    </TemplateDataCtx.Provider>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  appBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.s4, paddingVertical: Spacing.s2,
    gap: Spacing.s3, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  back: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill,
  },
  backText: { fontSize: sf(20), lineHeight: 20, color: Colors.ink2, fontFamily: FontFamily.ui, includeFontPadding: false },
  nameArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  styleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: Colors.vellum, borderWidth: 1.5, borderColor: Colors.ink,
    borderRadius: Radius.r2,
  },
  styleChipDot: { width: 8, height: 8, borderRadius: 4 },
  styleChipText: { fontFamily: FontFamily.markerBold, fontSize: sf(11), color: Colors.ink, letterSpacing: 0.3 },
  exportBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill,
  },
  scroll: { padding: Spacing.s5, paddingBottom: Spacing.s8 },
  exportCapture: { backgroundColor: Colors.paper },
  decoTL: { position: 'absolute', top: 130, left: 20 },
  decoBR: { position: 'absolute', bottom: 120, right: 30 },

  // Picker sheet
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, paddingBottom: 34 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line },
  sheetTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink },
  sheetClose: { fontSize: sf(13), color: Colors.ink3, fontFamily: FontFamily.ui },
  sheetSub: { fontFamily: FontFamily.script, fontSize: sf(11), color: Colors.ink3, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, paddingBottom: Spacing.s1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: Spacing.s5 },
  tplCard: {
    width: '47%', padding: Spacing.s3, borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line, minHeight: 80,
    justifyContent: 'flex-end', overflow: 'hidden', ...Shadow.s1,
  },
  tplTape: { position: 'absolute', top: -2, left: 6 },
  tplLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), marginBottom: 2 },
  tplDesc: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3, lineHeight: 14 },
  tplCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  tplCheckText: { fontSize: sf(10), color: Colors.vellum, fontFamily: FontFamily.uiSemiBold },
  sheetActions: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2 },
  applyBtn: { backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill, paddingVertical: 12, alignItems: 'center' },
  applyBtnDisabled: { backgroundColor: Colors.line },
  applyBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(15), color: Colors.vellum },

  // bg button in appbar
  bgBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  bgBtnActive: { borderColor: Colors.sakuraDeep, borderWidth: 1.5 },
  bgBtnSwatch: { width: 32, height: 32 },
  bgBtnThumb: { width: 32, height: 32 },

  // bg picker sheet content
  bgTabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3 },
  bgTabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: Radius.pill, backgroundColor: Colors.paperDeep,
    borderWidth: 1, borderColor: Colors.line,
  },
  bgTabBtnActive: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakuraDeep },
  bgTabText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2, textTransform: 'capitalize' },
  bgTabTextActive: { color: Colors.sakuraDeep },
  bgResetSwatch: {
    width: 42, height: 42, borderRadius: Radius.r2,
    borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.paperDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  bgResetSwatchText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
  bgSheetContent: { padding: Spacing.s5, paddingBottom: 40 },
  bgActionRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.s4 },
  bgActionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    backgroundColor: Colors.vellum, borderRadius: Radius.r2,
    borderWidth: 1, borderColor: Colors.line, gap: 4,
    overflow: 'hidden',
  },
  bgActionBtnActive: { borderColor: Colors.sakuraDeep, borderWidth: 1.5, backgroundColor: Colors.sakuraSoft },
  bgActionLabel: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3 },
  bgActionThumb: { width: '100%', height: 40 },
  bgSectionLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3, marginBottom: Spacing.s3, textTransform: 'uppercase', letterSpacing: 0.8 },
  bgSwatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bgSwatch: {
    width: 42, height: 42, borderRadius: Radius.r2,
    alignItems: 'center', justifyContent: 'center',
  },
  bgSwatchBordered: { borderWidth: 1, borderColor: Colors.line },
  bgSwatchSelected: { borderWidth: 2.5, borderColor: Colors.ink },
  bgSwatchCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  bgSwatchCheckText: { fontSize: sf(10), color: '#fff', fontFamily: FontFamily.uiSemiBold },

  // bg image rendering
  bgImageStyle: { resizeMode: 'cover' },
});
