import { View, Text, StyleSheet } from 'react-native';
import { Sparkle } from '@/components/deco/Sparkle';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';

// design/screens.jsx — MiniUpcoming
// Upcoming event row: days-until badge + title + F/O name + sparkle accent.

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
    <View
      style={[
        styles.row,
        {
          backgroundColor: featured ? Colors.sakuraSoft : Colors.vellum,
          borderColor: featured ? tint : Colors.line,
          opacity: muted ? 0.75 : 1,
        },
      ]}
    >
      {featured && (
        <View style={styles.featuredHeart}>
          <Heart size={12} color={tint} />
        </View>
      )}

      <View style={[styles.daysBadge, { backgroundColor: tint + '18', borderColor: tint + '40' }]}>
        <Text style={[styles.daysNum, { color: tint }]}>{days}</Text>
        <Text style={[styles.daysLabel, { color: tint }]}>DAYS</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.fo}>{fo}</Text>
      </View>

      <Sparkle size={10} color={tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: Radius.r3,
    position: 'relative',
  },
  featuredHeart: {
    position: 'absolute',
    top: -5,
    left: 12,
  },
  daysBadge: {
    width: 46,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.r2,
    flexShrink: 0,
  },
  daysNum: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.h5 - 3,
    lineHeight: 22,
    fontWeight: '600',
  },
  daysLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 7,
    letterSpacing: 1,
    marginTop: 2,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.body,
    color: Colors.ink,
    lineHeight: 18,
  },
  fo: {
    fontSize: 10,
    color: Colors.ink2,
    fontFamily: FontFamily.ui,
  },
});
