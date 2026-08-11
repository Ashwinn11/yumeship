import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { MEDIA_IMAGE } from '@/lib/imageProps';

type Props = {
  bgImage?: string;
  bgColor?: string;
  children: React.ReactNode;
};

/**
 * Shared page-styling wrapper for profile-like screens (own/public account,
 * own/public F/O) — the owner's page background (image, flat color, or
 * neither) travels with the profile wherever it's viewed.
 */
export function PageBackground({ bgImage, bgColor, children }: Props) {
  if (bgImage) {
    return (
      <View style={styles.fill}>
        <Image source={{ uri: bgImage }} style={StyleSheet.absoluteFill} contentFit="cover" {...MEDIA_IMAGE} />
        {children}
      </View>
    );
  }
  if (bgColor) {
    return <View style={[styles.fill, { backgroundColor: bgColor }]}>{children}</View>;
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
