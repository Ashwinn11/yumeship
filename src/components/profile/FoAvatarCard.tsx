import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, sf, Spacing } from '@/constants/theme';

type Props = {
  name: string;
  avatarUri: string;
  tagline?: string;
  onPress: () => void;
};

/** F/O preview card shown in the horizontal row on a profile — name and bio only. */
export function FoAvatarCard({ name, avatarUri, tagline, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: Colors.sakura }]}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatarImg}
            contentFit="cover"
            recyclingKey={avatarUri}
            {...AVATAR_IMAGE}
          />
        ) : (
          <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{name || 'untitled'}</Text>
      <Text style={styles.tagline} numberOfLines={3}>{tagline ?? ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 152, alignItems: 'center', gap: 6,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4, paddingVertical: Spacing.s4, paddingHorizontal: Spacing.s3,
  },
  avatar: {
    width: 64, height: 64, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 64, height: 64, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(24), color: '#fff' },
  name: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ink, textAlign: 'center' },
  tagline: {
    fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2, lineHeight: sf(16),
    textAlign: 'center', minHeight: sf(16) * 3,
  },
});
