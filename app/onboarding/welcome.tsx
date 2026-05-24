import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Mark } from '@/components';
import { Sparkle, Heart, SakuraConfetti } from '@/deco';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        {/* Sakura confetti background */}
        <View style={styles.confettiBg} pointerEvents="none">
          <SakuraConfetti />
        </View>

        {/* Center content */}
        <View style={styles.center}>
          <View style={styles.markWrap}>
            <Mark size={72} />
          </View>

          <Text style={styles.title}>yumeship</Text>

          <Text style={styles.ja}>夢 ・ ゆめしっぷ</Text>

          <Text style={styles.quote}>
            "A quiet place to keep them.{'\n'}Held close, like a letter you never sent."
          </Text>

          <View style={styles.decoRow}>
            <Sparkle size={14} color={colors.sakuraDeep} />
            <Heart size={14} color={colors.plum} outline />
            <Sparkle size={10} color={colors.lavenderDeep} />
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.footer}>
          <Pressable onPress={() => router.push('/onboarding/persona' as any)} style={styles.primaryBtn}>
            <Heart size={14} color={colors.vellum} />
            <Text style={styles.primaryBtnText}>begin · let's meet them</Text>
          </Pressable>
          <Pressable style={styles.skipBtn}>
            <Text style={styles.skipText}>I have an account</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    position: 'relative',
    overflow: 'hidden',
  },
  confettiBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.55,
  },
  center: {
    flex: 1,
    paddingHorizontal: spacing.s7,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  markWrap: {
    marginBottom: spacing.s6,
  },
  title: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 56,
    lineHeight: 53,
    letterSpacing: -1,
    color: colors.ink,
    textAlign: 'center',
  },
  ja: {
    fontFamily: 'KleeOne',
    fontSize: 14,
    color: colors.ink2,
    textAlign: 'center',
    marginTop: spacing.s2,
    letterSpacing: 1,
  },
  quote: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18,
    lineHeight: 26,
    color: colors.ink2,
    textAlign: 'center',
    marginTop: spacing.s7,
    paddingHorizontal: spacing.s3,
  },
  decoRow: {
    flexDirection: 'row',
    gap: spacing.s2 + 2,
    marginTop: spacing.s5,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing.s6,
    paddingBottom: spacing.s3,
    zIndex: 2,
    gap: spacing.s3,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: colors.sakuraDeep,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s2,
    ...shadows.md,
  },
  primaryBtnText: {
    color: colors.vellum,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  skipBtn: {
    alignItems: 'center',
  },
  skipText: {
    color: colors.ink3,
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
