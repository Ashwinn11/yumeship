import { Ribbon } from '@/components/deco/Ribbon';
import { WashiTape } from '@/components/deco/WashiTape';
import { GradientCover } from '@/components/ui/GradientCover';
import { Colors, FontFamily, FontSize, Radius, Shadow ,sf } from '@/constants/theme';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

// design/screens.jsx — ShipCard
// F/O card: 3/4 aspect, gradient cover, washi tape, optional pin + polycule badge.

type TapePattern = 'stripe' | 'dot' | 'heart' | 'check' | 'floral' | 'lace' | 'grid' | 'gingham' | 'star' | 'solid';

type Props = {
  name: string;
  shipName?: string;
  myName?: string;
  src: string;
  initial: string;
  gradStart: string;
  gradEnd: string;
  /** Optional photo cover; replaces the gradient + initial when set */
  coverUri?: string;
  type: 'romantic' | 'platonic' | 'familial';
  pinned?: boolean;
  polycule?: boolean;
  days: string;
  tapePattern?: TapePattern;
  tapeColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
};

const TYPE_COLORS: Record<string, string> = {
  romantic: Colors.sakuraDeep,
  platonic: Colors.sageDeep,
  familial: Colors.peachDeep,
};

export function ShipCard({
  name,
  shipName,
  myName,
  src,
  initial,
  gradStart,
  gradEnd,
  coverUri,
  type,
  pinned,
  polycule,
  days,
  tapePattern = 'heart',
  tapeColor = Colors.vellum,
  onPress,
  onLongPress,
  style,
}: Props) {
  const displayTitle = shipName || name;
  const typeColor = TYPE_COLORS[type];

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={[styles.card, style]}>
      <GradientCover gradStart={gradStart} gradEnd={gradEnd} style={styles.cover}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Text style={styles.initial}>{initial}</Text>
        )}

        <View style={styles.tape}>
          <WashiTape width={56} height={14} pattern={tapePattern} color={tapeColor} rotate={-6} />
        </View>

        {pinned && (
          <View style={styles.pinBadge}>
            <Ribbon size={11} color={Colors.sakuraDeep} />
          </View>
        )}

        {polycule && (
          <View style={styles.polycule}>
            <Text style={styles.polyculeText}>poly</Text>
          </View>
        )}
      </GradientCover>

      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Text style={styles.name} numberOfLines={1}>{displayTitle}</Text>
          <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.src} numberOfLines={1}>
            {polycule ? (src || '') : (
              <>
                <Text style={{ color: typeColor, fontFamily: FontFamily.uiMedium }}>{type}</Text>
                {src ? ` · ${src}` : ''}
              </>
            )}
          </Text>
          <Text style={styles.days}>{days}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 3 / 4,
    borderRadius: Radius.r4,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
    ...Shadow.s1,
  },
  cover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(56),
    color: 'rgba(255,255,255,0.92)',
  },
  tape: {
    position: 'absolute',
    top: 0,
    left: -8,
  },
  pinBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.s1,
  },
  polycule: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: 'rgba(110,58,90,0.92)',
    borderRadius: Radius.pill,
  },
  polyculeText: {
    color: Colors.vellum,
    fontSize: sf(9),
    fontWeight: '600',
    fontFamily: FontFamily.marker,
    letterSpacing: 0.6,
  },
  meta: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.vellum,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.h6,
    color: Colors.ink,
    lineHeight: 22,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  src: {
    fontSize: sf(10),
    color: Colors.ink3,
    fontFamily: FontFamily.ui,
  },
  days: {
    fontSize: sf(9),
    color: Colors.ink3,
    fontFamily: FontFamily.marker,
    letterSpacing: 0.5,
  },
});
