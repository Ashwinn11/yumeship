import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StepDots } from '@/components/ui/StepDots';
import { TEMPLATE_CONFIG } from '@/constants/templateConfig';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { addShip } from '@/store/ships';
import { buildInitialData, getOnbState, resetOnb } from '@/store/onboarding';

const TEMPLATES = Object.entries(TEMPLATE_CONFIG).map(([key, cfg]) => ({ key, ...cfg }));

export default function OnbTemplate() {
  const insets = useSafeAreaInsets();

  const select = (templateKey: string) => {
    const state = getOnbState();
    const data = buildInitialData(templateKey, state);
    const shipId = addShip({
      templateKey,
      foName: state.foName.trim() || 'untitled',
      data,
    });
    resetOnb();
    router.replace({
      pathname: `/template/${templateKey}` as any,
      params: { shipId },
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s3 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={4} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>step four · your template</Text>
        <Text style={styles.heading}>How do you want{'\n'}to tell your story?</Text>
        <Text style={styles.sub}>
          Pick a template for your first ship. You can use others later.
        </Text>

        <View style={styles.grid}>
          {TEMPLATES.map((t) => (
            <Pressable key={t.key} style={styles.card} onPress={() => select(t.key)}>
              <LinearGradient
                colors={[t.gradStart, t.gradEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGrad}
              >
                <Text style={styles.cardTitle}>{t.title}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  dotsRow: {
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s1,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s5,
    paddingBottom: Spacing.s6,
  },
  eyebrow: {
    fontFamily: FontFamily.marker,
    fontSize: 10,
    color: Colors.lavenderDeep,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: Colors.ink,
    marginTop: Spacing.s2,
  },
  sub: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.meta,
    color: Colors.ink2,
    lineHeight: 20,
    marginTop: Spacing.s2,
    marginBottom: Spacing.s5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47%',
    borderRadius: Radius.r4,
    overflow: 'hidden',
  },
  cardGrad: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  cardTitle: {
    fontFamily: FontFamily.markerBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
