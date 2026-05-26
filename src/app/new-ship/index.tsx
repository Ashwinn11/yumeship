import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WashiTape } from '@/components/deco/WashiTape';
import { Sparkle } from '@/components/deco/Sparkle';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { GradientCover } from '@/components/ui/GradientCover';
import { IconPlus } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { UnderInput } from '@/components/ui/UnderInput';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { setOnbField } from '@/store/onboarding';

export default function NewShipFO() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [fandom, setFandom] = useState('');
  const [nickname, setNickname] = useState('');

  function handleName(v: string) { setName(v); setOnbField('foName', v); }
  function handleFandom(v: string) { setFandom(v); setOnbField('fandom', v); }
  function handleNickname(v: string) {
    setNickname(v);
    setOnbField('nickname', v);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s2, paddingBottom: insets.bottom + Spacing.s2 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>new ship</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Who's the one?</Text>
        <Text style={styles.sub}>The first F/O. You can add more any time.</Text>

        <GradientCover
          gradStart={name ? '#f3b6c4' : '#e9d8cb'}
          gradEnd={name ? '#6b3d5b' : '#b09080'}
          style={styles.cover}
        >
          <View style={styles.coverTape}>
            <WashiTape width={80} height={16} pattern="heart" color="rgba(255,255,255,0.9)" rotate={-5} />
          </View>
          {name.trim().length > 0 ? (
            <>
              <Text style={styles.coverInitial}>{name.trim()[0]?.toUpperCase()}</Text>
              <View style={styles.coverSparkle}>
                <Sparkle size={14} color={Colors.butter} />
              </View>
            </>
          ) : (
            <View style={styles.coverPlaceholder}>
              <IconPlus size={26} color="rgba(255,255,255,0.9)" />
            </View>
          )}
          {name.trim().length > 0 && (
            <View style={styles.coverNameBadge}>
              <Text style={styles.coverNameText}>{name.trim()}</Text>
            </View>
          )}
        </GradientCover>

        <View style={styles.card}>
          <Field label="Their name">
            <UnderInput value={name} onChangeText={handleName} placeholder="e.g. Kafka" />
          </Field>
          <View style={styles.spacer} />
          <Field label="From (fandom / series)">
            <UnderInput value={fandom} onChangeText={handleFandom} placeholder="e.g. Honkai Star Rail" />
          </Field>
          <View style={styles.spacer} />
          <Field label="What you call them, privately">
            <UnderInput value={nickname} onChangeText={handleNickname} placeholder="a nickname, a feeling, anything" />
          </Field>
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={name.trim().length === 0}
          onPress={() => router.push('/new-ship/setup')}
        >
          {name.trim() ? `continue · ${name.trim()}` : 'enter their name first'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: Colors.ink2, fontFamily: FontFamily.ui },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s4, gap: 16 },
  heading: { fontFamily: FontFamily.displayItalic, fontSize: 28, lineHeight: 30, color: Colors.ink, letterSpacing: -0.3 },
  sub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2, marginTop: 2 },
  cover: { borderRadius: Radius.r4, height: 150, alignItems: 'center', justifyContent: 'center', ...Shadow.s2 },
  coverTape: { position: 'absolute', top: 10, left: 12 },
  coverInitial: { fontFamily: FontFamily.displayItalic, fontSize: 80, color: 'rgba(255,255,255,0.95)', lineHeight: 84 },
  coverSparkle: { position: 'absolute', top: 22, right: 40 },
  coverPlaceholder: {
    width: 64, height: 64, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  coverNameBadge: {
    position: 'absolute', bottom: 12, paddingVertical: 4, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  coverNameText: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.vellum },
  card: {
    padding: Spacing.s5, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r4, ...Shadow.s1,
  },
  spacer: { height: 14 },
  cta: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s2 },
});
