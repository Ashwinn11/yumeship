import { Image } from 'expo-image';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Linking, LayoutChangeEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BeadedFrame } from '@/components/deco/BeadedFrame';
import { BracketFrame } from '@/components/deco/BracketFrame';
import { DoubleLineFrame } from '@/components/deco/DoubleLineFrame';
import { FlourishCorners } from '@/components/deco/FlourishCorners';
import { Heart } from '@/components/deco/Heart';
import { HeartRippleBackdrop } from '@/components/deco/HeartRippleBackdrop';
import { HeartsBackdrop } from '@/components/deco/HeartsBackdrop';
import { LaceFrame } from '@/components/deco/LaceFrame';
import { LatticeFrame } from '@/components/deco/LatticeFrame';
import { MixedBackdrop } from '@/components/deco/MixedBackdrop';
import { PatternBackdrop } from '@/components/deco/PatternBackdrop';
import { SakuraDriftBackdrop } from '@/components/deco/SakuraDriftBackdrop';
import { ScatterBackdrop } from '@/components/deco/ScatterBackdrop';
import { StarsBackdrop } from '@/components/deco/StarsBackdrop';
import { StickerCassette } from '@/components/deco/Stickers';
import { StitchFrame } from '@/components/deco/StitchFrame';
import { WashBackdrop } from '@/components/deco/WashBackdrop';
import { Polaroid } from '@/components/templates/primitives';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { GalleryPhoto } from '@/store/fo';
import { ProfileFlags } from './ProfileFlags';
import { parseBorderFrame, type ProfileFlag, type ProfileLink } from './cardTheme';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const POLAROID_TAPES = [Colors.sakura, Colors.lavender, Colors.butter, Colors.sage, Colors.peach];

// type/sharing are the only two fields here that are actually a *status*
// (they share RelationshipColors/SharingColors with badges everywhere else in
// the app) — so they're the only two that get a colored pill. Age/birthday/
// height/weight are plain facts; coloring them would be decoration standing
// in for meaning they don't have, so they stay plain text.
const PILL_SOFT_BY_DEEP: Record<string, string> = {
  [Colors.sakuraDeep]: Colors.sakuraSoft,
  [Colors.sageDeep]: Colors.sageSoft,
  [Colors.peachDeep]: Colors.peachSoft,
  [Colors.lavenderDeep]: Colors.lavenderSoft,
  [Colors.butterDeep]: Colors.butterSoft,
  [Colors.ember]: Colors.paperDeep,
};

export type ProfileStatus = { label: string; color: string };

type Props = {
  name: string;
  pronouns?: string;
  /** unique public handle, e.g. "ashwin" — rendered as "@ashwin" near pronouns */
  username?: string;
  /** small line under the name, e.g. the F/O's source/fandom */
  subtitle?: string;
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
  /** comma-joined border-frame accents — see cardTheme.ts BORDER_FRAMES; '' for none */
  borderStyle?: string;
  /** '' default display font | 'script' | 'marker' | 'klee' */
  nameFont?: string;
  /** everything they fly under the name */
  flags?: ProfileFlag[];
  /** external links shown in their own card section — socials, playlists, etc. */
  links?: ProfileLink[];
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
  flags = [],
  links = [],
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
    type ? { label: 'type', value: type.label, color: type.color, pill: true } : null,
    sharing ? { label: 'sharing', value: sharing.label, color: sharing.color, pill: true } : null,
    age ? { label: 'age', value: age } : null,
    birthday ? { label: 'birthday', value: birthday } : null,
    height ? { label: 'height', value: height } : null,
    weight ? { label: 'weight', value: weight } : null,
  ].filter(Boolean) as { label: string; value: string; color?: string; pill?: boolean }[];

  const textStyle = textColor ? { color: textColor } : null;
  const nameFontStyle = nameFont && NAME_FONT_MAP[nameFont] ? { fontFamily: NAME_FONT_MAP[nameFont] } : null;

  const gradientColors = cardBgGradient ? (cardBgGradient.split(',').filter(Boolean) as string[]) : null;

  // hero card's rendered size — needed to size the lace/pattern SVG overlays to match
  const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });
  const onHeroLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setHeroSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  // every border-frame accent is independently toggleable — see cardTheme.ts
  const frames = parseBorderFrame(borderStyle);

  // lace/lattice draw a full-perimeter band matching the card's own shape,
  // so they replace the hero's default 1px solid border; the rest are inset
  // accents or backdrop fills that sit fine alongside the plain border
  const heroBorderStyle = (frames.lace || frames.lattice) ? { borderWidth: 0 } : null;

  // ── Hero: identity only — everything else lives in its own section below ──
  const heroContent = (
    <>
      {showPairedIdentity ? (
        <View style={styles.pairedWrap}>
          <View style={styles.pairedAvatarOuter}>
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
              <Text style={[styles.name, nameFontStyle, textStyle]} numberOfLines={1}>{name || '—'}</Text>
            </View>
            {!!username && <Text style={[styles.username, textStyle]}>@{username}</Text>}
            {!!subtitle && <Text style={[styles.subtitle, textStyle]}>{subtitle}</Text>}
          </View>
          {!!pronouns && <Text style={[styles.pronouns, textStyle]}>{pronouns}</Text>}
          <ProfileFlags flags={flags} textColor={textColor} />
          {!!tagline && <Text style={[styles.tagline, textStyle]} numberOfLines={3}>{tagline}</Text>}
          {links.length > 0 && (
            <View style={styles.linksRow}>
              {links.map((l) => (
                <Pressable key={l.id} style={styles.linkPill} onPress={() => Linking.openURL(normalizeUrl(l.url))}>
                  <Text style={styles.linkPillText} numberOfLines={1}>{l.label || l.url}</Text>
                </Pressable>
              ))}
            </View>
          )}
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

      {frames.lace && heroSize.width > 0 && <LaceFrame width={heroSize.width} height={heroSize.height} />}
      {frames.lattice && heroSize.width > 0 && <LatticeFrame width={heroSize.width} height={heroSize.height} />}
      {frames.stitch && heroSize.width > 0 && <StitchFrame width={heroSize.width} height={heroSize.height} />}
      {frames.flourish && heroSize.width > 0 && <FlourishCorners width={heroSize.width} height={heroSize.height} />}
      {frames.bracket && heroSize.width > 0 && <BracketFrame width={heroSize.width} height={heroSize.height} />}
      {frames.beaded && heroSize.width > 0 && <BeadedFrame width={heroSize.width} height={heroSize.height} />}
      {frames.double && heroSize.width > 0 && <DoubleLineFrame width={heroSize.width} height={heroSize.height} />}
    </>
  );

  const backdropOverlay = heroSize.width > 0 && (
    <>
      {frames.pattern && <PatternBackdrop width={heroSize.width} height={heroSize.height} />}
      {frames.scatter && <ScatterBackdrop width={heroSize.width} height={heroSize.height} />}
      {frames.wash && <WashBackdrop width={heroSize.width} height={heroSize.height} />}
      {frames.heartRipple && <HeartRippleBackdrop width={heroSize.width} height={heroSize.height} />}
      {frames.sakuraDrift && <SakuraDriftBackdrop width={heroSize.width} height={heroSize.height} />}
      {frames.hearts && <HeartsBackdrop width={heroSize.width} height={heroSize.height} />}
      {frames.stars && <StarsBackdrop width={heroSize.width} height={heroSize.height} />}
      {frames.mixed && <MixedBackdrop width={heroSize.width} height={heroSize.height} />}
    </>
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
            {backdropOverlay}
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
            {backdropOverlay}
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
            {backdropOverlay}
            {heroContent}
          </View>
        )}
      </View>

      {/* details — one card, grouped by spacing; only type/sharing (real
          statuses) get a colored pill, everything else is plain text */}
      {stats.length > 0 && (
        <View style={styles.section}>
          <SectionLabel>details</SectionLabel>
          <View style={styles.detailsCard}>
            {stats.map((s) => (
              <View key={s.label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{s.label.toUpperCase()}</Text>
                {s.pill ? (
                  <View style={[styles.detailPill, { backgroundColor: PILL_SOFT_BY_DEEP[s.color!] ?? Colors.paperDeep }]}>
                    <Text style={[styles.detailPillText, { color: s.color }]}>{s.value}</Text>
                  </View>
                ) : (
                  <Text style={styles.detailValue}>{s.value}</Text>
                )}
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

  // one card — items inside are grouped by space (generous columnGap/rowGap),
  // not by six repeated boxes
  detailsCard: {
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    flexDirection: 'row', flexWrap: 'wrap',
    rowGap: Spacing.s4, columnGap: Spacing.s5,
    ...Shadow.s1,
  },
  detailItem: { flexBasis: '28%', flexGrow: 1, gap: 3 },
  detailLabel: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2 },
  detailValue: { fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.ink },
  detailPill: {
    alignSelf: 'flex-start',
    paddingVertical: 3, paddingHorizontal: 11,
    borderRadius: Radius.pill,
  },
  detailPillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12.5) },

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

  linksRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 8, marginTop: Spacing.s3, paddingHorizontal: Spacing.s2,
  },
  linkPill: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep,
    borderWidth: 1, borderColor: Colors.line,
    maxWidth: '100%',
  },
  linkPillText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12.5), color: Colors.sakuraDeep },

  galleryContent: { gap: 14, paddingVertical: 10, paddingHorizontal: 4 },
});
