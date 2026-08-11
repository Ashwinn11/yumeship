import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CozyModal } from '@/components/ui/CozyModal';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import { signOut } from '@/store/auth';
import { deleteCommunityAccount, logSyncFailure } from '@/store/community';
import { getGlobalSetting } from '@/store/onboarding';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** screen-y of the avatar's bottom edge, so the menu hangs directly off it */
  anchorTop: number;
};

/**
 * Account menu for the community header.
 *
 * Anchored under the avatar rather than sliding up from the bottom: the control
 * lives in the top corner, and a menu that opens at the far end of the screen
 * reads as unrelated to the thing you tapped. Same reason the system's own
 * corner controls drop a popover in place.
 */
export function AccountSheet({ visible, onClose, anchorTop }: Props) {
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const name = getGlobalSetting('user_name');
  const username = getGlobalSetting('user_username');
  const avatar = getGlobalSetting('user_avatar');
  const color = getGlobalSetting('user_color') || Colors.sakura;

  function go(path: string) {
    onClose();
    router.push(path as any);
  }

  async function handleSignOut() {
    setConfirmSignOut(false);
    onClose();
    await signOut().catch(logSyncFailure('sign out'));
  }

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await deleteCommunityAccount();
      await signOut();
      setConfirmDelete(false);
      onClose();
    } catch (e: any) {
      // deletion failing silently would leave them believing they had left
      setError(e?.message ?? "couldn't delete your account — try again");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  // RN can't reliably show a second native Modal while this one is still
  // presented — the confirm dialogs below silently fail to appear unless this
  // one steps aside first
  const menuVisible = visible && !confirmSignOut && !confirmDelete;

  return (
    <>
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={onClose}>
        {/* full-bleed catcher: tapping anywhere off the menu closes it */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.menu, { top: anchorTop }]} pointerEvents="box-none">
          <View style={styles.card}>
            {/* the whole identity block is the way in to the profile, which
                carries its own edit button — no separate row needed */}
            <Pressable style={styles.identity} onPress={() => go('/profile')}>
              <View style={[styles.avatar, { backgroundColor: color }]}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
                ) : (
                  <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
                )}
              </View>
              <View style={styles.identityText}>
                <Text style={styles.name} numberOfLines={1}>{name || 'someone soft'}</Text>
                {!!username && <Text style={styles.username} numberOfLines={1}>@{username}</Text>}
              </View>
              <Text style={styles.identityChevron}>›</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.row} onPress={() => go('/social/blocked')}>
              <Text style={styles.rowLabel}>blocked users</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.row} onPress={() => setConfirmSignOut(true)}>
              <Text style={styles.rowLabel}>sign out</Text>
            </Pressable>
            <Pressable style={styles.row} onPress={() => setConfirmDelete(true)}>
              <Text style={[styles.rowLabel, styles.rowDanger]}>delete account</Text>
            </Pressable>

            {!!error && <Text style={styles.error}>{error}</Text>}
          </View>
        </View>
      </Modal>

      <CozyModal
        visible={confirmSignOut}
        title="Sign out?"
        message="You can sign back in anytime — your F/Os and ships stay on this device either way."
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={handleSignOut}
        onClose={() => setConfirmSignOut(false)}
      />

      <CozyModal
        visible={confirmDelete}
        title="Delete your account?"
        message="This erases your posts, comments, likes, follows and any F/O you've shared to community, and frees your @handle. Your F/Os and ships stay on this device. This can't be undone."
        confirmText={deleting ? 'deleting…' : 'Delete'}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
        isDestructive
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  menu: { position: 'absolute', right: Spacing.s5, left: Spacing.s5, alignItems: 'flex-end' },
  card: {
    minWidth: 210,
    maxWidth: 280,
    backgroundColor: Colors.vellum,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s2,
    ...Shadow.s1,
  },

  identity: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: Spacing.s2 },
  avatar: {
    width: 38, height: 38, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 38, height: 38, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: '#fff' },
  identityText: { flex: 1, minWidth: 0 },
  identityChevron: { fontFamily: FontFamily.ui, fontSize: sf(16), color: Colors.ink3 },
  name: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(14), color: Colors.ink },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: Colors.sakuraDeep },

  divider: { height: 1, backgroundColor: Colors.line, marginVertical: 4 },
  row: { paddingVertical: 10 },
  rowLabel: { fontFamily: FontFamily.ui, fontSize: sf(13.5), color: Colors.ink2 },
  rowDanger: { color: Colors.ember },
  error: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ember, paddingVertical: 6 },
});
