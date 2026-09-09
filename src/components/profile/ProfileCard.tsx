import { Image } from 'expo-image';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Linking, LayoutChangeEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { LaceFrame } from '@/components/deco/LaceFrame';
import { NameOrnament } from '@/components/deco/NameOrnament';
import { PatternBackdrop } from '@/components/deco/PatternBackdrop';
import { StickerCassette } from '@/components/deco/Stickers';
import { StickerCorners } from '@/components/deco/StickerCorners';
import { TornEdge } from '@/components/deco/TornEdge';
import { WashiTape } from '@/components/deco/WashiTape';
import { Polaroid } from '@/components/templates/primitives';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { GalleryPhoto } from '@/store/fo';
import { AvatarFrame } from './AvatarFrame';
import { ProfileFlags } from './ProfileFlags';
import { parseBorderStyle, type ProfileFlag } from './cardTheme';

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
  /** short bio shown on the card itself, under the name/handle */
  tagline?: string;
  photoUri?: string;
  /** avatar backdrop when there's no photo */
  fallbackColor?: string;
  /** relation status — F/O only, shown in the details grid labeled "type" */
  type?: ProfileStatus;
  /** sharing status — F/O only, shown in the details grid labeled "sharing" */
  sharing?: ProfileStatus;
  height?: string;
  weight?: string;
  /** free text — F/O ages are as often "looks 20, actually 900" as a number */
  age?: string;
  /** free text — usually a day with no year, e.g. "March 3" */
  birthday?: string;
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
  /** '' (default) | 'torn' | 'polaroid' | 'lace' | 'stickers' | 'pattern' */
  borderStyle?: string;
  /** '' default display font | 'script' | 'marker' | 'klee' */
  nameFont?: string;
  /** '' (none) | a NAME_ORNAMENTS key — line art flanking the display name */
  nameOrnament?: string;
  /** everything they fly under the name */
  flags?: ProfileFlag[];
  /** '' (none) | 'custom' — frames just the avatar photo; more presets coming */
  avatarFrame?: string;
  /** uploaded custom frame image/gif — only meaningful when avatarFrame is 'custom' */
  avatarFrameUrl?: string;
  /** community follower/following counts, rendered under pronouns */
  followerCount?: number;
  followingCount?: number;
  /** follow/unfollow button slot, rendered under the counts — caller owns its state/handlers */
  followAction?: React.ReactNode;
  /** "profile identify" — show [me] ♡ [F/O] paired avatars instead of the solo one */
  showPairedIdentity?: boolean;
  pairedName?: string;
  pairedPronouns?: string;
  pairedAvatarUri?: string;
  pairedFallbackColor?: string;
};

const NAME_FONT_MAP: Record<string, string> = {
  script: FontFamily.script,
  marker: FontFamily.uiSemiBold,
  klee: FontFamily.ja,
};

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
  tagline,
  photoUri,
  fallbackColor = Colors.sakura,
  type,
  sharing,
  height,
  weight,
  age,
  birthday,
  song,
  songLink,
  gallery = [],
  cardBgColor,
  cardBgImage,
  cardBgGradient,
  cardTransparent,
  textColor,
  borderStyle = '',
  nameFont = '',
  nameOrnament = '',
  flags = [],
  avatarFrame = '',
  avatarFrameUrl = '',
  followerCount,
  followingCount,
  followAction,
  showPairedIdentity,
  pairedName,
  pairedPronouns,
  pairedAvatarUri,
  pairedFallbackColor = Colors.lavender,
}: Props) {
  const stats = [
    type ? { label: 'type', value: type.label, color: type.color } : null,
    sharing ? { label: 'sharing', value: sharing.label, color: sharing.color } : null,
    age ? { label: 'age', value: age } : null,
    birthday ? { label: 'birthday', value: birthday } : null,
    height ? { label: 'height', value: height } : null,
    weight ? { label: 'weight', value: weight } : null,
  ].filter(Boolean) as { label: string; value: string; color?: string }[];

  const textStyle = textColor ? { color: textColor } : null;
  const nameFontStyle = nameFont && NAME_FONT_MAP[nameFont] ? { fontFamily: NAME_FONT_MAP[nameFont] } : null;
  const ornamentColor = textColor || Colors.ink;

  const gradientColors = cardBgGradient ? (cardBgGradient.split(',').filter(Boolean) as string[]) : null;
  // best-effort match so the torn strip reads as this card's own paper, not a random overlay
  const tornColor = cardTransparent ? Colors.paper
    : cardBgColor || (gradientColors && gradientColors[gradientColors.length - 1]) || Colors.vellum;

  // hero card's rendered size — needed to size the lace/pattern SVG overlays to match
  const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });
  const onHeroLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setHeroSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  // edge treatment and decorations are independent axes packed into one string — see cardTheme.ts
  const { edge: borderEdge, stickers: hasStickers, pattern: hasPattern } = parseBorderStyle(borderStyle);

  // border frame treatment for the hero card
  const heroBorderStyle =
    borderEdge === 'polaroid' ? { borderWidth: 10, borderColor: '#ffffff' } :
    borderEdge === 'torn' ? { borderBottomWidth: 0 } :
    borderEdge === 'lace' ? { borderWidth: 0 } :
    null; // '' keeps the default 1px solid border

  // ── Hero: identity only — everything else lives in its own section below ──
  const heroContent = (
    <>
      {showPairedIdentity ? (
        <View style={styles.pairedWrap}>
          <View style={styles.pairedAvatarOuter}>
            <AvatarFrame kind={avatarFrame} url={avatarFrameUrl} size={74} />
            <View style={[styles.pairedAvatar, { backgroundColor: fallbackColor }]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.pairedAvatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.pairedAvatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
              )}
            </View>
          </View>
          <View style={styles.pairedHeartBadge}>
            <Heart size={13} color={Colors.sakuraDeep} />
          </View>
          <View style={styles.pairedAvatarOuter}>
            <AvatarFrame kind={avatarFrame} url={avatarFrameUrl} size={74} />
            <View style={[styles.pairedAvatar, { backgroundColor: pairedFallbackColor }]}>
              {pairedAvatarUri ? (
                <Image source={{ uri: pairedAvatarUri }} style={styles.pairedAvatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.pairedAvatarInitial}>{(pairedName ?? '').trim().charAt(0).toUpperCase() || '♡'}</Text>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.avatarOuter}>
          <AvatarFrame kind={avatarFrame} url={avatarFrameUrl} size={96} />
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: fallbackColor }]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {showPairedIdentity ? (
        <View style={styles.pairedNameRow}>
          <View style={styles.pairedNameCol}>
            <Text style={[styles.pairedNameText, nameFontStyle, textStyle]} numberOfLines={1}>{name || '—'}</Text>
            {!!pronouns && <Text style={[styles.pairedPronounsText, textStyle]}>{pronouns}</Text>}
          </View>
          <Heart size={10} color={Colors.sakuraDeep} />
          <View style={styles.pairedNameCol}>
            <Text style={[styles.pairedNameText, nameFontStyle, textStyle]} numberOfLines={1}>{pairedName || '—'}</Text>
            {!!pairedPronouns && <Text style={[styles.pairedPronounsText, textStyle]}>{pairedPronouns}</Text>}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.nameRow}>
            <View style={styles.nameGroup}>
              {!!nameOrnament && <NameOrnament kind={nameOrnament} size={16} color={ornamentColor} />}
              <Text style={[styles.name, nameFontStyle, textStyle]} numberOfLines={1}>{name || '—'}</Text>
              {!!nameOrnament && <NameOrnament kind={nameOrnament} size={16} color={ornamentColor} flip />}
            </View>
            {!!username && <Text style={[styles.username, textStyle]}>@{username}</Text>}
            {!!subtitle && <Text style={[styles.subtitle, textStyle]}>{subtitle}</Text>}
          </View>
          {!!pronouns && <Text style={[styles.pronouns, textStyle]}>{pronouns}</Text>}
          <ProfileFlags flags={flags} textColor={textColor} />
          {!!tagline && <Text style={[styles.tagline, textStyle]} numberOfLines={3}>{tagline}</Text>}
          {(followerCount !== undefined || followingCount !== undefined) && (
            <View style={styles.socialStatsRow}>
              <View style={styles.socialStat}>
                <Text style={[styles.socialStatValue, textStyle]}>{followerCount ?? 0}</Text>
                <Text style={styles.socialStatLabel}>followers</Text>
              </View>
              <View style={styles.socialStat}>
                <Text style={[styles.socialStatValue, textStyle]}>{followingCount ?? 0}</Text>
                <Text style={styles.socialStatLabel}>following</Text>
              </View>
            </View>
          )}
          {!!followAction && <View style={styles.followActionRow}>{followAction}</View>}
        </>
      )}

      {borderEdge === 'lace' && heroSize.width > 0 && (
        <LaceFrame width={heroSize.width} height={heroSize.height} />
      )}
      {borderEdge === 'torn' && (
        <View style={styles.tornOverlay} pointerEvents="none">
          <TornEdge width={340} height={12} color={tornColor} />
        </View>
      )}
    </>
  );

  const patternOverlay = hasPattern && heroSize.width > 0 && (
    <PatternBackdrop width={heroSize.width} height={heroSize.height} />
  );

  return (
    <View style={styles.page}>
      <View style={styles.heroWrap}>
        {cardBgImage ? (
          <View style={[styles.hero, heroBorderStyle]} onLayout={onHeroLayout}>
            <Image
              source={{ uri: cardBgImage }}
              style={[StyleSheet.absoluteFill, styles.heroBgImage]}
              contentFit="cover"
              {...MEDIA_IMAGE}
            />
            <View style={styles.heroImageOverlay} />
            {patternOverlay}
            {heroContent}
          </View>
        ) : gradientColors && gradientColors.length >= 2 ? (
          <LinearGradient
            colors={gradientColors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, heroBorderStyle]}
            onLayout={onHeroLayout}
          >
            {patternOverlay}
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
            onLayout={onHeroLayout}
          >
            {patternOverlay}
            {heroContent}
          </View>
        )}
        {hasStickers && <StickerCorners />}
      </View>

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

  heroWrap: { position: 'relative' },
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
  tornOverlay: { position: 'absolute', left: 0, right: 0, bottom: -1 },
  avatarOuter: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatarWrap: {
    padding: 3,
    borderRadius: Radius.pill,
    borderWidth: 1.4,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    position: 'relative',
  },
  avatar: {
    width: 96, height: 96, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 96, height: 96, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(40), color: '#fff' },
  pairedWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  pairedAvatarOuter: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  pairedAvatar: {
    width: 74, height: 74, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1.4, borderColor: Colors.line,
  },
  pairedAvatarImg: { width: 74, height: 74, borderRadius: Radius.pill },
  pairedAvatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(30), color: '#fff' },
  pairedHeartBadge: {
    width: 26, height: 26, borderRadius: Radius.pill,
    backgroundColor: Colors.vellum, borderWidth: 1.4, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: -7, zIndex: 1,
    ...Shadow.s1,
  },
  pairedNameRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: Spacing.s3, maxWidth: '100%',
  },
  pairedNameCol: { alignItems: 'center', maxWidth: 108, gap: 1 },
  pairedNameText: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(19), lineHeight: sf(23), color: Colors.ink,
  },
  pairedPronounsText: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink2 },
  nameGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
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
  tagline: {
    fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: sf(19),
    color: Colors.ink2, textAlign: 'center',
    marginTop: Spacing.s2, paddingHorizontal: Spacing.s2,
  },
  subtitle: { fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase', flexShrink: 0 },
  socialStatsRow: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: Spacing.s3 },
  socialStat: { alignItems: 'center' },
  socialStatValue: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.ink },
  socialStatLabel: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3, marginTop: 1 },
  followActionRow: { alignItems: 'center', marginTop: Spacing.s3 },

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
