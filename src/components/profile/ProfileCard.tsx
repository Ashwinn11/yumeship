import { Image } from 'expo-image';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Linking, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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
import { StitchFrame } from '@/components/deco/StitchFrame';
import { WashBackdrop } from '@/components/deco/WashBackdrop';
import { Polaroid } from '@/components/templates/primitives';
import { calcElapsed } from '@/components/ui/DateField';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { EquippedBlinkie } from '@/constants/blinkies';
import type { GalleryPhoto } from '@/store/fo';
import { ProfileFlags } from './ProfileFlags';
import { BlinkieWall } from './BlinkieWall';
import { SongDiscCard } from './SongDiscCard';
import { parseBorderFrame, type ProfileFlag, type ProfileLink, type ProfileSong } from './cardTheme';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}


const POLAROID_TAPES = [Colors.sakura, Colors.lavender, Colors.butter, Colors.sage, Colors.peach];
// galleryGrid's own paddingHorizontal:4 on each side, plus a couple px of
// rounding slack — without it, two cards computed to fill the row exactly
// come out a hair too wide and flexWrap quietly drops to one per row
const GALLERY_GRID_PADDING = 4 * 2 + 2;

// type/sharing are the only two fields here that are actually a *status*
// (they share RelationshipColors/SharingColors with badges everywhere else in
// the app) — so they're the only two that get a colored pill. "since" is a
// plain fact; coloring it would be decoration standing in for meaning it
// doesn't have, so it stays plain text.
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
  /** together-since date — F/O only, stored as "YYYY-MM-DD", independent of the ship's own start date */
  since?: string;
  /** theme songs — rendered in the same strip as gallery, as tappable
   *  spinning-disc cards, not a separate section */
  songs?: ProfileSong[];
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
  /** '' (avatar above name, everything centered) | 'left' (avatar beside name, Instagram-style) */
  cardLayout?: string;
  /** blinkie templates + text equipped on this profile's wall — see constants/blinkies.ts */
  blinkies?: EquippedBlinkie[];
  /** everything they fly under the name */
  flags?: ProfileFlag[];
  /** external links shown in their own card section — socials, playlists, etc. */
  links?: ProfileLink[];
  /** community follower/following counts, rendered under pronouns */
  followerCount?: number;
  followingCount?: number;
  /** tap targets for the counts above — omit to render them as plain, unpressable text */
  onPressFollowers?: () => void;
  onPressFollowing?: () => void;
  /** follow/unfollow button slot, rendered under the counts — caller owns its state/handlers */
  followAction?: React.ReactNode;
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
  since,
  songs = [],
  gallery = [],
  cardBgColor,
  cardBgImage,
  cardBgGradient,
  cardTransparent,
  textColor,
  borderStyle = '',
  nameFont = '',
  cardLayout = '',
  blinkies,
  flags = [],
  links = [],
  followerCount,
  followingCount,
  onPressFollowers,
  onPressFollowing,
  followAction,
}: Props) {
  const elapsed = since ? calcElapsed(since) : null;
  const stats = [
    type ? { label: 'type', value: type.label, color: type.color, pill: true } : null,
    sharing ? { label: 'sharing', value: sharing.label, color: sharing.color, pill: true } : null,
    elapsed ? { label: 'since', value: elapsed.label } : null,
  ].filter(Boolean) as { label: string; value: string; color?: string; pill?: boolean }[];

  const textStyle = textColor ? { color: textColor } : null;
  const nameFontStyle = nameFont && NAME_FONT_MAP[nameFont] ? { fontFamily: NAME_FONT_MAP[nameFont] } : null;
  const isLeft = cardLayout === 'left';

  const gradientColors = cardBgGradient ? (cardBgGradient.split(',').filter(Boolean) as string[]) : null;

  // hero card's rendered size — needed to size the lace/pattern SVG overlays to match
  const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });
  const onHeroLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setHeroSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  // songs+gallery grid: two per row, sized to actually fill the row instead
  // of a small fixed square with empty space beside it. onLayout reports the
  // grid's own border-box width — its horizontal padding has to come out
  // before dividing, or the computed card width is a few px too wide for two
  // to fit and flexWrap silently drops to one per row.
  const [galleryWidth, setGalleryWidth] = useState(0);
  const onGalleryLayout = (e: LayoutChangeEvent) => setGalleryWidth(e.nativeEvent.layout.width);
  const galleryCardSize = galleryWidth ? (galleryWidth - GALLERY_GRID_PADDING - Spacing.s3) / 2 : 150;

  // every border-frame accent is independently toggleable — see cardTheme.ts
  const frames = parseBorderFrame(borderStyle);

  // lace/lattice draw a full-perimeter band matching the card's own shape,
  // so they replace the hero's default 1px solid border; the rest are inset
  // accents or backdrop fills that sit fine alongside the plain border
  const heroBorderStyle = (frames.lace || frames.lattice) ? { borderWidth: 0 } : null;

  // followers/following now sits right under pronouns, above flags/tagline/
  // links — the identity+stats cluster reads as one block before anything
  // else about the card, same as it would on Instagram; defined once and
  // reused by both layouts below rather than duplicated per branch
  const statsContent = (followerCount !== undefined || followingCount !== undefined) ? (
    <>
      <Pressable style={styles.socialStat} onPress={onPressFollowers} disabled={!onPressFollowers} hitSlop={6}>
        <Text style={[styles.socialStatValue, textStyle]}>{followerCount ?? 0}</Text>
        <Text style={styles.socialStatLabel}>followers</Text>
      </Pressable>
      <Pressable style={styles.socialStat} onPress={onPressFollowing} disabled={!onPressFollowing} hitSlop={6}>
        <Text style={[styles.socialStatValue, textStyle]}>{followingCount ?? 0}</Text>
        <Text style={styles.socialStatLabel}>following</Text>
      </Pressable>
    </>
  ) : null;

  // ── Hero: identity only — everything else lives in its own section below ──
  const heroContent = (
    <>
      {isLeft ? (
        <View style={styles.leftHeaderRow}>
          <View style={styles.avatarWrapLeft}>
            <View style={[styles.avatarLeft, { backgroundColor: fallbackColor }]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImgLeft} contentFit="cover" />
              ) : (
                <Text style={styles.avatarInitialLeft}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
              )}
            </View>
          </View>
          <View style={styles.leftTextCol}>
            <View style={styles.leftNameRow}>
              <Text style={[styles.name, styles.nameLeft, nameFontStyle, textStyle]} numberOfLines={1}>{name || '—'}</Text>
              {!!username && <Text style={[styles.username, textStyle]}>@{username}</Text>}
            </View>
            {!!subtitle && <Text style={[styles.subtitle, textStyle]}>{subtitle}</Text>}
            {!!pronouns && <Text style={[styles.pronouns, styles.pronounsLeft, textStyle]}>{pronouns}</Text>}
            {!!statsContent && <View style={styles.socialStatsRowLeft}>{statsContent}</View>}
          </View>
        </View>
      ) : (
        <>
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

          <View style={styles.nameRow}>
            <View style={styles.nameGroup}>
              <Text style={[styles.name, nameFontStyle, textStyle]} numberOfLines={1}>{name || '—'}</Text>
            </View>
            {!!username && <Text style={[styles.username, textStyle]}>@{username}</Text>}
            {!!subtitle && <Text style={[styles.subtitle, textStyle]}>{subtitle}</Text>}
          </View>
          {!!pronouns && <Text style={[styles.pronouns, textStyle]}>{pronouns}</Text>}
          {!!statsContent && <View style={styles.socialStatsRow}>{statsContent}</View>}
        </>
      )}
      <ProfileFlags flags={flags} textColor={textColor} />
      {!!blinkies?.length && (
        <View style={styles.blinkieWallCentered}>
          <BlinkieWall items={blinkies} />
        </View>
      )}
      {!!tagline && (
        <Text style={[styles.tagline, textStyle]} numberOfLines={3}>{tagline}</Text>
      )}
      {links.length > 0 && (
        <View style={styles.linksRow}>
          {links.map((l) => (
            <Pressable key={l.id} style={styles.linkPill} onPress={() => Linking.openURL(normalizeUrl(l.url))}>
              <Text style={styles.linkPillText} numberOfLines={1}>{l.label || l.url}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {stats.length > 0 && (
        <View style={styles.detailsGrid}>
          {stats.map((s, i) => (
            <View key={s.label} style={[styles.detailItem, i > 0 && styles.detailItemDivider]}>
              <Text style={styles.detailLabel}>{s.label.toUpperCase()}</Text>
              {s.pill ? (
                <View style={[styles.detailPill, { backgroundColor: PILL_SOFT_BY_DEEP[s.color!] ?? Colors.paperDeep }]}>
                  <Text style={[styles.detailPillText, { color: s.color }]} numberOfLines={2}>{s.value}</Text>
                </View>
              ) : (
                <Text style={[styles.detailValue, textStyle]} numberOfLines={2}>{s.value}</Text>
              )}
            </View>
          ))}
        </View>
      )}
      {!!followAction && <View style={styles.followActionRow}>{followAction}</View>}

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

      {/* songs + gallery share one grid — both are card-shaped now (a
          spinning disc, a polaroid) — two per row, sized to fill the row
          rather than a small fixed square with room to spare beside it */}
      {(songs.length > 0 || gallery.length > 0) && (
        <View style={styles.section}>
          <SectionLabel>gallery</SectionLabel>
          <View style={styles.galleryGrid} onLayout={onGalleryLayout}>
            {songs.map((s) => (
              <SongDiscCard key={s.id} song={s} size={galleryCardSize} />
            ))}
            {gallery.map((photo, i) => (
              <Polaroid
                key={`${photo.uri}-${i}`}
                uri={photo.uri}
                caption={photo.caption}
                size={galleryCardSize}
                rotate={0}
                tapeColor={POLAROID_TAPES[i % POLAROID_TAPES.length]}
              />
            ))}
          </View>
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

  // ── left-aligned layout: avatar beside name/username/pronouns, Instagram-style ──
  leftHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s4, width: '100%' },
  avatarWrapLeft: {
    padding: 3,
    borderRadius: Radius.pill,
    borderWidth: 1.4,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    flexShrink: 0,
  },
  avatarLeft: {
    width: 72, height: 72, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImgLeft: { width: 72, height: 72, borderRadius: Radius.pill },
  avatarInitialLeft: { fontFamily: FontFamily.displayItalic, fontSize: sf(30), color: '#fff' },
  leftTextCol: { flex: 1, minWidth: 0, gap: 2 },
  leftNameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  nameLeft: { fontSize: sf(20), lineHeight: sf(25) },
  pronounsLeft: { marginTop: 1 },

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
  // used wherever pronouns sits beside the identity badge instead of alone —
  // the row wrapper carries the spacing from the line above instead
  blinkieWallCentered: { alignItems: 'center', marginTop: 6 },
  tagline: {
    fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: sf(19),
    color: Colors.ink2, textAlign: 'center',
    marginTop: Spacing.s2, paddingHorizontal: Spacing.s2,
  },
  subtitle: { fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase', flexShrink: 0 },
  socialStatsRow: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: Spacing.s3 },
  // left layout: tighter gap and no top margin of its own — leftTextCol's
  // own `gap` already spaces it from the pronouns line above
  socialStatsRowLeft: { flexDirection: 'row', justifyContent: 'flex-start', gap: 18, marginTop: 2 },
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

  // part of the hero now, not its own card — up to three equal columns
  // (type/sharing/since), each getting the full edge-to-edge width divided
  // evenly rather than a compact wrapped cluster, since relation and sharing
  // are free text now and need room for more than a one-word label
  detailsGrid: {
    flexDirection: 'row',
    marginTop: Spacing.s4, paddingTop: Spacing.s3,
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
    width: '100%',
  },
  detailItem: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: Spacing.s2 },
  detailItemDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,0.08)' },
  detailLabel: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2 },
  detailValue: { fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.ink, textAlign: 'center' },
  detailPill: {
    alignSelf: 'center', maxWidth: '100%',
    paddingVertical: 3, paddingHorizontal: 11,
    borderRadius: Radius.pill,
  },
  detailPillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12.5), textAlign: 'center' },

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

  galleryGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing.s3, paddingVertical: 10, paddingHorizontal: 4,
  },
});
