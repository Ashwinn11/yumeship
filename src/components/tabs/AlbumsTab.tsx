import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { persistImage } from '@/lib/localMedia';
import { useState } from 'react';
import {
  Dimensions, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useIPad } from '@/hooks/use-ipad';

import { CozyModal } from '@/components/ui/CozyModal';
import { IconPlus, IconTrashSolid } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing ,sf } from '@/constants/theme';
import { addAlbum, addAlbumPhoto, deleteAlbum, deleteAlbumPhoto, useAlbumPhotos, useAlbums } from '@/store/albums';
import { StickerPolaroid } from '@/components/deco';

const SCREEN_W = Dimensions.get('window').width;
const GRID_PAD = 2;
const GRID_GAP = 2;
const COL_WIDTH = Math.floor((SCREEN_W - GRID_PAD * 2 - GRID_GAP * 2) / 3);

export function AlbumsTab({ shipId, setCustomBack }: { shipId: string; setCustomBack?: (fn: (() => void) | null) => void }) {
  const { column } = useIPad();
  const albums = useAlbums(shipId);
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);

  function openAlbum(id: string) {
    setOpenAlbumId(id);
    setCustomBack?.(() => () => { setOpenAlbumId(null); setCustomBack?.(null); });
  }

  function confirmCreate() {
    if (!newTitle.trim()) return;
    const id = addAlbum(shipId, newTitle.trim());
    setNewTitle('');
    setCreating(false);
    openAlbum(id);
  }

  if (openAlbumId) {
    const album = albums.find((a) => a.id === openAlbumId);
    return (
      <AlbumView
        albumId={openAlbumId}
        albumTitle={album?.title ?? ''}
        onBack={() => { setOpenAlbumId(null); setCustomBack?.(null); }}
      />
    );
  }

  const albumToDeleteData = albums.find((a) => a.id === albumToDelete);

  return (
    <View style={s.tab}>
      <CozyModal
        visible={!!albumToDelete}
        title="delete this album?"
        message={albumToDeleteData ? `"${albumToDeleteData.title}" and all its photos will be removed.` : undefined}
        confirmText="Delete"
        cancelText="keep it"
        isDestructive
        onConfirm={() => { if (albumToDelete) deleteAlbum(albumToDelete); setAlbumToDelete(null); }}
        onClose={() => setAlbumToDelete(null)}
      />
      <View style={[s.header, column]}>
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
            placeholder="what do you call this collection?"
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
        <View style={[s.empty, { flex: 1, justifyContent: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 12 }]}>
          <StickerPolaroid size={88} />
          <Text style={{ fontFamily: FontFamily.script, fontSize: sf(26), color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
            no memories yet
          </Text>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: Colors.sakuraDeep,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 99,
              shadowColor: 'rgba(110, 58, 90, 0.12)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 3,
              elevation: 1,
              marginTop: 10,
            }}
            onPress={() => setCreating(true)}
          >
            <IconPlus size={12} color={Colors.vellum} />
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.vellum }}>new album</Text>
          </Pressable>
        </View>
      ) : (
        <View style={s.grid}>
          {albums.map((album) => (
            <Pressable
              key={album.id}
              style={s.albumCard}
              onPress={() => openAlbum(album.id)}
            >
              {album.coverUri ? (
                <Image source={{ uri: album.coverUri }} style={s.albumCover} />
              ) : (
                <View style={s.albumCoverEmpty}>
                  <Text style={s.albumCoverIcon}>写</Text>
                </View>
              )}
              <View style={s.albumInfo}>
                <View style={s.albumInfoRow}>
                  <Text style={s.albumTitle} numberOfLines={1}>{album.title}</Text>
                  <Pressable hitSlop={10} onPress={() => setAlbumToDelete(album.id)}>
                    <IconTrashSolid size={12} color={Colors.ink3} />
                  </Pressable>
                </View>
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
  const { column } = useIPad();
  const photos = useAlbumPhotos(albumId);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmPhotoDelete, setConfirmPhotoDelete] = useState(false);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.9,
    });
    if (!result.canceled) {
      for (const asset of result.assets) {
        addAlbumPhoto(albumId, await persistImage(asset.uri));
      }
    }
  }

  function enterSelect(photoId: string) {
    setSelecting(true);
    setSelected(new Set([photoId]));
  }

  function toggleSelect(photoId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  }

  function cancelSelect() {
    setSelecting(false);
    setSelected(new Set());
  }

  function deleteSelected() {
    setConfirmPhotoDelete(true);
  }

  return (
    <View style={s.albumView}>
      <CozyModal
        visible={confirmPhotoDelete}
        title={`delete ${selected.size} photo${selected.size > 1 ? 's' : ''}?`}
        message="This cannot be undone."
        confirmText="Delete"
        cancelText="keep them"
        isDestructive
        onConfirm={() => { selected.forEach((id) => deleteAlbumPhoto(id)); cancelSelect(); setConfirmPhotoDelete(false); }}
        onClose={() => setConfirmPhotoDelete(false)}
      />
      {/* Top row: title + action buttons */}
      <View style={[s.albumTopRow, column]}>
        <Text style={s.albumViewTitle} numberOfLines={1}>{albumTitle}</Text>
        <View style={s.albumTopActions}>
          {selecting ? (
            <Pressable onPress={cancelSelect} style={s.albumActionBtn} hitSlop={8}>
              <Text style={s.albumActionText}>Cancel</Text>
            </Pressable>
          ) : (
            <>
              {photos.length > 0 && (
                <Pressable onPress={() => { setSelecting(true); }} style={s.albumActionBtn} hitSlop={8}>
                  <Text style={s.albumActionText}>Select</Text>
                </Pressable>
              )}
              <Pressable hitSlop={8} onPress={pickPhoto} style={s.albumAddBtn}>
                <IconPlus size={13} color={Colors.sakuraDeep} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      {photos.length === 0 ? (
        <View style={[s.empty, { flex: 1, justifyContent: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 12 }]}>
          <StickerPolaroid size={88} />
          <Text style={{ fontFamily: FontFamily.script, fontSize: sf(26), color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
            empty album
          </Text>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: Colors.sakuraDeep,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 99,
              shadowColor: 'rgba(110, 58, 90, 0.12)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 3,
              elevation: 1,
              marginTop: 10,
            }}
            onPress={pickPhoto}
          >
            <IconPlus size={12} color={Colors.vellum} />
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.vellum }}>add photos</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[s.photoGrid, column]}>
          {photos.map((p) => {
            const isSelected = selected.has(p.id);
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  if (selecting) {
                    toggleSelect(p.id);
                  } else {
                    setLightboxUri(p.uri);
                  }
                }}
                onLongPress={() => {
                  if (!selecting) enterSelect(p.id);
                }}
                style={s.photoCell}
              >
                <Image source={{ uri: p.uri }} style={s.photoThumb} />
                {selecting && (
                  <View style={[s.selectOverlay, isSelected && s.selectOverlayOn]}>
                    {isSelected && (
                      <View style={s.checkCircle}>
                        <Text style={s.checkMark}>✓</Text>
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Select action bar */}
      {selecting && (
        <View style={s.selectBar}>
          <Text style={s.selectCount}>
            {selected.size} selected
          </Text>
          <Pressable
            style={[s.deleteBtn, selected.size === 0 && s.deleteBtnDisabled]}
            onPress={deleteSelected}
            disabled={selected.size === 0}
          >
            <Text style={s.deleteBtnText}>Delete</Text>
          </Pressable>
        </View>
      )}

      {/* Lightbox */}
      {lightboxUri && (
        <Pressable style={s.lightbox} onPress={() => setLightboxUri(null)}>
          <Image source={{ uri: lightboxUri }} style={s.lightboxImg} contentFit="contain" />
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tab: { flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s6, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  newBox: {
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.sakura, borderRadius: Radius.r3, gap: 10,
  },
  newInput: {
    fontFamily: FontFamily.ui, fontSize: sf(15), color: Colors.ink,
    borderBottomWidth: 1, borderBottomColor: Colors.line, paddingBottom: 6,
  },
  newActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelText: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3, padding: 4 },
  createBtn: { paddingVertical: 4, paddingHorizontal: 14, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  createBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum },
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
    overflow: 'visible', ...Shadow.s1,
    position: 'relative',
  },
  albumDeleteBtn: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  albumDeleteText: { fontSize: sf(10), color: Colors.vellum, fontFamily: FontFamily.ui },
  albumCover: { width: '100%', height: 100 },
  albumCoverEmpty: {
    width: '100%', height: 100,
    backgroundColor: Colors.sakuraSoft, alignItems: 'center', justifyContent: 'center',
  },
  albumCoverIcon: { fontFamily: FontFamily.ja, fontSize: sf(36), color: Colors.sakura },
  albumInfo: { padding: Spacing.s3 },
  albumInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  albumTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink, flex: 1, marginRight: 4 },
  albumCount: { fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3, marginTop: 2 },

  // Album view
  albumView: { flex: 1, backgroundColor: Colors.paper },
  albumTopRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s3,
  },
  albumViewTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(17), color: Colors.ink, flex: 1 },
  albumTopActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  albumActionBtn: {
    paddingVertical: 4, paddingHorizontal: 12,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.line,
    backgroundColor: Colors.vellum,
  },
  albumActionText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2 },
  albumAddBtn: {
    width: 30, height: 30, borderRadius: Radius.pill,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },

  // Photo grid + select
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, padding: GRID_PAD },
  photoCell: { position: 'relative' },
  photoThumb: { width: COL_WIDTH, height: COL_WIDTH },
  selectOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  selectOverlayOn: {
    backgroundColor: 'rgba(212, 105, 74, 0.25)',
  },
  checkCircle: {
    position: 'absolute', bottom: 6, right: 6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.ember,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.s1,
  },
  checkMark: { color: '#fff', fontSize: sf(12), fontFamily: FontFamily.uiSemiBold },

  // Select action bar
  selectBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3,
    backgroundColor: Colors.paper,
    borderTopWidth: 1, borderTopColor: Colors.line,
  },
  selectCount: { fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.ink2 },
  deleteBtn: {
    paddingVertical: 8, paddingHorizontal: 20,
    backgroundColor: Colors.ember, borderRadius: Radius.pill,
  },
  deleteBtnDisabled: { opacity: 0.35 },
  deleteBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: '#fff' },

  // Lightbox
  lightbox: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center',
  },
  lightboxImg: { width: '100%', height: '90%' },
});
