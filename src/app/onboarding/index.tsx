import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart } from '@/components/deco/Heart';
import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { StickerSakuraFlower, StickerWaxSeal } from '@/components/deco/Stickers';
import { WashiTape } from '@/components/deco/WashiTape';
import { Button } from '@/components/ui/Button';
import { Colors, FontFamily, FontSize, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';

export default function OnbWelcome() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s4, paddingBottom: insets.bottom + Spacing.s4 }]}>
      {/* Sakura petal scatter — background accents */}
      <View style={styles.decoTL} pointerEvents="none">
        <Sakura size={28} color={Colors.sakura} />
      </View>
      <View style={styles.decoBR} pointerEvents="none">
        <Sakura size={22} color={Colors.sakura} />
      </View>
      <View style={styles.decoTR} pointerEvents="none">
        <Sparkle size={16} color={Colors.butter} />
      </View>

      {/* Main content */}
      <View style={[styles.content, column]}>
        <View style={styles.iconWrap}>
          <WashiTape
            width={64} height={12} pattern="floral" color="#fadde5" rotate={-3}
            style={{ alignSelf: 'center', marginBottom: -6, zIndex: 1 }}
          />
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.icon}
            resizeMode="cover"
          />
          <View style={[styles.stickerAbs, { bottom: -10, right: -22, transform: [{ rotate: '12deg' }] }]} pointerEvents="none">
            <StickerWaxSeal size={38} />
          </View>
          <View style={[styles.stickerAbs, { top: 0, left: -26, transform: [{ rotate: '-14deg' }] }]} pointerEvents="none">
            <StickerSakuraFlower size={34} />
          </View>
        </View>

        <Text style={styles.title}>yumeship</Text>

        <Text style={styles.ja}>夢 ・ ゆめしっぷ</Text>

        <Text style={styles.quote}>
          "A quiet place to keep them. Held close, like a letter you never sent!!"
        </Text>

        <View style={styles.decoRow}>
          <Sparkle size={14} color={Colors.sakuraDeep} />
          <Heart size={14} color={Colors.plum} outline />
          <Sparkle size={10} color={Colors.lavenderDeep} />
        </View>
      </View>

      {/* Bottom actions */}
      <View style={[styles.actions, column]}>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={() => router.push('/onboarding/showcase')}
          icon={<Heart size={14} color={Colors.vellum} />}
          iconPosition="right"
        >
          begin · let's meet them
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  decoTL: {
    position: 'absolute',
    top: 80,
    left: 20,
  },
  decoTR: {
    position: 'absolute',
    top: 100,
    right: 24,
  },
  decoBR: {
    position: 'absolute',
    bottom: 120,
    right: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.s7,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: Spacing.s6,
    position: 'relative',
    shadowColor: '#8b3a4a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 6,
  },
  stickerAbs: { position: 'absolute' },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  title: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(56),
    lineHeight: 54,
    letterSpacing: -1,
    color: Colors.ink,
    textAlign: 'center',
  },
  ja: {
    fontFamily: FontFamily.ja,
    fontSize: sf(14),
    color: Colors.ink2,
    textAlign: 'center',
    marginTop: Spacing.s2,
    letterSpacing: 1.4,
  },
  quote: {
    fontFamily: FontFamily.script,
    fontSize: FontSize.h5 - 4,
    lineHeight: 26,
    color: Colors.ink2,
    textAlign: 'center',
    marginTop: Spacing.s7,
    paddingHorizontal: Spacing.s4,
  },
  decoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.s5,
    alignItems: 'center',
  },
  actions: {
    paddingHorizontal: Spacing.s6,
    paddingBottom: Spacing.s3,
    gap: Spacing.s3,
  },
  skipPressable: {
    alignItems: 'center',
  },
  skip: {
    fontFamily: FontFamily.ui,
    fontSize: FontSize.meta,
    color: Colors.ink3,
    textDecorationLine: 'underline',
  },
});
