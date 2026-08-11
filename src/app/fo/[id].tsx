import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoForm, FoFormValue } from '@/components/fo/FoForm';
import { CardThemeSheet } from '@/components/profile/CardThemeSheet';
import type { CardTheme } from '@/components/profile/cardTheme';
import { PageBackground } from '@/components/profile/PageBackground';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconEdit, IconPalette } from '@/components/ui/Icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { relationshipStatus, sharingStatus } from '@/components/profile/cardProps';
import { useIPad } from '@/hooks/use-ipad';
import { deleteFo, updateFo, useFo } from '@/store/fo';
import { logSyncFailure, pushFoProfile, unpublishFoProfile } from '@/store/community';
import { usePremium } from '@/store/premium';
import { shipTitle, useShips } from '@/store/ships';

export default function FoDetailScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fo = useFo(id);
  const ships = useShips();
  const premium = usePremium();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FoFormValue | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [photoWarning, setPhotoWarning] = useState(false);

  if (!fo) {
    return (
      <View style={[styles.screen, { backgroundColor: Colors.paper }]}>
        <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title="" />
      </View>
    );
  }

  const linked = ships.find((s) => s.foId === fo.id);

  function startEdit() {
    setDraft({
      name: fo!.name, pronouns: fo!.pronouns, fandom: fo!.fandom,
      relStatus: fo!.relStatus, shareStatus: fo!.shareStatus,
      bio: fo!.bio, height: fo!.height, weight: fo!.weight, photoUri: fo!.photoUri,
      song: fo!.song, songLink: fo!.songLink, gallery: fo!.gallery,
      statusLabel: fo!.statusLabel,
    });
    setEditing(true);
  }

  function saveEdit() {
    if (!draft || !draft.name.trim()) return;
    updateFo(fo!.id, { ...draft, name: draft.name.trim() });
    setEditing(false);
    setDraft(null);
    // Saving locally always succeeds; the publish is what can partly fail, and
    // a photo that silently never reached the server is worth saying out loud.
    if (fo!.isPublic) {
      pushFoProfile(fo!.id)
        .then((res) => { if (res.photoFailed) setPhotoWarning(true); })
        .catch(logSyncFailure('publish F/O'));
    }
  }

  function handleDelete() {
    setConfirmDelete(false);
    const wasPublic = fo!.isPublic;
    const foId = fo!.id;
    deleteFo(foId);
    router.back();
    // the local row is gone either way; a failed unpublish just leaves a
    // stray remote row behind rather than losing anything the user did
    if (wasPublic) {
      unpublishFoProfile(foId).catch(logSyncFailure('unpublish deleted F/O'));
    }
  }

  function handleThemeChange(patch: Partial<CardTheme>) {
    updateFo(fo!.id, patch);
  }

  // theme edits apply live inside the sheet (one push per tap would be
  // excessive) — push once, on close, so everyone else actually sees them
  function handleThemeSheetClose() {
    setShowCustomize(false);
    if (fo!.isPublic) {
      pushFoProfile(fo!.id)
        .then((res) => { if (res.photoFailed) setPhotoWarning(true); })
        .catch(logSyncFailure('publish F/O'));
    }
  }

  const pageBg = fo.pageBgImage || fo.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && { backgroundColor: Colors.paper }, { paddingBottom: Spacing.s1 }]}>
      <ProfileScreenHeader
        insetsTop={insets.top}
        onBack={() => (editing ? setEditing(false) : router.back())}
        backLabel={editing ? '✕' : '‹'}
        title={editing ? 'edit F/O' : fo.name || 'their profile'}
        right={
          editing ? undefined : (
            <View style={styles.headerActions}>
              <Pressable onPress={() => setShowCustomize(true)} style={styles.headerBtn}>
                <IconPalette size={13} color={Colors.ink2} />
              </Pressable>
              <Pressable onPress={startEdit} style={styles.headerBtn}>
                <IconEdit size={13} color={Colors.ink2} />
              </Pressable>
            </View>
          )
        }
      />

      {editing && draft ? (
        <FoForm
          value={draft}
          onChange={setDraft}
          onSave={saveEdit}
          saveLabel="save changes"
          onDelete={() => setConfirmDelete(true)}
        />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, column]} showsVerticalScrollIndicator={false}>
          <ProfileCard
            name={fo.name || 'untitled'}
            pronouns={fo.pronouns}
            subtitle={fo.fandom}
            bio={fo.bio}
            photoUri={fo.photoUri}
            height={fo.height}
            weight={fo.weight}
            type={relationshipStatus(fo.relStatus)}
            sharing={sharingStatus(fo.shareStatus)}
            song={fo.song}
            songLink={fo.songLink}
            gallery={fo.gallery}
            cardBgColor={fo.cardBgColor}
            cardBgImage={fo.cardBgImage}
            cardBgGradient={fo.cardBgGradient}
            cardTransparent={fo.cardTransparent}
            textColor={fo.textColor}
            borderStyle={fo.borderStyle}
            decoration={fo.decoration}
            nameFont={fo.nameFont}
            statusLabel={fo.statusLabel}
          />
        </ScrollView>
      )}

      <CozyModal
        visible={confirmDelete}
        title="Let them go?"
        message={
          linked
            ? `This removes ${fo.name || 'their'} profile. “${shipTitle(linked)}” will keep its saved details, just no longer linked to this F/O.`
            : `This removes ${fo.name || 'their'} profile. Cannot be undone.`
        }
        confirmText="Let go"
        cancelText="Keep them"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
        isDestructive
      />

      <CozyModal
        visible={photoWarning}
        title="Their photo didn't upload"
        message={`${fo.name || 'They'} saved fine, but the photo couldn't be read from your device — so it isn't on their public profile. Pick it again to fix it.`}
        confirmText="OK"
        onClose={() => setPhotoWarning(false)}
      />

      <CardThemeSheet
        visible={showCustomize}
        onClose={handleThemeSheetClose}
        theme={{
          pageBgColor: fo.pageBgColor, pageBgImage: fo.pageBgImage,
          cardBgColor: fo.cardBgColor, cardBgImage: fo.cardBgImage,
          cardBgGradient: fo.cardBgGradient, cardTransparent: fo.cardTransparent,
          textColor: fo.textColor,
          borderStyle: fo.borderStyle, decoration: fo.decoration,
          nameFont: fo.nameFont, statusLabel: fo.statusLabel,
        }}
        onChange={handleThemeChange}
        premium={premium}
      />
    </View>
  );

  return (
    <PageBackground bgImage={fo.pageBgImage} bgColor={fo.pageBgColor}>
      {body}
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s5, paddingBottom: Spacing.s5 },
});
