import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '@/components/community/PostCard';
import { FeedSkeleton } from '@/components/community/PostCardSkeleton';
import { FoEditor, type FoDraft } from '@/components/fo/FoEditor';
import { CardThemeSheet } from '@/components/profile/CardThemeSheet';
import type { CardTheme } from '@/components/profile/cardTheme';
import { PageBackground } from '@/components/profile/PageBackground';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { AboutSection } from '@/components/profile/AboutSection';
import { ProfileMediaGrid } from '@/components/profile/ProfileMediaGrid';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconEdit, IconPalette, IconShare } from '@/components/ui/Icon';
import { foProfileUrl, shareProfileLink } from '@/lib/shareProfile';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { relationshipStatus, sharingStatus } from '@/components/profile/cardProps';
import { useIPad } from '@/hooks/use-ipad';
import { deleteFo, updateFo, useFo } from '@/store/fo';
import {
  deleteFoProfileRemote,
  deletePost,
  logSyncFailure,
  pushFoProfile,
  useFoPosts,
  type CommunityPost,
} from '@/store/community';
import { usePremium } from '@/store/premium';
import { shipTitle, useShips } from '@/store/ships';

const keyExtractor = (p: CommunityPost) => p.id;
const PostSeparator = () => <View style={styles.postSeparator} />;

export default function FoDetailScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fo = useFo(id);
  const ships = useShips();
  const premium = usePremium();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FoDraft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [photoWarning, setPhotoWarning] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();

  // only a published F/O can be tagged in a post, so an unpublished one skips
  // the fetch entirely and this screen stays the purely-local view it was
  const {
    posts,
    loading: postsLoading,
    refreshing,
    refresh: refreshPosts,
    loadMore,
    toggleLikeOptimistic,
    pollVoteOptimistic,
    removePost,
  } = useFoPosts(fo?.isPublic ? fo.id : undefined);

  const renderPost = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        onToggleLike={() => toggleLikeOptimistic(item.id, () => showToast("couldn't update like — try again"))}
        onPollVote={(i) => pollVoteOptimistic(item.id, i, () => showToast("couldn't update vote — try again"))}
        onRequestDelete={() => setDeleteTarget(item.id)}
      />
    ),
    [toggleLikeOptimistic, pollVoteOptimistic, showToast],
  );

  async function confirmDeletePost() {
    if (!deleteTarget) return;
    setDeletingPost(true);
    try {
      await deletePost(deleteTarget);
      removePost(deleteTarget);
    } catch {
      showToast("couldn't delete that post — try again");
    } finally {
      setDeletingPost(false);
      setDeleteTarget(null);
    }
  }

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
      relStatus: fo!.relStatus, shareStatus: fo!.shareStatus, color: fo!.color,
      tagline: fo!.tagline, about: fo!.about, sinceDate: fo!.sinceDate, photoUri: fo!.photoUri,
      songs: fo!.songs, gallery: fo!.gallery, flags: fo!.flags, links: fo!.links,
      blinkies: fo!.blinkies,
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
    // this id is gone for good, not just toggled off — the remote row and its
    // files should actually go too, not soft-hide like a plain unpublish does
    if (wasPublic) {
      deleteFoProfileRemote(foId).catch(logSyncFailure('delete remote F/O profile'));
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
      <View style={[styles.toastWrap, { top: insets.top + Spacing.s2 }]} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      {/* the editor brings its own header (✕ / title / done) — a second one
          from the screen would stack two headers on top of each other */}
      {!editing && (
        <ProfileScreenHeader
          insetsTop={insets.top}
          onBack={() => router.back()}
          backLabel="‹"
          title={fo.name || 'their profile'}
          right={
            <View style={styles.headerActions}>
              <Pressable onPress={() => setShowCustomize(true)} style={styles.headerBtn}>
                <IconPalette size={13} color={Colors.ink2} />
              </Pressable>
              <Pressable onPress={startEdit} style={styles.headerBtn}>
                <IconEdit size={13} color={Colors.ink2} />
              </Pressable>
              <Pressable
                onPress={() =>
                  shareProfileLink(
                    fo.isPublic ? foProfileUrl(fo.id) : null,
                    (reason) => showToast(fo.isPublic ? reason : "turn on public profiles to share this f/o"),
                  )
                }
                style={styles.headerBtn}
                accessibilityLabel="Share profile"
              >
                <IconShare size={13} color={Colors.ink2} />
              </Pressable>
            </View>
          }
        />
      )}

      {editing && draft ? (
        <FoEditor
          value={draft}
          onChange={(p) => setDraft((d) => (d ? { ...d, ...p } : d))}
          onClose={saveEdit}
          onDelete={() => setConfirmDelete(true)}
          premium={premium}
        />
      ) : (
        <FlatList
          style={styles.scroll}
          contentContainerStyle={[styles.content, column]}
          showsVerticalScrollIndicator={false}
          data={posts}
          keyExtractor={keyExtractor}
          renderItem={renderPost}
          ItemSeparatorComponent={PostSeparator}
          refreshControl={
            fo.isPublic
              ? <RefreshControl refreshing={refreshing} onRefresh={refreshPosts} tintColor={Colors.sakuraDeep} />
              : undefined
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            <>
              <ProfileCard
                name={fo.name || 'untitled'}
                pronouns={fo.pronouns}
                subtitle={fo.fandom ? `#${fo.fandom}` : ''}
                tagline={fo.tagline}
                photoUri={fo.photoUri}
                fallbackColor={fo.color || Colors.sakura}
                since={fo.sinceDate}
                type={relationshipStatus(fo.relStatus)}
                sharing={sharingStatus(fo.shareStatus)}
                cardBgColor={fo.cardBgColor}
                cardBgImage={fo.cardBgImage}
                cardBgGradient={fo.cardBgGradient}
                cardTransparent={fo.cardTransparent}
                textColor={fo.textColor}
                borderStyle={fo.borderStyle}
                nameFont={fo.nameFont}
                cardLayout={fo.cardLayout}
                blinkies={fo.blinkies}
                flags={fo.flags}
                links={fo.links}
              />
              <AboutSection
                about={fo.about}
                cardBgColor={fo.cardBgColor}
                cardBgImage={fo.cardBgImage}
                cardBgGradient={fo.cardBgGradient}
                cardTransparent={fo.cardTransparent}
                textColor={fo.textColor}
                borderStyle={fo.borderStyle}
              />
              <ProfileMediaGrid songs={fo.songs} gallery={fo.gallery} />
              {fo.isPublic && <Text style={styles.postsLabel}>posts about them</Text>}
            </>
          }
          ListEmptyComponent={
            !fo.isPublic ? null : postsLoading ? (
              <FeedSkeleton />
            ) : (
              <Text style={styles.postsEmpty}>no posts about them yet</Text>
            )
          }
        />
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

      {/* one post, one row — deleting here removes it from your profile and the
          feed too, not just from this F/O's page. Say so, or it reads as untag. */}
      <CozyModal
        visible={!!deleteTarget}
        title="Delete this post?"
        message="It'll be gone everywhere — your profile and the feed too, not just here. This can't be undone."
        confirmText={deletingPost ? 'deleting…' : 'Delete'}
        cancelText="Cancel"
        onConfirm={confirmDeletePost}
        onClose={() => setDeleteTarget(null)}
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
          borderStyle: fo.borderStyle,
          nameFont: fo.nameFont,
          cardLayout: fo.cardLayout,
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
  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  postSeparator: { height: 12 },
  postsLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: Spacing.s6, marginBottom: Spacing.s3,
  },
  postsEmpty: {
    fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3,
    textAlign: 'center', marginTop: Spacing.s3,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s5, paddingBottom: Spacing.s5 },
});
