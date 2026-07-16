import { Image } from 'expo-image';
import { ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { StickerCassette } from '@/components/deco/Stickers';
import { WashiTape } from '@/components/deco/WashiTape';
import { Polaroid } from '@/components/templates/primitives';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { GalleryPhoto } from '@/store/fo';

const POLAROID_TAPES = [Colors.sakura, Colors.lavender, Colors.butter, Colors.sage, Colors.peach];

export type ProfileStatus = { label: string; color: string };

type Props = {
  name: string;
  pronouns?: string;
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
  textColor?: string;
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
  textColor,
}: Props) {
  const stats = [
    type ? { label: 'type', value: type.label, color: type.color } : null,
    sharing ? { label: 'sharing', value: sharing.label, color: sharing.color } : null,
    height ? { label: 'height', value: height } : null,
    weight ? { label: 'weight', value: weight } : null,
  ].filter(Boolean) as { label: string; value: string; color?: string }[];

  const textStyle = textColor ? { color: textColor } : null;

  // ── Hero: identity only — everything else lives in its own section below ──
  const heroContent = (
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

      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: fallbackColor }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImg} contentFit="cover" />
          ) : (
            <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
          )}
        </View>
      </View>

      <Text style={[styles.name, textStyle]}>{name || '—'}</Text>
      {!!pronouns && <Text style={[styles.pronouns, textStyle]}>{pronouns}</Text>}
      {!!subtitle && <Text style={[styles.subtitle, textStyle]}>{subtitle}</Text>}
    </>
  );

  return (
    <View style={styles.page}>
      {cardBgImage ? (
        <ImageBackground source={{ uri: cardBgImage }} style={styles.hero} imageStyle={styles.heroBgImage}>
          <View style={styles.heroImageOverlay} />
          {heroContent}
        </ImageBackground>
      ) : (
        <View style={[styles.hero, cardBgColor ? { backgroundColor: cardBgColor } : null]}>
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
  tape: { position: 'absolute', top: -8, alignSelf: 'center' },
  sparkleTR: { position: 'absolute', top: 14, right: 16 },
  sparkleBL: { position: 'absolute', bottom: 14, left: 16 },
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
  name: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(28),
    lineHeight: sf(34),
    color: Colors.ink,
    marginTop: Spacing.s3,
    textAlign: 'center',
  },
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
