import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AVATAR_IMAGE } from '@/lib/imageProps';

type Props = {
  /** '' (none) | 'custom' — more presets coming */
  kind: string;
  /** uploaded custom frame image/gif, only used when kind is 'custom' */
  url?: string;
  /** avatar diameter this frame surrounds */
  size?: number;
};

// Sits behind the avatar, larger than it and unclipped, so a transparent PNG's
// own silhouette (e.g. a mascot peeking out around the edges) shows naturally
// instead of being cropped to a circle. A plain animated gif just shows as a
// soft halo behind the avatar until real illustrated presets exist.
export function AvatarFrame({ kind, url, size = 96 }: Props) {
  if (kind !== 'custom' || !url) return null;
  const box = size * 1.6;
  return (
    <View style={[styles.box, { width: box, height: box, marginLeft: -box / 2, marginTop: -box / 2 }]} pointerEvents="none">
      <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="contain" recyclingKey={url} {...AVATAR_IMAGE} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', left: '50%', top: '50%' },
});
