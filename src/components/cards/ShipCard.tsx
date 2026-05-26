import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WashiTape } from '@/components/deco/WashiTape';
import { Pin } from '@/components/deco/Pin';
import { GradientCover } from '@/components/ui/GradientCover';
import { Colors, FontFamily, FontSize, Radius, Shadow } from '@/constants/theme';

// design/screens.jsx — ShipCard
// F/O card: 3/4 aspect, gradient cover, washi tape, optional pin + polycule badge.

type TapePattern = 'stripe' | 'dot' | 'heart' | 'check' | 'solid';

type Props = {
  name: string;
  src: string;
  initial: string;
  gradStart: string;
  gradEnd: string;
  type: 'romantic' | 'platonic' | 'familial';
  pinned?: boolean;
  polycule?: boolean;
  days: string;
  tapePattern?: TapePattern;
  tapeColor?: string;
  onPress?: () => void;
};

const TYPE_COLORS: Record<string, string> = {
  romantic: Colors.sakuraDeep,
  platonic: Colors.sageDeep,
  familial: Colors.peachDeep,
};

export function ShipCard({
  name,
  src,
  initial,
  gradStart,
  gradEnd,
  type,
  pinned,
  polycule,
  days,
  tapePattern = 'heart',
  tapeColor = Colors.vellum,
  onPress,
}: Props) {
  const typeColor = TYPE_COLORS[type];

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <GradientCover gradStart={gradStart} gradEnd={gradEnd} style={styles.cover}>
        <Text style={styles.initial}>{initial}</Text>

        <View style={styles.tape}>
          <WashiTape width={56} height={14} pattern={tapePattern} color={tapeColor} rotate={-6} />
        </View>

        {pinned && (
          <View style={styles.pinBadge}>
            <Pin size={11} color={Colors.sakuraDeep} />
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
          <Text style={styles.name}>{name}</Text>
          <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.src}>{src}</Text>
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
    fontSize: 56,
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
    fontSize: 9,
    fontWeight: '600',
    fontFamily: FontFamily.mono,
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
    fontSize: 10,
    color: Colors.ink3,
    fontFamily: FontFamily.ui,
  },
  days: {
    fontSize: 9,
    color: Colors.ink3,
    fontFamily: FontFamily.mono,
    letterSpacing: 0.5,
  },
});
