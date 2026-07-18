import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { Star } from '@/components/deco/Star';
import { StickerCassette } from '@/components/deco/Stickers';
import { TornEdge } from '@/components/deco/TornEdge';
import { WashiTape } from '@/components/deco/WashiTape';
import { Polaroid } from '@/components/templates/primitives';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { GalleryPhoto } from '@/store/fo';

const POLAROID_TAPES = [Colors.sakura, Colors.lavender, Colors.butter, Colors.sage, Colors.peach];

export type ProfileStatus = { label: string; color: string };

type Props = {
  name: string;
  pronouns?: string;
  /** unique public handle, e.g. "ashwin" — rendered as "@ashwin" near pronouns */
  username?: string;
  /** small line under the name, e.g. the F/O's source/fandom */
  subtitle?: string;
  bio?: string;
  photoUri?: string;
  /** avatar backdrop when there's no photo */
  fallbackColor?: string;
  /** relation status — F/O only, shown in the details grid labeled "type" */
  type?: ProfileStatus;
  /** sharing status — F/O only, shown in the details grid labeled "sharing" */
  sharing?: ProfileStatus;
  height?: string;
  weight?: string;
  /** theme song shown in its own row */
  song?: string;
  /** optional Spotify/YouTube/etc link — makes the song row tappable */
  songLink?: string;
  /** extra photos rendered as a scattered polaroid strip */
  gallery?: GalleryPhoto[];
  /** hero-card presentation customization */
  cardBgColor?: string;
  cardBgImage?: string;
  /** two comma-joined hex colors — wins over cardBgColor when set */
  cardBgGradient?: string;
  /** no hero fill at all — the page background shows through */
  cardTransparent?: boolean;
  textColor?: string;
  /** '' default dashed-avatar look | 'dashed' | 'double' | 'torn' | 'polaroid' */
  borderStyle?: string;
  /** '' classic washi+sparkles | 'sparkles' | 'hearts' | 'stars' | 'floral' | 'washi' | 'none' */
  decoration?: string;
  /** '' default display font | 'script' | 'marker' */
  nameFont?: string;
  /** short flair badge under the name, e.g. "comfort character" */
  statusLabel?: string;
};

const NAME_FONT_MAP: Record<string, string> = {
  script: FontFamily.script,
  marker: FontFamily.uiSemiBold,
};

// Each preset is a set of absolutely-positioned corner/edge ornaments layered
// over the hero. '' keeps the original hardcoded washi-tape + two sparkles.
function HeroDecoration({ decoration }: { decoration: string }) {
  if (decoration === 'none') return null;
  if (decoration === 'sparkles') {
    return (
      <>
        <View style={[styles.decoPos, { top: 12, right: 14 }]} pointerEvents="none"><Sparkle size={16} color={Colors.lavenderDeep} /></View>
        <View style={[styles.decoPos, { top: 30, right: 34 }]} pointerEvents="none"><Sparkle size={9} color={Colors.butterDeep} /></View>
        <View style={[styles.decoPos, { bottom: 14, left: 14 }]} pointerEvents="none"><Sparkle size={13} color={Colors.sakuraDeep} /></View>
        <View style={[styles.decoPos, { bottom: 32, left: 32 }]} pointerEvents="none"><Sparkle size={8} color={Colors.lavenderDeep} /></View>
      </>
    );
  }
  if (decoration === 'hearts') {
    return (
      <>
        <View style={[styles.decoPos, { top: 12, left: 14, transform: [{ rotate: '-14deg' }] }]} pointerEvents="none"><Heart size={14} color={Colors.sakuraDeep} /></View>
        <View style={[styles.decoPos, { top: 26, right: 16, transform: [{ rotate: '10deg' }] }]} pointerEvents="none"><Heart size={11} color={Colors.sakura} /></View>
        <View style={[styles.decoPos, { bottom: 14, right: 30, transform: [{ rotate: '-8deg' }] }]} pointerEvents="none"><Heart size={9} color={Colors.sakuraDeep} outline /></View>
        <View style={[styles.decoPos, { bottom: 24, left: 20, transform: [{ rotate: '12deg' }] }]} pointerEvents="none"><Heart size={12} color={Colors.sakura} /></View>
      </>
    );
  }
  if (decoration === 'stars') {
    return (
      <>
        <View style={[styles.decoPos, { top: 12, right: 14, transform: [{ rotate: '12deg' }] }]} pointerEvents="none"><Star size={14} color={Colors.butterDeep} /></View>
        <View style={[styles.decoPos, { top: 34, left: 18, transform: [{ rotate: '-10deg' }] }]} pointerEvents="none"><Star size={10} color={Colors.butter} /></View>
        <View style={[styles.decoPos, { bottom: 16, left: 32 }]} pointerEvents="none"><Sparkle size={9} color={Colors.butterDeep} /></View>
        <View style={[styles.decoPos, { bottom: 12, right: 24, transform: [{ rotate: '8deg' }] }]} pointerEvents="none"><Star size={12} color={Colors.butterDeep} /></View>
      </>
    );
  }
  if (decoration === 'floral') {
    return (
      <>
        <View style={[styles.decoPos, { top: 10, left: 12 }]} pointerEvents="none"><Sakura size={18} /></View>
        <View style={[styles.decoPos, { top: 26, left: 30 }]} pointerEvents="none"><Sakura size={11} color={Colors.lavender} /></View>
        <View style={[styles.decoPos, { bottom: 12, right: 14 }]} pointerEvents="none"><Sakura size={16} /></View>
        <View style={[styles.decoPos, { bottom: 30, right: 32 }]} pointerEvents="none"><Sakura size={10} color={Colors.lavender} /></View>
      </>
    );
  }
  if (decoration === 'washi') {
    return (
      <>
        <View style={[styles.decoPos, { top: -8, left: 18 }]} pointerEvents="none">
          <WashiTape width={64} height={14} pattern="stripe" color={Colors.lavender} rotate={-6} />
        </View>
        <View style={[styles.decoPos, { top: -8, right: 18 }]} pointerEvents="none">
          <WashiTape width={64} height={14} pattern="dot" color={Colors.sakura} rotate={5} />
        </View>
      </>
    );
  }
  // classic default
  return (
    <>
      <View style={styles.tape} pointerEvents="none">
        <WashiTape width={72} height={14} pattern="floral" color={Colors.sakura} rotate={-4} />
      </View>
      <View style={styles.sparkleTR} pointerEvents="none">
        <Sparkle size={14} color={Colors.lavenderDeep} />
      </View>
      <View style={styles.sparkleBL} pointerEvents="none">
        <Sparkle size={10} color={Colors.butterDeep} />
      </View>
    </>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Heart size={9} color={Colors.sakuraDeep} outline />
      <Text style={styles.sectionLabel}>{children}</Text>
    </View>
  );
}

export function ProfileCard({
  name,
  pronouns,
  username,
  subtitle,
  bio,
  photoUri,
  fallbackColor = Colors.sakura,
  type,
  sharing,
  height,
  weight,
  song,
  songLink,
  gallery = [],
  cardBgColor,
  cardBgImage,
  cardBgGradient,
  cardTransparent,
  textColor,
  borderStyle = '',
  decoration = '',
  nameFont = '',
  statusLabel,
}: Props) {
  const stats = [
    type ? { label: 'type', value: type.label, color: type.color } : null,
    sharing ? { label: 'sharing', value: sharing.label, color: sharing.color } : null,
    height ? { label: 'height', value: height } : null,
    weight ? { label: 'weight', value: weight } : null,
  ].filter(Boolean) as { label: string; value: string; color?: string }[];

  const textStyle = textColor ? { color: textColor } : null;
  const nameFontStyle = nameFont && NAME_FONT_MAP[nameFont] ? { fontFamily: NAME_FONT_MAP[nameFont] } : null;

  const gradientColors = cardBgGradient ? (cardBgGradient.split(',').filter(Boolean) as string[]) : null;
  // best-effort match so the torn strip reads as this card's own paper, not a random overlay
  const tornColor = cardTransparent ? Colors.paper
    : cardBgColor || (gradientColors && gradientColors[gradientColors.length - 1]) || Colors.vellum;

  // border frame treatment for the hero card
  const heroBorderStyle =
    borderStyle === 'dashed' ? { borderWidth: 1.5, borderStyle: 'dashed' as const, borderColor: Colors.lineStrong } :
    borderStyle === 'polaroid' ? { borderWidth: 10, borderColor: '#ffffff' } :
    borderStyle === 'torn' ? { borderBottomWidth: 0 } :
    null; // 'double' and '' keep the default 1px solid border

  // ── Hero: identity only — everything else lives in its own section below ──
  const heroContent = (
    <>
      <HeroDecoration decoration={decoration} />

      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: fallbackColor }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImg} contentFit="cover" />
          ) : (
            <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
          )}
        </View>
      </View>

      <View style={styles.nameRow}>
        <Text style={[styles.name, nameFontStyle, textStyle]} numberOfLines={1}>{name || '—'}</Text>
        {!!username && <Text style={[styles.username, textStyle]}>@{username}</Text>}
      </View>
      {!!pronouns && <Text style={[styles.pronouns, textStyle]}>{pronouns}</Text>}
      {!!subtitle && <Text style={[styles.subtitle, textStyle]}>{subtitle}</Text>}
      {!!statusLabel && (
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{statusLabel}</Text>
        </View>
      )}

      {borderStyle === 'double' && (
        <View style={styles.doubleBorderOverlay} pointerEvents="none" />
      )}
      {borderStyle === 'torn' && (
        <View style={styles.tornOverlay} pointerEvents="none">
          <TornEdge width={340} height={12} color={tornColor} />
        </View>
      )}
    </>
  );

  return (
    <View style={styles.page}>
      {cardBgImage ? (
        <ImageBackground source={{ uri: cardBgImage }} style={[styles.hero, heroBorderStyle]} imageStyle={styles.heroBgImage}>
          <View style={styles.heroImageOverlay} />
          {heroContent}
        </ImageBackground>
      ) : gradientColors && gradientColors.length >= 2 ? (
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, heroBorderStyle]}
        >
          {heroContent}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.hero,
            cardTransparent ? styles.heroTransparent : null,
            cardBgColor ? { backgroundColor: cardBgColor } : null,
            heroBorderStyle,
          ]}
        >
          {heroContent}
        </View>
      )}

      {/* about */}
      <View style={styles.section}>
        <SectionLabel>about</SectionLabel>
        <View style={styles.aboutCard}>
          <View style={styles.aboutTape} pointerEvents="none">
            <WashiTape width={52} height={12} pattern="dot" color={Colors.lavender} rotate={-5} />
          </View>
          <Text style={[styles.bio, !bio && styles.bioEmpty]}>
            {bio || 'nothing written yet…'}
          </Text>
        </View>
      </View>

      {/* details */}
      {stats.length > 0 && (
        <View style={styles.section}>
          <SectionLabel>details</SectionLabel>
          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <View key={s.label} style={styles.stat}>
                <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
                <Text style={[styles.statValue, s.color ? { color: s.color } : null]}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* theme song */}
      {!!song && (
        <View style={styles.section}>
          <SectionLabel>theme song</SectionLabel>
          <Pressable
            style={styles.songRow}
            onPress={songLink ? () => Linking.openURL(songLink) : undefined}
            disabled={!songLink}
          >
            <StickerCassette size={30} style={styles.songCassette} />
            <View style={styles.songTextCol}>
              <Text style={styles.songText} numberOfLines={2}>{song}</Text>
              {!!songLink && <Text style={styles.songLinkHint}>tap to listen ↗</Text>}
            </View>
          </Pressable>
        </View>
      )}

      {/* gallery */}
      {gallery.length > 0 && (
        <View style={styles.section}>
          <SectionLabel>gallery</SectionLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContent}
          >
            {gallery.map((photo, i) => (
              <Polaroid
                key={`${photo.uri}-${i}`}
                uri={photo.uri}
                caption={photo.caption}
                size={110}
                rotate={i % 2 === 0 ? -4 : 3}
                tapeColor={POLAROID_TAPES[i % POLAROID_TAPES.length]}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: Spacing.s5 },

  hero: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s5,
    paddingTop: Spacing.s6,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.s1,
  },
  heroBgImage: { borderRadius: Radius.r4 },
  heroImageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  heroTransparent: { backgroundColor: 'transparent', ...Platform.select({ ios: { shadowOpacity: 0 }, default: {} }), elevation: 0 },
  tape: { position: 'absolute', top: -8, alignSelf: 'center' },
  sparkleTR: { position: 'absolute', top: 14, right: 16 },
  sparkleBL: { position: 'absolute', bottom: 14, left: 16 },
  decoPos: { position: 'absolute' },
  doubleBorderOverlay: {
    position: 'absolute', top: 5, left: 5, right: 5, bottom: 5,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r4 - 5,
  },
  tornOverlay: { position: 'absolute', left: 0, right: 0, bottom: -1 },
  statusPill: {
    marginTop: Spacing.s2,
    paddingHorizontal: Spacing.s3, paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1, borderColor: Colors.line,
  },
  statusPillText: {
    fontFamily: FontFamily.uiMedium, fontSize: sf(10), color: Colors.ink2,
    letterSpacing: 0.4,
  },
  avatarWrap: {
    padding: 3,
    borderRadius: Radius.pill,
    borderWidth: 1.4,
    borderColor: Colors.line,
    borderStyle: 'dashed',
  },
  avatar: {
    width: 96, height: 96, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 96, height: 96, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(40), color: '#fff' },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.s3,
    maxWidth: '100%',
  },
  name: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(28),
    lineHeight: sf(34),
    color: Colors.ink,
    flexShrink: 1,
  },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.sakuraDeep, flexShrink: 0 },
  pronouns: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2, marginTop: 2 },
  subtitle: { fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3, letterSpacing: 1.2, marginTop: 5, textTransform: 'uppercase' },

  section: { gap: 6 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 2 },
  sectionLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3,
    letterSpacing: 1.4, textTransform: 'uppercase',
  },

  aboutCard: {
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    paddingTop: Spacing.s5,
    position: 'relative',
    ...Shadow.s1,
  },
  aboutTape: { position: 'absolute', top: -7, left: 14 },
  bio: {
    fontFamily: FontFamily.script,
    fontSize: sf(17),
    lineHeight: sf(24),
    color: Colors.ink2,
  },
  bioEmpty: { color: Colors.ink3 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.s2 },
  stat: {
    flexBasis: '48%', flexGrow: 1, alignItems: 'center', gap: 2,
    paddingVertical: Spacing.s3,
    backgroundColor: Colors.vellum,
    borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line,
  },
  statLabel: { fontFamily: FontFamily.marker, fontSize: sf(8), color: Colors.ink3, letterSpacing: 1.4 },
  statValue: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ink },

  songRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: Spacing.s3, paddingHorizontal: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line,
  },
  songCassette: { flexShrink: 0 },
  songTextCol: { flex: 1, gap: 1 },
  songText: { fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.ink, lineHeight: sf(19) },
  songLinkHint: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.sakuraDeep },

  galleryContent: { gap: 14, paddingVertical: 10, paddingHorizontal: 4 },
});
