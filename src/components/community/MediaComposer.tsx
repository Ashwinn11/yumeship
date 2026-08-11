import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { MAX_IMAGES, MAX_VIDEO_DURATION_MS, type LocalPickedMedia } from '@/store/community';

type Props = {
  media: LocalPickedMedia[];
  onChange: (media: LocalPickedMedia[]) => void;
};

export function MediaComposer({ media, onChange }: Props) {
  const [error, setError] = useState('');
  const images = media.filter((m): m is Extract<LocalPickedMedia, { type: 'image' }> => m.type === 'image');
  const video = media.find((m): m is Extract<LocalPickedMedia, { type: 'video' }> => m.type === 'video');
  const player = useVideoPlayer(video?.uri ?? null);

  async function pickImages() {
    setError('');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES,
      quality: 0.9,
    });
    if (res.canceled) return;
    onChange(
      res.assets
        .slice(0, MAX_IMAGES)
        .map((a) => ({ type: 'image' as const, uri: a.uri, width: a.width ?? 0, height: a.height ?? 0 })),
    );
  }

  async function pickVideo() {
    setError('');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.9 });
    if (res.canceled || !res.assets[0]) return;
    const asset = res.assets[0];
    const durationMs = asset.duration ?? 0;
    if (durationMs > MAX_VIDEO_DURATION_MS) {
      setError(`keep it under ${MAX_VIDEO_DURATION_MS / 1000} seconds — pick a shorter clip`);
      return;
    }
    onChange([{ type: 'video', uri: asset.uri, durationMs, width: asset.width ?? 0, height: asset.height ?? 0 }]);
  }

  function removeImage(uri: string) {
    onChange(media.filter((m) => !(m.type === 'image' && m.uri === uri)));
  }

  function removeVideo() {
    onChange([]);
  }

  return (
    <View>
      {images.length > 0 && (
        <View style={styles.grid}>
          {images.map((img) => (
            <View key={img.uri} style={styles.thumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.thumb} contentFit="cover" />
              <Pressable style={styles.removeBadge} onPress={() => removeImage(img.uri)} hitSlop={6}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {!!video && (
        <View style={styles.videoPreviewWrap}>
          <VideoView player={player} style={styles.videoPreview} contentFit="cover" nativeControls />
          <Pressable style={styles.removeBadge} onPress={removeVideo} hitSlop={6}>
            <Text style={styles.removeText}>✕</Text>
          </Pressable>
        </View>
      )}

      {media.length === 0 && (
        <View style={styles.pickerRow}>
          <Pressable style={styles.pickerTile} onPress={pickImages}>
            <View style={styles.pickerIconWrap}>
              <Text style={styles.pickerPlus}>+</Text>
            </View>
            <Text style={styles.pickerLabel}>photos</Text>
            <Text style={styles.pickerSubLabel}>up to {MAX_IMAGES}</Text>
          </Pressable>
          <Pressable style={styles.pickerTile} onPress={pickVideo}>
            <View style={styles.pickerIconWrap}>
              <Text style={styles.pickerPlus}>+</Text>
            </View>
            <Text style={styles.pickerLabel}>video</Text>
            <Text style={styles.pickerSubLabel}>up to {MAX_VIDEO_DURATION_MS / 1000}s</Text>
          </Pressable>
        </View>
      )}

      {images.length > 0 && images.length < MAX_IMAGES && (
        <Pressable style={styles.addMoreRow} onPress={pickImages}>
          <View style={styles.addMoreTile}>
            <Text style={styles.pickerPlus}>+</Text>
          </View>
          <Text style={styles.addMoreLabel}>add more photos</Text>
        </Pressable>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 76, height: 76, borderRadius: Radius.r2, borderWidth: 1, borderColor: Colors.line },
  removeBadge: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: Colors.ink3, fontSize: sf(9), fontFamily: FontFamily.ui },
  videoPreviewWrap: { position: 'relative', width: '100%', aspectRatio: 4 / 3 },
  videoPreview: { width: '100%', height: '100%', borderRadius: Radius.r3, backgroundColor: Colors.paperDeep },
  pickerRow: { flexDirection: 'row', gap: 10 },
  pickerTile: {
    flex: 1, height: 92, borderRadius: Radius.r3,
    borderWidth: 1.4, borderColor: Colors.line, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 3,
    backgroundColor: Colors.paperDeep,
  },
  pickerIconWrap: {
    width: 30, height: 30, borderRadius: Radius.pill, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  pickerPlus: { fontSize: sf(16), color: Colors.ink3, fontFamily: FontFamily.ui, lineHeight: sf(18) },
  pickerLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2 },
  pickerSubLabel: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3 },
  addMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  addMoreTile: {
    width: 48, height: 48, borderRadius: Radius.r2,
    backgroundColor: Colors.paperDeep, borderWidth: 1.4, borderColor: Colors.line, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  addMoreLabel: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3 },
  error: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ember, marginTop: 8 },
});
