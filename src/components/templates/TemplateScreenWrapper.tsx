import { useMemo, useRef } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getShip, updateShip } from '@/store/ships';
import { TemplateDataCtx, loadTemplateData, saveTemplateData, buildPreFill } from '@/store/templateData';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { Cloud } from '@/components/deco/Cloud';
import { Heart } from '@/components/deco/Heart';
import { Ribbon } from '@/components/deco/Ribbon';
import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { Star } from '@/components/deco/Star';

type Props = {
  templateKey: string;
  shipId?: string;
  children: React.ReactNode;
};

export function TemplateScreenWrapper({ templateKey, shipId, children }: Props) {
  const insets = useSafeAreaInsets();
  const ship = shipId ? getShip(shipId) : undefined;

  const initData = (): Record<string, string> => {
    if (!shipId) return {};
    const saved = loadTemplateData(shipId, templateKey);
    if (Object.keys(saved).length > 0) return saved;
    return ship ? buildPreFill(ship, templateKey) : {};
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

          <Text style={s.nameText} numberOfLines={1}>
            {ship?.shipName || ship?.name || templateKey.replace(/-/g, ' ')}
          </Text>

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
          {children}
        </ScrollView>
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
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: Colors.ink2, fontFamily: FontFamily.ui },
  nameText: {
    flex: 1, fontFamily: FontFamily.displayItalic, fontSize: 18,
    color: Colors.ink, textTransform: 'capitalize',
  },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.sakuraDeep, borderRadius: 999 },
  saveBtnText: { fontFamily: FontFamily.markerBold, fontSize: 12, color: Colors.vellum, letterSpacing: 0.3 },
  scroll: { padding: Spacing.s5, paddingBottom: Spacing.s8 },
  decoTL: {
    position: 'absolute',
    top: 130,
    left: 20,
  },
  decoBR: {
    position: 'absolute',
    bottom: 120,
    right: 30,
  },
});
