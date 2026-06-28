import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bullets, Sparkle, StickerWaxSeal } from '@/components/deco';
import { ThoughtCloud } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Mark } from '@/components/ui/Mark';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { resetOnb, setOnbField } from '@/store/onboarding';
import { usePremium } from '@/store/premium';

export const COVER_PALETTES: { id: string; start: string; end: string }[] = [
  { id: 'sakura', start: '#f3b6c4', end: '#9b4f6e' },
  { id: 'plum', start: '#e0b0d8', end: '#6e2b5e' },
  { id: 'lavender', start: '#c9b8e8', end: '#6b4da3' },
  { id: 'sky', start: '#b8d4f0', end: '#3a6fa8' },
  { id: 'midnight', start: '#a0b0d0', end: '#1a2a4a' },
  { id: 'sage', start: '#b4cba5', end: '#4a7050' },
  { id: 'peach', start: '#f4c09a', end: '#c06840' },
  { id: 'gold', start: '#f0daa0', end: '#9b7c20' },
];

export default function OnbFO() {
  const insets = useSafeAreaInsets();
  const { scrollFill, column } = useIPad();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isNew = mode === 'new';
  const premium = usePremium();

  const [foName, setFoName] = useState('');
  const [shipName, setShipName] = useState('');
  const [fandom, setFandom] = useState('');
  const [paletteId, setPaletteId] = useState('sakura');
  const [coverUri, setCoverUri] = useState('');
  const [relType, setRelType] = useState<'romantic' | 'platonic' | 'familial'>('romantic');

  const [kind, setKind] = useState<'single' | 'poly'>('single');

  const handleFoName = (v: string) => { setFoName(v); setOnbField('foName', v); };
  const handleShipName = (v: string) => { setShipName(v); setOnbField('shipName', v); };
  const handleFandom = (v: string) => { setFandom(v); setOnbField('fandom', v); };

  function selectPalette(p: typeof COVER_PALETTES[0]) {
    setPaletteId(p.id);
    setOnbField('gradStart', p.start);
    setOnbField('gradEnd', p.end);
    setCoverUri('');
    setOnbField('coverUri', '');
  }

  async function pickCoverImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setCoverUri(res.assets[0].uri);
      setOnbField('coverUri', res.assets[0].uri);
    }
  }

  function goToRules() {
    setOnbField('relType', relType);

    setOnbField('kind', kind);
    router.push({ pathname: '/onboarding/rules', params: isNew ? { mode: 'new' } : {} });
  }

  const selectedPalette = COVER_PALETTES.find((p) => p.id === paletteId) || COVER_PALETTES[0];

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      {isNew ? (
        <View style={styles.header}>
          <Pressable onPress={() => { resetOnb(); router.back(); }} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Mark size={22} />
            <Text style={styles.headerTitle}>new ship</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
      ) : (
        <View style={styles.dotsRow}>
          <StepDots step={3} total={5} />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, scrollFill]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()}>
        <View style={[column, { position: 'relative' }]}>
          <View style={styles.decoTR} pointerEvents="none">
            <StickerWaxSeal size={60} />
          </View>
          <View style={styles.decoBR} pointerEvents="none">
            <Sparkle size={18} color={Colors.lavenderDeep} />
          </View>
        {!isNew && <Text style={styles.eyebrow}>step four · them</Text>}
        <Text style={[styles.heading, isNew && styles.headingNew]}>
          {kind === 'poly'
            ? <>Your polycule,{"\n"}all in one place.</>
            : <>Meet them,{"\n"}your forever-someone.</>}
        </Text>

        {/* Premium redesign card containing all fields in step two */}
        <View style={styles.card}>
          <View style={{ marginBottom: 18 }}>
            <Text style={styles.fieldLabel}>SHIP TYPE</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              {(['single', 'poly'] as const).map((k) => {
                const on = kind === k;
                const locked = k === 'poly' && !premium;
                return (
                  <Pressable
                    key={k}
                    onPress={() => {
                      if (locked) {
                        router.push({ pathname: '/paywall', params: { reason: 'polyship' } });
                        return;
                      }
                      setKind(k);
                      setOnbField('kind', k);
                    }}
                    style={{
                      flex: 1, paddingVertical: 8, borderRadius: 14, borderWidth: 1, alignItems: 'center',
                      borderColor: on ? Colors.plum : Colors.line,
                      backgroundColor: on ? Colors.lavenderSoft : Colors.paperDeep,
                    }}
                  >
                    <Text style={{ fontSize: sf(12), fontFamily: FontFamily.uiMedium, color: on ? Colors.plum : Colors.ink2 }}>
                      {k === 'single' ? 'single ship' : (locked ? 'polyship 🔒' : 'polyship ♡')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* SHIP NAME field */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.fieldLabel}>SHIP NAME · what you call this</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.4, borderBottomColor: Colors.line, paddingBottom: 4, marginTop: 4 }}>
              <TextInput
                value={shipName}
                onChangeText={handleShipName}
                placeholder="e.g. kurotsuki"
                placeholderTextColor={Colors.ink3}
                style={{ flex: 1, paddingVertical: 4, fontFamily: FontFamily.ui, fontSize: sf(18), color: Colors.ink, lineHeight: sf(24) }}
              />
              <Bullets.Heart size={12} color={Colors.sakuraDeep} />
            </View>
          </View>

          {kind === 'poly' && (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <LinearGradient
                colors={[selectedPalette.start, selectedPalette.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 92, height: 116, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  shadowColor: 'rgba(110, 58, 90, 0.18)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3,
                }}
              >
                {coverUri ? (
                  <Image source={{ uri: coverUri }} style={{ width: 92, height: 116 }} contentFit="cover" />
                ) : (
                  <Text style={{ color: '#fff', fontFamily: FontFamily.displayItalic, fontSize: sf(40) }}>
                    {shipName.charAt(0).toUpperCase() || '♡'}
                  </Text>
                )}
                <View style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(110,58,90,0.92)', borderRadius: Radius.pill, paddingVertical: 2, paddingHorizontal: 7 }}>
                  <Text style={{ color: '#fff', fontFamily: FontFamily.marker, fontSize: sf(9), letterSpacing: 0.6 }}>poly</Text>
                </View>
              </LinearGradient>
              <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink, marginTop: 8, lineHeight: sf(22) }}>
                {shipName || 'your polyship'}
              </Text>
            </View>
          )}

          {kind === 'single' && (<>
          {/* Avatar Preview Tile & inputs */}
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <LinearGradient
              colors={[selectedPalette.start, selectedPalette.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 60,
                height: 76,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                shadowColor: 'rgba(110, 58, 90, 0.15)',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              {coverUri ? (
                <Image source={{ uri: coverUri }} style={{ width: 60, height: 76, borderRadius: 10 }} contentFit="cover" />
              ) : (
                <Text style={{ color: '#ffffff', fontFamily: FontFamily.displayItalic, fontSize: sf(36), fontWeight: 'bold' }}>
                  {foName.charAt(0).toUpperCase() || '♡'}
                </Text>
              )}
            </LinearGradient>

            <View style={{ flex: 1, gap: 8 }}>
              <View>
                <Text style={styles.fieldLabel}>THEIR NAME</Text>
                <TextInput
                  value={foName}
                  onChangeText={handleFoName}
                  placeholder="e.g. Kuroo Tetsurou"
                  placeholderTextColor={Colors.ink3}
                  style={{ borderBottomWidth: 1, borderBottomColor: Colors.line, paddingVertical: 4, fontFamily: FontFamily.ui, fontSize: sf(15), color: Colors.ink, lineHeight: sf(21) }}
                />
              </View>

              <View>
                <Text style={styles.fieldLabel}>SOURCE</Text>
                <TextInput
                  value={fandom}
                  onChangeText={handleFandom}
                  placeholder="e.g. Haikyuu!! · canon"
                  placeholderTextColor={Colors.ink3}
                  style={{ borderBottomWidth: 1, borderBottomColor: Colors.line, paddingVertical: 4, fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2, lineHeight: sf(18) }}
                />
              </View>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* RELATIONSHIP field */}
          <View>
            <Text style={styles.fieldLabel}>RELATIONSHIP</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              {(['romantic', 'platonic', 'familial'] as const).map((r) => {
                const isActive = relType === r;
                let activeColor: string = Colors.sakuraDeep;
                let activeBg: string = Colors.sakuraSoft;
                if (r === 'platonic') { activeColor = Colors.sageDeep; activeBg = Colors.sageSoft; }
                if (r === 'familial') { activeColor = Colors.peachDeep; activeBg = Colors.peachSoft; }

                return (
                  <Pressable
                    key={r}
                    onPress={() => setRelType(r)}
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: isActive ? activeColor : Colors.line,
                      backgroundColor: isActive ? activeBg : Colors.paperDeep,
                    }}
                  >
                    <Text style={{ fontSize: sf(11), fontFamily: FontFamily.uiMedium, color: isActive ? activeColor : Colors.ink2 }}>
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>


          </>)}

          {/* COLOR field */}
          <View>
            <Text style={styles.fieldLabel}>{kind === 'poly' ? 'SHIP COLOR' : 'THEIR COLOR'}</Text>
            <View style={styles.paletteRow}>
              {COVER_PALETTES.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => selectPalette(p)}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: p.start,
                      borderWidth: paletteId === p.id ? 2 : 1.5,
                      borderColor: paletteId === p.id ? Colors.ink : Colors.line,
                    },
                  ]}
                >
                  {paletteId === p.id && !coverUri && (
                    <View style={styles.swatchSparkle}>
                      <Sparkle size={9} color={Colors.sakuraDeep} />
                    </View>
                  )}
                </Pressable>
              ))}
              <Pressable
                onPress={pickCoverImage}
                style={[
                  styles.swatch,
                  styles.imageSwatch,
                  coverUri ? { borderColor: Colors.ink, borderWidth: 2, borderStyle: 'solid' } : null,
                ]}
              >
                {coverUri ? (
                  <Image source={{ uri: coverUri }} style={styles.imageSwatchThumb} contentFit="cover" />
                ) : (
                  <Text style={styles.imageSwatchPlus}>+</Text>
                )}
                {!!coverUri && (
                  <View style={styles.swatchSparkle}>
                    <Sparkle size={9} color={Colors.sakuraDeep} />
                  </View>
                )}
              </Pressable>
            </View>
            <Text style={styles.imageHint}>or tap + to use a photo · crop it your way</Text>
          </View>
        </View>

        {/* Thought cloud at bottom */}
        <View style={{ marginTop: 22, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ThoughtCloud tone="lavender">
            love them how you want.{"\n"}
            this corner of your{"\n"}
            heart is just yours.
          </ThoughtCloud>
        </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, column]}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={kind === 'poly'
            ? shipName.trim().length === 0
            : (foName.trim().length === 0 || shipName.trim().length === 0)}
          onPress={goToRules}
        >
          {kind === 'poly'
            ? (!shipName.trim() ? 'enter ship name first' : 'continue · style')
            : !foName.trim()
              ? 'enter their name first'
              : !shipName.trim()
                ? 'enter ship name first'
                : 'continue · style'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  dotsRow: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: sf(12), color: Colors.ink2, fontFamily: FontFamily.ui },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s5, paddingBottom: Spacing.s4 },
  eyebrow: {
    fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.plum,
    letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(26), lineHeight: 28,
    letterSpacing: -0.3, color: Colors.ink, marginTop: Spacing.s2,
  },
  headingNew: { marginTop: 0 },
  card: {
    marginTop: Spacing.s4, padding: 16,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r4,
    shadowColor: 'rgba(110, 58, 90, 0.05)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1,
  },
  cardDivider: { height: 1.2, backgroundColor: Colors.line, marginVertical: 14, opacity: 0.6 },
  fieldLabel: { fontFamily: FontFamily.marker, fontSize: sf(8), color: Colors.ink3, letterSpacing: 1.4, fontWeight: '600' },
  paletteRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  swatch: {
    width: 24, height: 24, borderRadius: Radius.pill,
    position: 'relative',
  },
  swatchSparkle: { position: 'absolute', top: -6, left: -6 },
  imageSwatch: {
    backgroundColor: Colors.paperDeep,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageSwatchThumb: { width: 24, height: 24, borderRadius: Radius.pill },
  imageSwatchPlus: { fontSize: sf(13), color: Colors.ink3, fontFamily: FontFamily.ui, lineHeight: 16 },
  imageHint: { fontFamily: FontFamily.ui, fontSize: sf(9), color: Colors.ink3, marginTop: 6 },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3, gap: Spacing.s2 },
  skipPressable: { alignItems: 'center' },
  skip: { fontFamily: FontFamily.ui, fontSize: FontSize.meta, color: Colors.ink3, textDecorationLine: 'underline' },
  decoTR: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  decoBR: {
    position: 'absolute',
    bottom: 120,
    right: 30,
  },
});
