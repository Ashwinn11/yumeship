import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bullets, Sparkle, StickerEnvelope, StickerSakuraFlower, WashiTape } from '@/components/deco';
import { ShipCard } from '@/components/cards/ShipCard';
import { Button } from '@/components/ui/Button';
import { IconBell, IconJournalOutline } from '@/components/ui/Icon';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { getOnbState, resetOnb } from '@/store/onboarding';
import { requestPermission } from '@/store/notifications';
import { daysAgo, getShip } from '@/store/ships';

const CREATION_LABEL: Record<string, string> = {
  letter: 'your first love letter',
  scene: 'your first scene',
  messages: 'your first message thread',
  profile: 'your ship profile',
  vault: 'your private vault',
};


export default function OnbReady() {
  const insets = useSafeAreaInsets();
  const { scrollFill, column } = useIPad();
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  const ship = shipId ? getShip(shipId) : undefined;
  const state = getOnbState();

  const creationLabel = CREATION_LABEL[state.firstCreation] ?? 'the first page';
  const primaryLabel = useMemo(() => {
    if (state.firstCreation === 'vault') return 'enter my vault';
    return `open ${creationLabel}`;
  }, [creationLabel, state.firstCreation]);

  async function openFirstPiece() {
    await requestPermission();
    if (!ship?.id) {
      resetOnb();
      router.replace('/(tabs)');
      return;
    }

    const template = ship.templateKey ?? 'get-to-know';
    resetOnb();
    router.replace(`/template/${template}?shipId=${ship.id}` as any);
  }

  async function enterVault() {
    resetOnb();
    router.replace('/(tabs)');
  }

  if (!ship) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
        <View style={styles.centerEmpty}>
          <Text style={styles.heading}>Your vault is ready.</Text>
          <Button variant="primary" size="lg" full onPress={enterVault}>enter yumeship</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={4} total={5} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, scrollFill]} showsVerticalScrollIndicator={false}>
        <View style={[column, { position: 'relative' }]}>
          <View style={styles.decoTR} pointerEvents="none">
            <StickerSakuraFlower size={54} />
          </View>
          <View style={styles.decoBL} pointerEvents="none">
            <StickerEnvelope size={44} />
          </View>
        <Text style={styles.eyebrow}>saved safely</Text>
        <Text style={styles.heading}>Your first ship{'\n'}is waiting.</Text>
        <Text style={styles.subcopy}>
          {creationLabel} has a place to live now.
        </Text>

        <View style={styles.cardWrap}>
          <ShipCard
            style={styles.shipPreview}
            name={ship.name}
            shipName={ship.shipName}
            myName={ship.myName}
            src={ship.fandom || '—'}
            initial={(ship.shipName || ship.name).charAt(0).toUpperCase() || '♡'}
            gradStart={ship.gradStart}
            gradEnd={ship.gradEnd}
            coverUri={ship.coverUri}
            type={ship.relType}
            days={daysAgo(ship.createdAt)}
            tapePattern={ship.tapePattern as any}
            tapeColor={ship.tapeColor}
          />
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewTape}>
            <WashiTape width={58} height={13} pattern="floral" color={Colors.sakura} rotate={-5} />
          </View>
          <Text style={styles.previewTitle}>inside your vault</Text>
          {[
            'letters, scenes, messages, dates',
            'headcanons kept in one soft place',
            'more ships when you are ready',
          ].map((item) => (
            <View key={item} style={styles.previewRow}>
              <Bullets.Heart size={12} color={Colors.sakuraDeep} />
              <Text style={styles.previewText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.notifCard}>
          <View style={styles.notifIcon}>
            <IconBell size={17} color={Colors.lavenderDeep} />
          </View>
          <View style={styles.notifText}>
            <Text style={styles.notifTitle}>little reminders, only if you want them</Text>
            <Text style={styles.notifBody}>special dates and tiny notes can show up gently. you can skip this.</Text>
          </View>
        </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, column]}>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={openFirstPiece}
          icon={<IconJournalOutline size={15} color={Colors.vellum} />}
          iconPosition="right"
        >
          {primaryLabel}
        </Button>
        <Pressable onPress={enterVault} style={styles.skipPressable}>
          <Text style={styles.skip}>or enter my vault</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  dotsRow: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s4 },
  eyebrow: {
    fontFamily: FontFamily.marker,
    fontSize: sf(10),
    color: Colors.sakuraDeep,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(31),
    lineHeight: 33,
    color: Colors.ink,
    marginTop: Spacing.s2,
  },
  subcopy: { fontFamily: FontFamily.script, fontSize: sf(18), lineHeight: 22, color: Colors.ink2, marginTop: Spacing.s3 },
  cardWrap: { marginTop: Spacing.s5 },
  shipPreview: {
    width: 156,
    alignSelf: 'center',
  },
  previewCard: {
    marginTop: Spacing.s4,
    padding: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Colors.line,
    position: 'relative',
    gap: Spacing.s2,
    ...Shadow.s1,
  },
  previewTape: { position: 'absolute', top: -7, left: 16 },
  previewTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s2 },
  previewText: { flex: 1, fontFamily: FontFamily.ui, fontSize: FontSize.caption, color: Colors.ink2 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    marginTop: Spacing.s4,
    padding: Spacing.s3,
    backgroundColor: Colors.lavenderSoft,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Colors.lavender,
  },
  notifIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: { flex: 1 },
  notifTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: FontSize.caption, color: Colors.ink },
  notifBody: { fontFamily: FontFamily.ui, fontSize: sf(11), lineHeight: 14, color: Colors.ink3, marginTop: 1 },
  notifBtn: {
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.lavender,
  },
  notifBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.lavenderDeep },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3, gap: Spacing.s2 },
  skipPressable: { alignItems: 'center' },
  skip: { fontFamily: FontFamily.ui, fontSize: FontSize.meta, color: Colors.ink3, textDecorationLine: 'underline' },
  centerEmpty: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.s6, gap: Spacing.s5 },
  decoTR: { position: 'absolute', top: 0, right: 0 },
  decoBL: { position: 'absolute', bottom: 142, left: 22 },
});
