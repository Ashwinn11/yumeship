import { Image } from 'expo-image';
import { persistImage } from '@/lib/localMedia';
import * as ImagePicker from 'expo-image-picker';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import type { GalleryPhoto } from '@/store/fo';

export const GALLERY_MAX = 6;

type Props = {
  photos: GalleryPhoto[];
  onChange: (photos: GalleryPhoto[]) => void;
};

/** Edit-mode list for the profile-card photo gallery: each photo gets a small
 *  caption, plus an add row. Display side is ProfileCard's polaroid strip. */
export function GalleryPicker({ photos, onChange }: Props) {
  async function addPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      const uri = await persistImage(res.assets[0].uri);
      onChange([...photos, { uri, caption: '' }].slice(0, GALLERY_MAX));
    }
  }

  function setCaption(index: number, caption: string) {
    onChange(photos.map((p, i) => (i === index ? { ...p, caption } : p)));
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.wrap}>
      {photos.map((photo, i) => (
        <View key={`${photo.uri}-${i}`} style={styles.row}>
          <Image source={{ uri: photo.uri }} style={styles.thumb} contentFit="cover" />
          <TextInput
            value={photo.caption}
            onChangeText={(v) => setCaption(i, v)}
            placeholder="a little caption…"
            placeholderTextColor={Colors.ink3}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            style={styles.captionInput}
          />
          <Pressable onPress={() => removePhoto(i)} style={styles.removeBadge} hitSlop={6}>
            <Text style={styles.removeText}>✕</Text>
          </Pressable>
        </View>
      ))}
      {photos.length < GALLERY_MAX && (
        <Pressable onPress={addPhoto} style={styles.addRow}>
          <View style={styles.addTile}>
            <Text style={styles.addPlus}>+</Text>
          </View>
          <Text style={styles.addLabel}>add a photo</Text>
        </Pressable>
      )}
      <Text style={styles.hint}>little moments, fanart, aesthetics · up to {GALLERY_MAX}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: {
    width: 48, height: 48, borderRadius: Radius.r2,
    borderWidth: 1, borderColor: Colors.line,
  },
  captionInput: {
    flex: 1, borderBottomWidth: 1, borderBottomColor: Colors.lineStrong,
    paddingVertical: 4, fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink,
  },
  removeBadge: {
    width: 22, height: 22, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: Colors.ink3, fontSize: sf(9), fontFamily: FontFamily.ui },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addTile: {
    width: 48, height: 48, borderRadius: Radius.r2,
    backgroundColor: Colors.paperDeep,
    borderWidth: 1.4, borderColor: Colors.line, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  addPlus: { fontSize: sf(18), color: Colors.ink3, fontFamily: FontFamily.ui },
  addLabel: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3 },
  hint: { fontFamily: FontFamily.ui, fontSize: sf(9), color: Colors.ink3, marginTop: 2 },
});
