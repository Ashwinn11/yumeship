import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Cloud } from '@/components/deco/Cloud';
import { Star } from '@/components/deco/Star';

import { StickerWaxSeal } from '@/components/deco';
import { AlbumsTab } from '@/components/tabs/AlbumsTab';
import { DatesTab } from '@/components/tabs/DatesTab';
import { IncorrectQuotesTab } from '@/components/tabs/IncorrectQuotesTab';
import { LoveLetterTab } from '@/components/tabs/LoveLetterTab';
import { MessagesTab } from '@/components/tabs/MessagesTab';
import { BoundariesFeature } from '@/components/tabs/BoundariesFeature';
import { FoMessagesFeature } from '@/components/tabs/FoMessagesFeature';
import { HeadcanonsFeature } from '@/components/tabs/HeadcanonsFeature';
import { ScenariosFeature } from '@/components/tabs/ScenariosFeature';
import { StorylineTab } from '@/components/tabs/StorylineTab';
import { ThisOrThatTab } from '@/components/tabs/ThisOrThatTab';
import { INK } from '@/components/templates/primitives';
import { IconChevronLeft } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, sf, Shadow, SheetColumn, Spacing } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { usePremium } from '@/store/premium';
import { isPoly, membersLabel, Ship, useShips } from '@/store/ships';
import { router } from 'expo-router';

const PREMIUM_FEATURES: Feature[] = ['scenarios', 'albums', 'storyline', 'love-letter'];
const FEATURE_REASON: Partial<Record<Feature, string>> = {
  albums: 'albums',
  scenarios: 'scenarios',
  storyline: 'storyline',
  'love-letter': 'love-letter',
};

type Feature =
  | 'headcanons'
  | 'scenarios'
  | 'messages'
  | 'albums'
  | 'boundaries'
  | 'storyline'
  | 'dates'
  | 'fo-messages'
  | 'this-or-that'
  | 'love-letter'
  | 'incorrect-quotes';

const FEATURES: { id: Feature; ja: string; label: string; desc: string; color: string; bg: string; availableFor?: 'single' | 'poly' }[] = [
  { id: 'headcanons', ja: '想', label: 'Headcanons', desc: 'personality · habits · favorites', color: Colors.sakuraDeep, bg: Colors.sakuraSoft, availableFor: 'single' },
  { id: 'scenarios', ja: '物', label: 'Scenarios', desc: 'write your stories', color: Colors.lavenderDeep, bg: Colors.lavenderSoft },
  { id: 'messages', ja: '話', label: 'Messages', desc: 'conversations & threads', color: Colors.peachDeep, bg: Colors.peachSoft },
  { id: 'albums', ja: '写', label: 'Albums', desc: 'photo collections', color: Colors.sageDeep, bg: Colors.sageSoft },
  { id: 'boundaries', ja: '夢', label: 'Boundaries', desc: 'sharing rules & what\'s ok', color: Colors.plum, bg: Colors.lavenderSoft },
  { id: 'storyline', ja: '時', label: 'Storyline', desc: 'timeline of moments', color: Colors.ink2, bg: Colors.paperDeep },
  { id: 'dates', ja: '日', label: 'Dates', desc: 'anniversaries & events', color: Colors.peachDeep, bg: Colors.peachSoft },
  { id: 'fo-messages', ja: '通', label: 'F/O Notifications', desc: 'notes & nudges from them', color: Colors.sakuraInk, bg: Colors.sakuraSoft },
  { id: 'this-or-that', ja: '択', label: 'This or That', desc: 'how do they choose?', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, availableFor: 'single' },
  { id: 'love-letter', ja: '文', label: 'Love Letters', desc: 'letters to & from them', color: Colors.sakuraDeep, bg: Colors.sakuraSoft },
  { id: 'incorrect-quotes', ja: '劇', label: 'Incorrect Quotes', desc: 'cast your polycule in a bit', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, availableFor: 'poly' },
];

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const navigation = useNavigation();
  const ships = useShips();
  const premium = usePremium();
  const [selectedShipIdx, setSelectedShipIdx] = useState(0);
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [showShipPicker, setShowShipPicker] = useState(false);
  const [customBack, setCustomBack] = useState<(() => void) | null>(null);
  const [msgSender, setMsgSender] = useState<'me' | 'them'>('me');

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: activeFeature ? { display: 'none' } : undefined,
    });
  }, [activeFeature, navigation]);

  const ship = ships[selectedShipIdx] ?? null;

  function handleBack() {
    if (customBack) {
      customBack();
      setCustomBack(null);
    } else {
      setActiveFeature(null);
    }
  }

  function renderFeature() {
    if (!ship || !activeFeature) return null;
    switch (activeFeature) {
      case 'headcanons': return <HeadcanonsFeature shipId={ship.id} shipName={ship.name} setCustomBack={setCustomBack} />;
      case 'scenarios': return <ScenariosFeature shipId={ship.id} shipName={ship.name} setCustomBack={setCustomBack} />;
      case 'messages': return <MessagesTab shipId={ship.id} shipName={ship.name} onBack={() => setActiveFeature(null)} />;
      case 'albums': return <AlbumsTab shipId={ship.id} setCustomBack={setCustomBack} />;
      case 'boundaries': return <BoundariesFeature shipId={ship.id} />;
      case 'storyline': return <StorylineTab shipId={ship.id} shipName={ship.name} />;
      case 'dates': return <DatesTab shipId={ship.id} shipName={ship.name} />;
      case 'fo-messages': return <FoMessagesFeature shipId={ship.id} shipName={ship.name} setCustomBack={setCustomBack} />;
      case 'this-or-that': return <ThisOrThatTab shipId={ship.id} />;
      case 'love-letter': return <LoveLetterTab shipId={ship.id} />;
      case 'incorrect-quotes': return <IncorrectQuotesTab shipId={ship.id} />;
    }
  }

  const activeFeatureMeta = FEATURES.find((f) => f.id === activeFeature);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Background accents — hidden inside messages so the chat UI is clean */}
      {activeFeature !== 'messages' && (
        <>
          <View style={styles.decoTR} pointerEvents="none">
            <Cloud size={30} color={Colors.sakura} />
          </View>
          <View style={styles.decoBR} pointerEvents="none">
            <Star size={18} color={Colors.lavenderDeep} />
          </View>
        </>
      )}

      {/* Header — hidden when in messages (MessagesTab owns its own header) */}
      {activeFeature !== 'messages' && (
        activeFeature ? (
          <View style={[styles.subHeader, column]}>
            <Pressable style={styles.backBtn} onPress={handleBack}>
              <IconChevronLeft size={14} color={Colors.ink2} />
            </Pressable>
            <View style={styles.subHeaderCenter}>
              {ships.length > 0 ? (
                <Pressable onPress={() => setShowShipPicker(true)} style={styles.subHeaderPickerBtn}>
                  <View style={[styles.titleShipDot, { backgroundColor: ship?.gradStart ?? Colors.sakura }]} />
                  <Text style={styles.subHeaderShipName} numberOfLines={1}>
                    {ship ? (ship.shipName || ship.name) : 'select ship'}
                  </Text>
                  <Text style={styles.subHeaderChevron}>▾</Text>
                </Pressable>
              ) : (
                <Text style={styles.subHeaderShipName}>no ship</Text>
              )}
            </View>
            <View style={{ width: 32 }} />
          </View>
        ) : (
          <View style={[styles.header, column]}>
            <View style={styles.headerRow}>
              <Mark size={26} />
            </View>
            {ships.length > 0 ? (
              <Pressable style={styles.titleRow} onPress={() => setShowShipPicker(true)}>
                <View style={styles.titlePickerContainer}>
                  <View style={[styles.titleShipDot, { backgroundColor: ship?.gradStart ?? Colors.sakura }]} />
                  <Text style={styles.title} numberOfLines={1}>
                    {ship ? (ship.shipName || ship.name) : 'vault'}
                  </Text>
                  <Text style={styles.titleChevron}>▾</Text>
                </View>
              </Pressable>
            ) : (
              <View style={styles.titleRow}>
                <Text style={styles.title}>vault</Text>
              </View>
            )}
          </View>
        )
      )}

      {ships.length === 0 ? (
        <View style={[styles.emptyShips, { flex: 1, justifyContent: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 12 }]}>
          <StickerWaxSeal size={88} />
          <Text style={{ fontFamily: FontFamily.script, fontSize: sf(26), color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
            create a ship to fill the vault
          </Text>
        </View>
      ) : activeFeature ? (
        <View style={styles.featureWrap}>
          {activeFeature === 'messages' ? renderFeature() : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[column, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()}>
              {renderFeature()}
            </ScrollView>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.grid, column]} showsVerticalScrollIndicator={false}>
          {FEATURES.filter((f) => !f.availableFor || f.availableFor === (isPoly(ship) ? 'poly' : 'single')).map((f) => {
            const locked = !premium && PREMIUM_FEATURES.includes(f.id);
            return (
              <Pressable
                key={f.id}
                style={[styles.featureCard, { backgroundColor: f.bg }, locked && { opacity: 0.5 }]}
                onPress={() => {
                  if (locked) {
                    router.push({ pathname: '/paywall', params: { reason: FEATURE_REASON[f.id] } });
                    return;
                  }
                  setActiveFeature(f.id);
                }}
              >
                <Text style={[styles.featureJa, { color: f.color }]}>{f.ja}</Text>
                <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
                {locked && <Text style={{ position: 'absolute', top: 6, right: 8, fontSize: 10 }}>🔒</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Ship picker sheet */}
      <Modal visible={showShipPicker} transparent animationType="slide" onRequestClose={() => setShowShipPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowShipPicker(false)}>
          <Pressable style={[styles.pickerSheet, SheetColumn]} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>switch ship</Text>
            {ships.map((s, i) => (
              <Pressable
                key={s.id}
                style={[styles.pickerRow, i === selectedShipIdx && styles.pickerRowActive]}
                onPress={() => { setSelectedShipIdx(i); setActiveFeature(null); setShowShipPicker(false); }}
              >
                <View style={[styles.pickerDot, { backgroundColor: s.gradStart }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pickerName, i === selectedShipIdx && { color: Colors.sakuraDeep }]}>{s.shipName || s.name}</Text>
                  {isPoly(s)
                    ? (membersLabel(s) ? <Text style={styles.pickerFandom}>{membersLabel(s)}</Text> : null)
                    : s.myName && s.name ? <Text style={styles.pickerFandom}>{s.myName} × {s.name}</Text> : s.fandom ? <Text style={styles.pickerFandom}>{s.fandom}</Text> : null}
                </View>
                {i === selectedShipIdx && <Text style={styles.pickerCheck}>✓</Text>}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s3,
    paddingBottom: Spacing.s4,
  },
  subHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  subHeaderCenter: { flex: 1, alignItems: 'center' },
  subHeaderTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  subHeaderPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subHeaderShipName: {
    fontFamily: FontFamily.uiMedium,
    fontSize: FontSize.h5,
    color: Colors.ink,
    maxWidth: 180,
  },
  subHeaderChevron: {
    fontSize: sf(16),
    color: Colors.ink3,
    fontFamily: FontFamily.ui,
    marginTop: 2,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titlePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.uiMedium,
    fontSize: FontSize.h3,
    color: Colors.ink,
  },
  titleShipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  titleChevron: {
    fontSize: sf(22),
    color: Colors.ink3,
    fontFamily: FontFamily.ui,
    marginLeft: 4,
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9,
  },
  featureCard: {
    width: '47%', padding: Spacing.s4, borderRadius: Radius.r4,
    minHeight: 90, justifyContent: 'flex-end', ...Shadow.s1,
    borderWidth: 1.5, borderColor: INK, position: 'relative', overflow: 'hidden',
  },
  featureCardLocked: { opacity: 0.55 },
  featureJa: { fontFamily: FontFamily.ja, fontSize: sf(22), marginBottom: 2 },
  featureLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), marginBottom: 2 },
  featureDesc: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3, lineHeight: sf(14) },
  featureTextLocked: { opacity: 0.7 },
  lockBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.vellum, borderRadius: 99,
    width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.line,
  },

  featureWrap: { flex: 1 },

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(43,26,38,0.4)', justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.vellum, borderTopLeftRadius: Radius.r4, borderTopRightRadius: Radius.r4,
    padding: Spacing.s5, paddingBottom: Spacing.s9, gap: 4,
  },
  pickerTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(18), color: Colors.ink, marginBottom: Spacing.s3 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: Spacing.s3, paddingHorizontal: Spacing.s4,
    borderRadius: Radius.r3,
  },
  pickerRowActive: { backgroundColor: Colors.sakuraSoft },
  pickerDot: { width: 12, height: 12, borderRadius: 6 },
  pickerName: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.ink },
  pickerFandom: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3 },
  pickerCheck: { fontSize: sf(14), color: Colors.sakuraDeep, fontFamily: FontFamily.uiSemiBold },

  msgSenderToggle: { flexDirection: 'row', backgroundColor: Colors.paperDeep, borderRadius: Radius.pill, padding: 2, borderWidth: 1, borderColor: Colors.line },
  msgSenderBtn: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: Radius.pill },
  msgSenderBtnActive: { backgroundColor: Colors.sakuraDeep },
  msgSenderBtnText: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink2 },
  msgSenderBtnTextActive: { color: Colors.vellum },
  emptyShips: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.s3, paddingBottom: Spacing.s9 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink3, textAlign: 'center', paddingHorizontal: Spacing.s7 },
  decoTL: {
    position: 'absolute',
    top: 130,
    left: 20,
  },
  decoTR: {
    position: 'absolute',
    top: 130,
    right: 20,
  },
  decoBR: {
    position: 'absolute',
    bottom: 120,
    right: 30,
  },
});


