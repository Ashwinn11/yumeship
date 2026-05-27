import { StyleSheet, Text, View } from 'react-native';

import { Bullets, WashiTape } from '@/components/deco';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

type Props = {
  days: number;
  title: string;
  fo: string;
  tint: string;
  featured?: boolean;
  muted?: boolean;
  dateStr?: string;
  yearly?: boolean;
  subtitle?: string;
};

export function MiniUpcoming({ days, title, fo, tint, featured, muted, dateStr, yearly, subtitle }: Props) {
  let monthStr = 'DEC';
  let dayStr = '25';

  if (dateStr) {
    try {
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        dayStr = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
      }
    } catch (e) {}
  }

  const numDisplay = days === 0 ? '♡' : days > 0 ? String(days) : '0';
  const unitDisplay = days === 0 ? 'NOW' : days > 0 ? 'DAYS' : 'PAST';
  const isAnn = title === 'Our Anniversary';

  // Determine tape pattern based on title length or hash
  const tapePatterns: ('stripe' | 'dot' | 'heart' | 'check' | 'floral' | 'lace' | 'grid' | 'gingham' | 'star' | 'solid')[] = ['floral', 'heart', 'star', 'dot'];
  const patternIdx = (title.length + fo.length) % tapePatterns.length;
  const pattern = tapePatterns[patternIdx];

  const subtitleText = subtitle || (isAnn ? 'the day we met' : (yearly ? 'repeating yearly ♡' : 'one-time memory'));

  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: Colors.vellum,
          borderColor: Colors.line,
          opacity: muted ? 0.8 : 1,
          marginVertical: 4,
        }
      ]}
    >
      {/* Washi tape corner */}
      <View style={{ position: 'absolute', top: -6, left: 18, zIndex: 10 }}>
        <WashiTape
          pattern={pattern}
          width={42}
          height={12}
          rotate={-8}
          color={tint}
        />
      </View>

      {/* date block left — rounded block with light mix background */}
      <View
        style={{
          width: 56,
          paddingVertical: 6,
          paddingHorizontal: 8,
          borderRadius: 8,
          backgroundColor: tint + '18', // color-mix tint
          borderWidth: 1,
          borderColor: tint + '55',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: FontFamily.marker, fontSize: 9, fontWeight: '600', color: tint, letterSpacing: 1.4, textAlign: 'center' }}>
          {monthStr}
        </Text>
        <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: 28, lineHeight: 28, color: tint, marginTop: -1, textAlign: 'center' }}>
          {dayStr}
        </Text>
      </View>

      {/* center text */}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: 16, color: Colors.ink, lineHeight: 18 }} numberOfLines={1}>
            {title}
          </Text>
          {isAnn && <Bullets.Heart size={10} color={tint} />}
        </View>
        <Text style={{ fontFamily: FontFamily.script, fontSize: 16, color: Colors.ink2, marginTop: 2 }} numberOfLines={1}>
          {subtitleText} <Text style={{ fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3 }}>· {fo}</Text>
        </Text>
      </View>

      {/* countdown right */}
      <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
        <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: 22, color: tint, lineHeight: 22 }}>
          {numDisplay}
        </Text>
        <Text style={{ fontFamily: FontFamily.marker, fontSize: 8, color: Colors.ink3, letterSpacing: 1.4 }}>
          {unitDisplay}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    shadowColor: 'rgba(110, 58, 90, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    position: 'relative',
    overflow: 'visible',
  },
});
