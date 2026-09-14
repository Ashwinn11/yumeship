import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';

import { BeadedFrame } from '@/components/deco/BeadedFrame';
import { BracketFrame } from '@/components/deco/BracketFrame';
import { DoubleLineFrame } from '@/components/deco/DoubleLineFrame';
import { FlourishCorners } from '@/components/deco/FlourishCorners';
import { HeartRippleBackdrop } from '@/components/deco/HeartRippleBackdrop';
import { HeartsBackdrop } from '@/components/deco/HeartsBackdrop';
import { LaceFrame } from '@/components/deco/LaceFrame';
import { LatticeFrame } from '@/components/deco/LatticeFrame';
import { MixedBackdrop } from '@/components/deco/MixedBackdrop';
import { PatternBackdrop } from '@/components/deco/PatternBackdrop';
import { SakuraDriftBackdrop } from '@/components/deco/SakuraDriftBackdrop';
import { ScatterBackdrop } from '@/components/deco/ScatterBackdrop';
import { StarsBackdrop } from '@/components/deco/StarsBackdrop';
import { StitchFrame } from '@/components/deco/StitchFrame';
import { WashBackdrop } from '@/components/deco/WashBackdrop';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import { parseBorderFrame } from './cardTheme';
import { SectionLabel } from './SectionLabel';

type Props = {
  about?: string;
  /** same presentation customization as the hero (ProfileCard) — the about
   *  card takes on whatever background/border/text styling the profile has,
   *  instead of always rendering plain. */
  cardBgColor?: string;
  cardBgImage?: string;
  cardBgGradient?: string;
  cardTransparent?: boolean;
  textColor?: string;
  borderStyle?: string;
};

/** The longer writeup, as its own card below the profile hero — separate
 *  from the short tagline that lives on the hero itself, same as a bio vs.
 *  an about page. Renders nothing when there's no about text set. */
export function AboutSection({
  about,
  cardBgColor,
  cardBgImage,
  cardBgGradient,
  cardTransparent,
  textColor,
  borderStyle = '',
}: Props) {
  if (!about) return null;

  const textStyle = textColor ? { color: textColor } : null;
  const frames = parseBorderFrame(borderStyle);
  const cardBorderStyle = (frames.lace || frames.lattice) ? { borderWidth: 0 } : null;
  const gradientColors = cardBgGradient ? (cardBgGradient.split(',').filter(Boolean) as string[]) : null;

  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const onCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCardSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const backdropOverlay = cardSize.width > 0 && (
    <>
      {frames.pattern && <PatternBackdrop width={cardSize.width} height={cardSize.height} />}
      {frames.scatter && <ScatterBackdrop width={cardSize.width} height={cardSize.height} />}
      {frames.wash && <WashBackdrop width={cardSize.width} height={cardSize.height} />}
      {frames.heartRipple && <HeartRippleBackdrop width={cardSize.width} height={cardSize.height} />}
      {frames.sakuraDrift && <SakuraDriftBackdrop width={cardSize.width} height={cardSize.height} />}
      {frames.hearts && <HeartsBackdrop width={cardSize.width} height={cardSize.height} />}
      {frames.stars && <StarsBackdrop width={cardSize.width} height={cardSize.height} />}
      {frames.mixed && <MixedBackdrop width={cardSize.width} height={cardSize.height} />}
    </>
  );

  const content = (
    <>
      <SectionLabel>about</SectionLabel>
      <Text style={[styles.text, textStyle]}>{about}</Text>
      {frames.lace && cardSize.width > 0 && <LaceFrame width={cardSize.width} height={cardSize.height} />}
      {frames.lattice && cardSize.width > 0 && <LatticeFrame width={cardSize.width} height={cardSize.height} />}
      {frames.stitch && cardSize.width > 0 && <StitchFrame width={cardSize.width} height={cardSize.height} />}
      {frames.flourish && cardSize.width > 0 && <FlourishCorners width={cardSize.width} height={cardSize.height} />}
      {frames.bracket && cardSize.width > 0 && <BracketFrame width={cardSize.width} height={cardSize.height} />}
      {frames.beaded && cardSize.width > 0 && <BeadedFrame width={cardSize.width} height={cardSize.height} />}
      {frames.double && cardSize.width > 0 && <DoubleLineFrame width={cardSize.width} height={cardSize.height} />}
    </>
  );

  if (cardBgImage) {
    return (
      <View style={[styles.section, cardBorderStyle]} onLayout={onCardLayout}>
        <Image
          source={{ uri: cardBgImage }}
          style={[StyleSheet.absoluteFill, styles.bgImage]}
          contentFit="cover"
          {...MEDIA_IMAGE}
        />
        <View style={styles.imageOverlay} />
        {backdropOverlay}
        {content}
      </View>
    );
  }

  if (gradientColors && gradientColors.length >= 2) {
    return (
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.section, cardBorderStyle]}
        onLayout={onCardLayout}
      >
        {backdropOverlay}
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.section,
        cardTransparent ? styles.sectionTransparent : null,
        cardBgColor ? { backgroundColor: cardBgColor } : null,
        cardBorderStyle,
      ]}
      onLayout={onCardLayout}
    >
      {backdropOverlay}
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  // this used to be a section inside ProfileCard's own gap-based wrapper —
  // now a sibling of it, it needs the same spacing itself instead. Card-
  // shaped to match the hero and F/O mini cards rather than sitting
  // transparent on the page background — unless the hero itself is themed
  // transparent, in which case this follows suit.
  section: {
    gap: 6, marginTop: Spacing.s5,
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.s1,
  },
  sectionTransparent: { backgroundColor: 'transparent', ...Platform.select({ ios: { shadowOpacity: 0 }, default: {} }), elevation: 0 },
  bgImage: { borderRadius: Radius.r4 },
  imageOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.55)' },
  text: {
    fontFamily: FontFamily.ui, fontSize: sf(13.5), lineHeight: sf(20),
    color: Colors.ink2, paddingHorizontal: 2,
  },
});
