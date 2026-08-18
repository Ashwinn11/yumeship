import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlagIcon } from '@/components/deco/FlagIcon';
import { findSexualityOption } from '@/constants/sexualities';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, sf, Spacing } from '@/constants/theme';

type Props = {
  name: string;
  avatarUri: string;
  pronouns?: string;
  bio?: string;
  /** free-text flair — matched against the sexuality flag set when possible */
  statusLabel?: string;
  onPress: () => void;
};

/** F/O preview card shown in the horizontal row on a profile. */
export function FoAvatarCard({ name, avatarUri, pronouns, bio, statusLabel, onPress }: Props) {
  const flag = findSexualityOption(statusLabel ?? '');

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
      {/* fixed-height rows, always present, so every card in the row is the
          same size whether or not a given F/O has pronouns/flag/bio set */}
      <View style={styles.pronounsRow}>
        {!!pronouns && <Text style={styles.pronouns} numberOfLines={1}>{pronouns}</Text>}
      </View>
      <View style={styles.flagRow}>
        {!!flag?.colors && <FlagIcon colors={flag.colors} width={18} height={12} />}
      </View>
      <Text style={styles.bio} numberOfLines={2}>{bio ?? ''}</Text>
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
  pronounsRow: { height: 16, alignItems: 'center', justifyContent: 'center' },
  pronouns: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },
  flagRow: { height: 16, alignItems: 'center', justifyContent: 'center' },
  bio: {
    fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2, lineHeight: sf(16),
    textAlign: 'center', minHeight: sf(16) * 2,
  },
});
