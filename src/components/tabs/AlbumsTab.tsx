import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert, Dimensions, Image, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { IconPlus } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { addAlbum, addAlbumPhoto, deleteAlbum, deleteAlbumPhoto, useAlbumPhotos, useAlbums } from '@/store/albums';

const COL_WIDTH = (Dimensions.get('window').width - Spacing.s5 * 2 - 12) / 3;

export function AlbumsTab({ shipId }: { shipId: string }) {
  const albums = useAlbums(shipId);
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  function confirmCreate() {
    if (!newTitle.trim()) return;
    const id = addAlbum(shipId, newTitle.trim());
    setNewTitle('');
    setCreating(false);
    setOpenAlbumId(id);
  }

  if (openAlbumId) {
    const album = albums.find((a) => a.id === openAlbumId);
    return (
      <AlbumView
        albumId={openAlbumId}
        albumTitle={album?.title ?? ''}
        onBack={() => setOpenAlbumId(null)}
      />
    );
  }

  return (
    <View style={s.tab}>
      <View style={s.header}>
        <Text style={s.label}>albums · {albums.length}</Text>
        <Pressable hitSlop={8} onPress={() => setCreating(true)}>
          <IconPlus size={14} color={Colors.sakuraDeep} />
        </Pressable>
      </View>

      {creating && (
        <View style={s.newBox}>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="album name..."
            placeholderTextColor={Colors.ink3}
            style={s.newInput}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={confirmCreate}
          />
          <View style={s.newActions}>
            <Pressable onPress={() => { setCreating(false); setNewTitle(''); }}>
              <Text style={s.cancelText}>cancel</Text>
            </Pressable>
            <Pressable style={s.createBtn} onPress={confirmCreate}>
              <Text style={s.createBtnText}>create</Text>
            </Pressable>
          </View>
        </View>
      )}

      {albums.length === 0 && !creating ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>no albums yet.</Text>
          <Text style={s.emptySub}>save fan art, screenshots, anything.</Text>
          <Pressable style={s.emptyBtn} onPress={() => setCreating(true)}>
            <IconPlus size={13} color={Colors.vellum} />
            <Text style={s.emptyBtnText}>new album</Text>
          </Pressable>
        </View>
      ) : (
        <View style={s.grid}>
          {albums.map((album) => (
            <Pressable
              key={album.id}
              style={s.albumCard}
              onPress={() => setOpenAlbumId(album.id)}
              onLongPress={() => Alert.alert('Delete album?', `"${album.title}" and all its photos`, [
                { text: 'Delete', style: 'destructive', onPress: () => deleteAlbum(album.id) },
                { text: 'Cancel', style: 'cancel' },
              ])}
            >
              {album.coverUri ? (
                <Image source={{ uri: album.coverUri }} style={s.albumCover} />
              ) : (
                <View style={s.albumCoverEmpty}>
                  <Text style={s.albumCoverIcon}>写</Text>
                </View>
              )}
              <View style={s.albumInfo}>
                <Text style={s.albumTitle} numberOfLines={1}>{album.title}</Text>
                <Text style={s.albumCount}>{album.photoCount} photos</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function AlbumView({ albumId, albumTitle, onBack }: { albumId: string; albumTitle: string; onBack: () => void }) {
  const photos = useAlbumPhotos(albumId);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.9,
    });
    if (!result.canceled) {
      for (const asset of result.assets) {
        addAlbumPhoto(albumId, asset.uri);
      }
    }
  }

  return (
    <View style={s.albumView}>
      <View style={s.albumHeader}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <Text style={s.albumViewTitle}>{albumTitle}</Text>
        <Pressable hitSlop={8} onPress={pickPhoto}>
          <IconPlus size={14} color={Colors.sakuraDeep} />
        </Pressable>
      </View>

      {photos.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>empty album.</Text>
          <Text style={s.emptySub}>tap + to add photos.</Text>
          <Pressable style={s.emptyBtn} onPress={pickPhoto}>
            <IconPlus size={13} color={Colors.vellum} />
            <Text style={s.emptyBtnText}>add photos</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.photoGrid}>
          {photos.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setLightboxUri(p.uri)}
              onLongPress={() => Alert.alert('Delete photo?', '', [
                { text: 'Delete', style: 'destructive', onPress: () => deleteAlbumPhoto(p.id) },
                { text: 'Cancel', style: 'cancel' },
              ])}
            >
              <Image source={{ uri: p.uri }} style={s.photoThumb} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {lightboxUri && (
        <Pressable style={s.lightbox} onPress={() => setLightboxUri(null)}>
          <Image source={{ uri: lightboxUri }} style={s.lightboxImg} resizeMode="contain" />
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tab: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s6, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  newBox: {
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.sakura, borderRadius: Radius.r3, gap: 10,
  },
  newInput: {
    fontFamily: FontFamily.displayItalic, fontSize: 15, color: Colors.ink,
    borderBottomWidth: 1, borderBottomColor: Colors.line, paddingBottom: 6,
  },
  newActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelText: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink3, padding: 4 },
  createBtn: { paddingVertical: 4, paddingHorizontal: 14, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  createBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 13, color: Colors.vellum },
  empty: { alignItems: 'center', gap: Spacing.s3, paddingVertical: Spacing.s7 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.sakuraDeep, paddingHorizontal: Spacing.s5, paddingVertical: 10,
    borderRadius: Radius.pill, ...Shadow.s1,
  },
  emptyBtnText: { fontFamily: FontFamily.uiMedium, fontSize: FontSize.body, color: Colors.vellum },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  albumCard: {
    width: '47%', backgroundColor: Colors.vellum,
    borderRadius: Radius.r3, borderWidth: 1, borderColor: Colors.line,
    overflow: 'hidden', ...Shadow.s1,
  },
  albumCover: { width: '100%', height: 100 },
  albumCoverEmpty: {
    width: '100%', height: 100,
    backgroundColor: Colors.sakuraSoft, alignItems: 'center', justifyContent: 'center',
  },
  albumCoverIcon: { fontFamily: FontFamily.ja, fontSize: 36, color: Colors.sakura },
  albumInfo: { padding: Spacing.s3 },
  albumTitle: { fontFamily: FontFamily.displayItalic, fontSize: 14, color: Colors.ink },
  albumCount: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 0.6, marginTop: 2 },

  // Album view
  albumView: { flex: 1, backgroundColor: Colors.paper },
  albumHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.s5, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  backText: { fontSize: 22, color: Colors.ink2, fontFamily: FontFamily.ui },
  albumViewTitle: { fontFamily: FontFamily.displayItalic, fontSize: 15, color: Colors.ink, flex: 1 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 2 },
  photoThumb: { width: COL_WIDTH, height: COL_WIDTH },
  lightbox: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center',
  },
  lightboxImg: { width: '100%', height: '90%' },
});
