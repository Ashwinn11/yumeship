import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoForm, FoFormValue } from '@/components/fo/FoForm';
import { CardThemeSheet } from '@/components/profile/CardThemeSheet';
import type { CardTheme } from '@/components/profile/cardTheme';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconEdit, IconPalette } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, RelationshipColors, SharingColors, Radius, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { deleteFo, updateFo, useFo } from '@/store/fo';
import { usePremium } from '@/store/premium';
import { shipTitle, useShips } from '@/store/ships';

const REL_LABEL: Record<string, string> = { romantic: 'romantic', platonic: 'platonic', familial: 'familial' };
const SHARE_LABEL: Record<string, string> = { yes: 'Yes', no: 'No', selective: 'Selective' };

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

  if (!fo) {
    return (
      <View style={[styles.screen, { backgroundColor: Colors.paper, paddingTop: insets.top + Spacing.s1 }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>‹</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const linked = ships.find((s) => s.foId === fo.id);

  function startEdit() {
    if (!premium) {
      router.push('/paywall?reason=edit-profile' as any);
      return;
    }
    setDraft({
      name: fo!.name, pronouns: fo!.pronouns, fandom: fo!.fandom,
      relStatus: fo!.relStatus, shareStatus: fo!.shareStatus,
      bio: fo!.bio, height: fo!.height, weight: fo!.weight, photoUri: fo!.photoUri,
      song: fo!.song, songLink: fo!.songLink, gallery: fo!.gallery,
    });
    setEditing(true);
  }

  function saveEdit() {
    if (!draft || !draft.name.trim()) return;
    updateFo(fo!.id, { ...draft, name: draft.name.trim() });
    setEditing(false);
    setDraft(null);
  }

  function handleDelete() {
    setConfirmDelete(false);
    deleteFo(fo!.id);
    router.back();
  }

  function handleThemeChange(patch: Partial<CardTheme>) {
    updateFo(fo!.id, patch);
  }

  const pageBg = fo.pageBgImage || fo.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && { backgroundColor: Colors.paper }, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => (editing ? setEditing(false) : router.back())} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>{editing ? '✕' : '‹'}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>{editing ? 'edit F/O' : fo.name || 'their profile'}</Text>
        </View>
        {editing ? (
          <View style={{ width: 32 }} />
        ) : (
          <View style={styles.headerActions}>
            <Pressable onPress={() => setShowCustomize(true)} style={styles.headerBtn}>
              <IconPalette size={13} color={Colors.ink2} />
            </Pressable>
            <Pressable onPress={startEdit} style={styles.headerBtn}>
              <IconEdit size={13} color={Colors.ink2} />
            </Pressable>
          </View>
        )}
      </View>

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
            type={{ label: REL_LABEL[fo.relStatus] ?? fo.relStatus, color: RelationshipColors[fo.relStatus] }}
            sharing={{ label: SHARE_LABEL[fo.shareStatus] ?? fo.shareStatus, color: SharingColors[fo.shareStatus] }}
            song={fo.song}
            songLink={fo.songLink}
            gallery={fo.gallery}
            cardBgColor={fo.cardBgColor}
            cardBgImage={fo.cardBgImage}
            textColor={fo.textColor}
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

      <CardThemeSheet
        visible={showCustomize}
        onClose={() => setShowCustomize(false)}
        theme={{
          pageBgColor: fo.pageBgColor, pageBgImage: fo.pageBgImage,
          cardBgColor: fo.cardBgColor, cardBgImage: fo.cardBgImage,
          textColor: fo.textColor,
        }}
        onChange={handleThemeChange}
      />
    </View>
  );

  if (fo.pageBgImage) {
    return <ImageBackground source={{ uri: fo.pageBgImage }} style={styles.fill}>{body}</ImageBackground>;
  }
  if (fo.pageBgColor) {
    return <View style={[styles.fill, { backgroundColor: fo.pageBgColor }]}>{body}</View>;
  }
  return body;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(18), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(20) },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s5, paddingBottom: Spacing.s5 },
});
