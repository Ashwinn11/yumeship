import { Cloud } from '@/components/deco/Cloud';
import { Heart } from '@/components/deco/Heart';
import { Ribbon } from '@/components/deco/Ribbon';
import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { Star } from '@/components/deco/Star';
import { WashiTape } from '@/components/deco/WashiTape';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconExport } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, Shadow, Spacing } from '@/constants/theme';
import { usePremium } from '@/store/premium';
import { getShip, updateShip } from '@/store/ships';
import { TemplateDataCtx, buildPreFill, loadTemplateData, migrateTemplateData, saveTemplateData } from '@/store/templateData';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const VISUAL_TEMPLATES = [
  { key: 'get-to-know', label: 'Get to Know', desc: 'popular · fill out their info', color: Colors.sakuraDeep, bg: Colors.sakuraSoft, tape: 'floral' },
  { key: 'kawaii-ui', label: 'Kawaii UI', desc: 'stats card · aesthetics', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, tape: 'dot' },
  { key: 'heart-frame', label: 'Heart Frame', desc: 'romantic · twin portraits', color: Colors.peachDeep, bg: Colors.peachSoft, tape: 'heart' },
  { key: 'aesthetic', label: 'Aesthetic', desc: 'mood board · palette · photos', color: Colors.butterDeep, bg: Colors.butterSoft, tape: 'star' },
  { key: 'flip-phone', label: 'Flip Phone', desc: 'Y2K windows · chat · music', color: Colors.sakuraDeep, bg: Colors.sakura, tape: 'floral' },
  { key: 'talking-about', label: 'Talking About', desc: 'dual portrait · sliders · tropes', color: Colors.sageDeep, bg: Colors.sageSoft, tape: 'dot' },
  { key: 'bond-banner', label: 'Bond Banner', desc: 'heart shield · personality bars', color: Colors.plum, bg: Colors.lavenderSoft, tape: 'heart' },
] as const;

type Props = {
  templateKey: string;
  shipId?: string;
  children: React.ReactNode;
};

export function TemplateScreenWrapper({ templateKey, shipId, children }: Props) {
  const insets = useSafeAreaInsets();
  const ship = shipId ? getShip(shipId) : undefined;
  const premium = usePremium();
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState(templateKey);
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<View>(null);

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
  }), [shipId, templateKey]);

  async function exportImage() {
    if (!premium) { router.push('/paywall'); return; }
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const uri = await captureRef(exportRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'save or share' });
    } catch (e) {
      // user cancelled or error — do nothing
    } finally {
      setExporting(false);
    }
  }

  function applyTemplate() {
    if (!shipId || selected === templateKey) { setShowPicker(false); return; }
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
      <View style={[s.screen, { paddingTop: insets.top }]}>
        {renderTemplateDecos()}
        <View style={s.appBar}>
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}
            style={s.back}
          >
            <Text style={s.backText}>‹</Text>
          </Pressable>

          <View style={s.nameArea}>
            <Text style={s.nameText} numberOfLines={1}>
              {ship?.shipName || ship?.name || templateKey.replace(/-/g, ' ')}
            </Text>
            {shipId && (
              <Pressable style={s.styleChip} onPress={() => setShowPicker(true)}>
                <Text style={s.styleChipText}>{VISUAL_TEMPLATES.find(t => t.key === templateKey)?.label ?? 'style'} ↓</Text>
              </Pressable>
            )}
          </View>

          <Pressable style={s.exportBtn} onPress={exportImage} disabled={exporting}>
            {exporting
              ? <ActivityIndicator size="small" color={Colors.ink2} />
              : <IconExport size={14} color={Colors.ink2} />
            }
          </Pressable>

          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}
            style={s.saveBtn}
          >
            <Text style={s.saveBtnText}>done ♡</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View ref={exportRef} style={s.exportCapture} collapsable={false}>
            {children}
          </View>
        </ScrollView>

        {/* Change template picker */}
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={s.overlay} />
          </TouchableWithoutFeedback>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>change style</Text>
              <Pressable onPress={() => setShowPicker(false)} hitSlop={8}>
                <Text style={s.sheetClose}>✕</Text>
              </Pressable>
            </View>
            <Text style={s.sheetSub}>common info and photos carry over automatically</Text>

            <ScrollView contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
              {VISUAL_TEMPLATES.map((t) => (
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
                onPress={() => selected !== templateKey ? setConfirming(true) : setShowPicker(false)}
              >
                <Text style={s.applyBtnText}>
                  {selected === templateKey ? 'no changes' : `switch to ${VISUAL_TEMPLATES.find(t => t.key === selected)?.label}`}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
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
  backText: { fontSize: 20, lineHeight: 20, color: Colors.ink2, fontFamily: FontFamily.ui, includeFontPadding: false },
  nameArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameText: {
    fontFamily: FontFamily.displayItalic, fontSize: 18,
    color: Colors.ink, textTransform: 'capitalize', flexShrink: 1,
  },
  styleChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill,
  },
  styleChipText: { fontFamily: FontFamily.uiMedium, fontSize: 10, color: Colors.sakuraDeep },
  exportBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill,
  },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.sakuraDeep, borderRadius: 999 },
  saveBtnText: { fontFamily: FontFamily.markerBold, fontSize: 12, color: Colors.vellum, letterSpacing: 0.3 },
  scroll: { padding: Spacing.s5, paddingBottom: Spacing.s8 },
  exportCapture: { backgroundColor: Colors.paper },
  decoTL: { position: 'absolute', top: 130, left: 20 },
  decoBR: { position: 'absolute', bottom: 120, right: 30 },

  // Picker sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, paddingBottom: 34 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line },
  sheetTitle: { fontFamily: FontFamily.displayItalic, fontSize: 17, color: Colors.ink },
  sheetClose: { fontSize: 13, color: Colors.ink3, fontFamily: FontFamily.ui },
  sheetSub: { fontFamily: FontFamily.script, fontSize: 11, color: Colors.ink3, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, paddingBottom: Spacing.s1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: Spacing.s5 },
  tplCard: {
    width: '47%', padding: Spacing.s3, borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line, minHeight: 80,
    justifyContent: 'flex-end', overflow: 'hidden', ...Shadow.s1,
  },
  tplTape: { position: 'absolute', top: -2, left: 6 },
  tplLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: 12, marginBottom: 2 },
  tplDesc: { fontFamily: FontFamily.ui, fontSize: 10, color: Colors.ink3, lineHeight: 14 },
  tplCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  tplCheckText: { fontSize: 10, color: Colors.vellum, fontFamily: FontFamily.uiSemiBold },
  sheetActions: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2 },
  applyBtn: { backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill, paddingVertical: 12, alignItems: 'center' },
  applyBtnDisabled: { backgroundColor: Colors.line },
  applyBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 15, color: Colors.vellum },
});
