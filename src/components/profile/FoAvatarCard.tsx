import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';

type Props = {
  name: string;
  avatarUri: string;
  onPress: () => void;
};

/** Instagram/Twitter-suggestion-style card: avatar circle, name below, tappable. */
export function FoAvatarCard({ name, avatarUri, onPress }: Props) {
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 72, alignItems: 'center', gap: 6 },
  avatar: {
    width: 60, height: 60, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 60, height: 60, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: '#fff' },
  name: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2, textAlign: 'center' },
});
