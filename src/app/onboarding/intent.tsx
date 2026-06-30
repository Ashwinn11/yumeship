import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ribbon, Sparkle, StickerEnvelope, StickerSakuraBranch, WashiTape } from '@/components/deco';
import { Button } from '@/components/ui/Button';
import { IconBookmark, IconHeart, IconJournalOutline, IconMailOutline, IconSend } from '@/components/ui/Icon';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { setOnbField } from '@/store/onboarding';

const OPTIONS = [
  {
    key: 'letter',
    title: 'a love letter',
    body: 'something soft, personal, and saved just for you.',
    color: Colors.sakuraDeep,
    bg: Colors.sakuraSoft,
    icon: IconMailOutline,
  },
  {
    key: 'scene',
    title: 'a scene together',
    body: 'a tiny moment with them, written in your world.',
    color: Colors.lavenderDeep,
    bg: Colors.lavenderSoft,
    icon: IconJournalOutline,
  },
  {
    key: 'messages',
    title: 'a message thread',
    body: 'little lines that make them feel close.',
    color: Colors.peachDeep,
    bg: Colors.peachSoft,
    icon: IconSend,
  },
  {
    key: 'profile',
    title: 'a ship profile',
    body: 'names, source, vibe, and the shape of the bond.',
    color: Colors.sageDeep,
    bg: Colors.sageSoft,
    icon: IconHeart,
  },
  {
    key: 'vault',
    title: 'a private vault',
    body: 'one quiet place for all of it.',
    color: Colors.plum,
    bg: Colors.paperDeep,
    icon: IconBookmark,
  },
] as const;

export default function OnbIntent() {
  const insets = useSafeAreaInsets();
  const { scrollFill, column } = useIPad();
  const [selected, setSelected] = useState<(typeof OPTIONS)[number]['key']>('letter');

  function continueFlow() {
    setOnbField('firstCreation', selected);
    router.push('/onboarding/pain');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={0} total={5} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, scrollFill]} showsVerticalScrollIndicator={false}>
        <View style={[column, { position: 'relative' }]}>
          <View style={styles.decoTR} pointerEvents="none">
            <StickerSakuraBranch size={58} />
          </View>
          <View style={styles.decoBL} pointerEvents="none">
            <Sparkle size={18} color={Colors.lavenderDeep} />
          </View>
        <Text style={styles.eyebrow}>first wish</Text>
        <Text style={styles.heading}>What do you want{'\n'}to make first?</Text>
        <Text style={styles.subcopy}>
          choose the first little piece of them you want to hold.
        </Text>

        <View style={styles.list}>
          {OPTIONS.map((option) => {
            const isActive = selected === option.key;
            const Icon = option.icon;
            return (
              <Pressable
                key={option.key}
                onPress={() => setSelected(option.key)}
                style={[
                  styles.option,
                  isActive && { borderColor: option.color, backgroundColor: option.bg },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: isActive ? Colors.vellum : option.bg }]}>
                  <Icon size={18} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, isActive && { color: option.color }]}>{option.title}</Text>
                  <Text style={styles.optionBody}>{option.body}</Text>
                </View>
                {isActive && (
                  <View style={styles.tape}>
                    <WashiTape width={38} height={10} pattern="heart" color={option.color} rotate={-5} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.note}>
          <StickerEnvelope size={30} />
          <Text style={styles.noteText}>you can change your mind later. this just opens the first page.</Text>
        </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, column]}>
        <Button variant="primary" size="lg" full onPress={continueFlow} icon={<Ribbon size={14} color={Colors.vellum} />} iconPosition="right">
          continue
        </Button>
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
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(31),
    lineHeight: 33,
    color: Colors.ink,
    marginTop: Spacing.s2,
  },
  subcopy: {
    fontFamily: FontFamily.script,
    fontSize: sf(18),
    lineHeight: 22,
    color: Colors.ink2,
    marginTop: Spacing.s3,
  },
  list: { gap: Spacing.s3, marginTop: Spacing.s5 },
  option: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    padding: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderWidth: 1.3,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.s1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  optionText: { flex: 1 },
  optionTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: FontSize.body, color: Colors.ink },
  optionBody: { fontFamily: FontFamily.ui, fontSize: FontSize.caption, color: Colors.ink3, lineHeight: 16, marginTop: 2 },
  tape: { position: 'absolute', top: -3, right: 14 },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    marginTop: Spacing.s5,
    padding: Spacing.s3,
    backgroundColor: Colors.paperDeep,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  noteText: { flex: 1, fontFamily: FontFamily.script, fontSize: sf(16), lineHeight: 18, color: Colors.ink2 },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3 },
  decoTR: { position: 'absolute', top: 0, right: 0 },
  decoBL: { position: 'absolute', bottom: 132, left: 24 },
});
