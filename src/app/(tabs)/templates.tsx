import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mark } from '@/components/ui/Mark';
import { Ribbon } from '@/components/deco/Ribbon';
import { WashiTape } from '@/components/deco/WashiTape';
import { Sparkle } from '@/components/deco/Sparkle';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

const TEMPLATES = [
  { key: 'get-to-know', title: 'Get to Know Them',   tapePattern: 'heart'  as const, color: Colors.sakuraDeep, bg: Colors.sakuraSoft },
  { key: 'kawaii-ui',   title: 'Kawaii UI',           tapePattern: 'dot'   as const, color: Colors.lavenderDeep, bg: Colors.lavenderSoft },
  { key: 'heart-frame', title: 'Heart Frame',         tapePattern: 'stripe'as const, color: Colors.peachDeep, bg: Colors.peachSoft },
  { key: 'aesthetic',   title: 'Aesthetic Board',     tapePattern: 'check' as const, color: Colors.butterDeep, bg: Colors.butterSoft },
  { key: 'love-letter', title: 'Love Letter',         tapePattern: 'heart' as const, color: Colors.sakuraInk, bg: Colors.sakuraSoft },
];

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Background accents */}
      <View style={styles.decoTR} pointerEvents="none">
        <Ribbon size={24} color={Colors.sakuraSoft} />
      </View>
      <View style={styles.decoBL} pointerEvents="none">
        <Sparkle size={18} color={Colors.lavenderSoft} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Mark size={26} />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>templates</Text>
          <Sparkle size={14} color={Colors.butterDeep} />
        </View>
        <Text style={styles.sub}>tap to open a template page</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {TEMPLATES.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.card, { backgroundColor: t.bg }]}
            onPress={() => router.push(('/template/' + t.key) as any)}
          >
            <View style={styles.cardTape}>
              <WashiTape width={48} height={12} pattern={t.tapePattern} color={t.color} rotate={-5} />
            </View>
            <View style={styles.cardInner}>
              <Text style={[styles.cardTitle, { color: t.color }]}>{t.title}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  header: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: Spacing.s4,
  },
  title: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 34,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  sub: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.meta,
    color: Colors.ink2,
    marginTop: Spacing.s1,
  },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.s4,
    gap: 10,
  },
  card: {
    width: '47%',
    aspectRatio: 3 / 4,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
    position: 'relative',
  },
  cardTape: {
    position: 'absolute',
    top: -4,
    left: 8,
  },
  cardInner: {
    flex: 1,
    padding: Spacing.s4,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontFamily: FontFamily.markerBold,
    fontSize: 13,
    lineHeight: 17,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  decoTR: {
    position: 'absolute',
    top: 100,
    right: 24,
    opacity: 0.6,
  },
  decoBL: {
    position: 'absolute',
    bottom: 140,
    left: 24,
    opacity: 0.45,
  },
});
