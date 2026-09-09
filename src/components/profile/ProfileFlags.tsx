import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { FlagIcon } from '@/components/deco/FlagIcon';
import { SEXUALITY_OPTIONS } from '@/constants/sexualities';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import type { ProfileFlag } from './cardTheme';

const BY_KEY = new Map(SEXUALITY_OPTIONS.map((o) => [o.key, o]));

/** A known identity draws its stripes — and draws nothing at all when we have no
 *  verified flag for it, so the words stand alone rather than the raw key leaking
 *  out as if it were a symbol. Anything we don't know is something they typed. */
function FlagMark({ flag }: { flag: string }) {
  if (!flag) return null;
  const known = BY_KEY.get(flag);
  if (known) return known.colors ? <FlagIcon colors={known.colors} width={16} height={11} /> : null;
  return <Text style={styles.glyph}>{flag}</Text>;
}

export function ProfileFlags({ flags, textColor }: { flags: ProfileFlag[]; textColor?: string }) {
  if (flags.length === 0) return null;
  return (
    <View style={styles.row}>
      {flags.map((f) => (
        <View key={f.id} style={styles.chip}>
          {f.imageUrl ? (
            <Image
              source={{ uri: f.imageUrl }}
              style={styles.chipImg}
              contentFit="cover"
              recyclingKey={f.imageUrl}
              {...AVATAR_IMAGE}
            />
          ) : (
            <FlagMark flag={f.flag} />
          )}
          {!!f.text && (
            <Text style={[styles.chipText, textColor ? { color: textColor } : null]}>{f.text}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1, borderColor: Colors.line,
  },
  chipImg: { width: 16, height: 11, borderRadius: 2 },
  glyph: { fontSize: sf(11), color: Colors.ink2, lineHeight: sf(14) },
  chipText: { fontFamily: FontFamily.uiMedium, fontSize: sf(10), color: Colors.ink2, letterSpacing: 0.2 },
});
