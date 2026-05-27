import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

type Props = {
  days: number;
  title: string;
  fo: string;
  tint: string;
  featured?: boolean;
  muted?: boolean;
};

export function MiniUpcoming({ days, title, fo, tint, featured, muted }: Props) {
  return (
    <LinearGradient
      colors={[tint + '18', tint + '50']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.card, { borderColor: tint + '60', opacity: muted ? 0.75 : 1 }]}
    >
      {featured && (
        <View style={s.heartDeco}>
          <Heart size={12} color={tint} />
        </View>
      )}
      <View style={s.cardLeft}>
        <Text style={[s.cardNum, { color: tint }]}>{days}</Text>
        <Text style={[s.cardUnit, { color: tint }]}>DAYS</Text>
      </View>
      <View style={s.cardInfo}>
        <Text style={s.cardTitle} numberOfLines={1}>{title}</Text>
        <Text style={s.cardSub} numberOfLines={1}>{fo}</Text>
      </View>
      <Sparkle size={11} color={tint} />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: Spacing.s4,
    paddingHorizontal: Spacing.s5,
    borderRadius: Radius.r3,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  heartDeco: {
    position: 'absolute',
    top: 10,
    left: 12,
  },
  cardLeft: {
    width: 52,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cardNum: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -1,
  },
  cardUnit: {
    fontFamily: FontFamily.marker,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 17,
    color: Colors.ink,
    lineHeight: 20,
  },
  cardSub: {
    fontFamily: FontFamily.ui,
    fontSize: 11,
    color: Colors.ink3,
  },
});
