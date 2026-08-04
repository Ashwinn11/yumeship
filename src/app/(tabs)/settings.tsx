import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart } from '@/components/deco/Heart';
import { Ribbon } from '@/components/deco/Ribbon';
import { Sparkle } from '@/components/deco/Sparkle';
import {
  CozyModal,
  IconBellSolid,
  IconDocumentSolid,
  IconLockSolid,
  IconRestoreSolid,
  IconStorageSolid,
  IconTicketSolid,
  IconTrashSolid,
} from '@/components/ui';
import { IconEdit, IconLock } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Toggle } from '@/components/ui/Toggle';
import { Colors, FontFamily, FontSize, Radius, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import {
  cancelAllNotifications, getNotifEnabled, requestPermission, setNotifEnabled,
} from '@/store/notifications';
import { manageSubscriptions, restorePurchases } from '@/store/purchases';
import { openWriteReview } from '@/store/review';
import { usePremium } from '@/store/premium';
import { getGlobalSetting, getMediaSetting } from '@/store/onboarding';
import { deleteAllData } from '@/store/ships';

function readProfile() {
  return {
    name: getGlobalSetting('user_name'),
    pronouns: getGlobalSetting('user_pronouns', 'she/her'),
    username: getGlobalSetting('user_username'),
    color: getGlobalSetting('user_color') || Colors.sakura,
    avatar: getMediaSetting('user_avatar'),
  };
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SettingGroup({
  ja,
  name,
  children,
}: {
  ja: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <View style={group.wrap}>
      <View style={group.labelRow}>
        <Text style={group.ja}>{ja}</Text>
        <Text style={group.name}>{name}</Text>
      </View>
      <View style={group.card}>{children}</View>
    </View>
  );
}

const group = StyleSheet.create({
  wrap: { gap: 5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ja: { fontFamily: FontFamily.ja, fontSize: sf(11), color: Colors.sakuraDeep },
  name: {
    fontFamily: FontFamily.marker,
    fontSize: sf(9),
    color: Colors.ink3,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r3,
    overflow: 'hidden',
  },
});

function SettingRow({
  label,
  icon,
  trailing,
  destructive,
  onPress,
}: {
  label: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  destructive?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[row.wrap, { borderBottomColor: Colors.paperDeep }]}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && (
        <View style={row.iconWrap}>
          {icon}
        </View>
      )}
      <Text style={[row.label, destructive && { color: Colors.ember }]}>{label}</Text>
      {trailing}
    </Pressable>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  iconWrap: {
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontSize: FontSize.caption,
    color: Colors.ink,
    fontFamily: FontFamily.ui,
  },
});

function MetaText({ children }: { children: string }) {
  return <Text style={meta.text}>{children}</Text>;
}
const meta = StyleSheet.create({
  text: { fontSize: sf(11), color: Colors.ink3, fontFamily: FontFamily.ui },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const [notifEnabled, setNotifEnabledState] = useState(() => getNotifEnabled());
  const [storageLabel, setStorageLabel] = useState('—');
  const premium = usePremium();
  const [profile, setProfile] = useState(readProfile);
  useFocusEffect(useCallback(() => { setProfile(readProfile()); }, []));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const path = (FileSystem.documentDirectory ?? '') + 'SQLite/yumeship.db';
    FileSystem.getInfoAsync(path).then((info) => {
      if (info.exists && 'size' in info && info.size) {
        const kb = info.size / 1024;
        setStorageLabel(kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`);
      } else {
        setStorageLabel('< 1 KB');
      }
    });
  }, []);

  async function handleToggleNotif(v: boolean) {
    if (v) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setNotifEnabled(v);
    setNotifEnabledState(v);
  }

  async function handleManageSubscription() {
    try {
      await manageSubscriptions();
    } catch (e: any) {
      setAlertModal({ title: 'Error', message: e?.message ?? 'Could not open subscription management.' });
    }
  }

  async function handleRestorePurchases() {
    try {
      const { isPremium: active } = await restorePurchases();
      if (active) {
        setAlertModal({ title: 'Restored! ✓', message: 'Your premium subscription has been restored.' });
      } else {
        setAlertModal({ title: 'Nothing to restore', message: `No active subscription found for this ${Platform.OS === 'android' ? 'Google account' : 'Apple ID'}.` });
      }
    } catch (e: any) {
      setAlertModal({ title: 'Error', message: e?.message ?? 'Could not restore purchases.' });
    }
  }



  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Background accents */}
      <View style={styles.decoTL} pointerEvents="none">
        <Ribbon size={18} color={Colors.sakuraDeep} />
      </View>
      <View style={styles.decoBR} pointerEvents="none">
        <Sparkle size={18} color={Colors.lavenderDeep} />
      </View>

      {/* Header */}
      <View style={[styles.header, column]}>
        <View style={styles.headerRow}>
          <Mark size={26} />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>settings</Text>
          <Sparkle size={14} color={Colors.lavenderDeep} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.list, column]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pro area */}
        {!premium && (
          <Pressable
            style={styles.proCard}
            onPress={() => router.push('/paywall' as any)}
            id="settings-upgrade"
          >
            <Text style={styles.proTitle}>Go Premium</Text>
            <Text style={styles.proSub}>unlock unlimited ships, templates & more</Text>
          </Pressable>
        )}

        {/* Profile */}
        <Pressable
          style={styles.profileCard}
          onPress={() => router.push('/profile' as any)}
        >
          <View style={[styles.profileAvatar, { backgroundColor: profile.color }]}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.profileAvatarImg} contentFit="cover" />
            ) : (
              <Text style={styles.profileAvatarInitial}>{profile.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName} numberOfLines={1}>{profile.name || 'set up your profile'}</Text>
              {!!profile.username && <Text style={styles.profileUsername}>@{profile.username}</Text>}
            </View>
            {!!profile.pronouns && <Text style={styles.profilePronouns}>{profile.pronouns}</Text>}
          </View>
          <View style={styles.profileEdit}>
            <IconEdit size={13} color={Colors.ink3} />
          </View>
        </Pressable>

        <SettingGroup ja="推" name="F/O profiles">
          <SettingRow
            label="Manage F/Os"
            icon={<Heart size={14} color={Colors.sakuraDeep} />}
            onPress={() => router.push('/fo' as any)}
            trailing={<MetaText>›</MetaText>}
          />
        </SettingGroup>

        <SettingGroup ja="貼" name="Stickers">
          <SettingRow
            label="Sticker collection"
            icon={<Sparkle size={14} color={Colors.lavenderDeep} />}
            onPress={() => router.push('/stickers' as any)}
            trailing={<MetaText>›</MetaText>}
          />
        </SettingGroup>

        <SettingGroup ja="輪" name="Community">
          <SettingRow
            label="Blocked users"
            icon={<IconLock size={14} />}
            onPress={() => router.push('/social/blocked' as any)}
            trailing={<MetaText>›</MetaText>}
          />
        </SettingGroup>

        <SettingGroup ja="便" name="Notifications">
          <SettingRow
            label="Allow notifications"
            icon={<IconBellSolid size={14} />}
            trailing={<Toggle value={notifEnabled} onValueChange={handleToggleNotif} />}
          />
        </SettingGroup>

        <SettingGroup ja="課" name="Subscription">
          <SettingRow
            label="Manage subscription"
            icon={<IconTicketSolid size={14} />}
            onPress={handleManageSubscription}
            trailing={<MetaText>›</MetaText>}
          />
          <SettingRow
            label="Restore purchases"
            icon={<IconRestoreSolid size={14} />}
            onPress={handleRestorePurchases}
          />
        </SettingGroup>

        <SettingGroup ja="愛" name="Support us">
          <SettingRow
            label="Rate yumeship ♡"
            icon={<Heart size={14} color={Colors.sakuraDeep} />}
            onPress={openWriteReview}
            trailing={<MetaText>›</MetaText>}
          />
        </SettingGroup>

        <SettingGroup ja="蔵" name="Data">
          <SettingRow
            label="Storage"
            icon={<IconStorageSolid size={14} />}
            trailing={<MetaText>{storageLabel}</MetaText>}
          />
          <SettingRow
            label="Delete all data"
            icon={<IconTrashSolid size={14} />}
            destructive
            onPress={() => setShowDeleteModal(true)}
          />
        </SettingGroup>

        <SettingGroup ja="法" name="Legal">
          <SettingRow
            label="Terms of Service"
            icon={<IconDocumentSolid size={14} />}
            onPress={() => router.push('/terms' as any)}
            trailing={<MetaText>›</MetaText>}
          />
          <SettingRow
            label="Privacy Policy"
            icon={<IconLockSolid size={14} />}
            onPress={() => router.push('/privacy' as any)}
            trailing={<MetaText>›</MetaText>}
          />
        </SettingGroup>
      </ScrollView>
      <CozyModal
        visible={showDeleteModal}
        title="Delete everything?"
        message="This removes all ships, headcanons, scenarios, messages, albums, and more. Cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          setShowDeleteModal(false);
          cancelAllNotifications();
          deleteAllData();
          router.replace('/onboarding');
        }}
        onClose={() => setShowDeleteModal(false)}
        isDestructive={true}
      />
      <CozyModal
        visible={!!alertModal}
        title={alertModal?.title}
        message={alertModal?.message}
        confirmText="OK"
        onClose={() => setAlertModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  header: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  version: {
    fontFamily: FontFamily.marker,
    fontSize: sf(10),
    color: Colors.ink3,
    letterSpacing: 1.2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: Spacing.s4,
  },
  title: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(34),
    lineHeight: 34,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  scroll: {
    flex: 1,
  },
  list: {
    padding: Spacing.s4,
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  profileAvatarImg: { width: 52, height: 52, borderRadius: Radius.pill },
  profileAvatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(24), color: '#fff' },
  profileInfo: { flex: 1, gap: 2 },
  profileNameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  profileName: { fontFamily: FontFamily.displayItalic, fontSize: sf(18), color: Colors.ink, flexShrink: 1 },
  profileUsername: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.sakuraDeep },
  profilePronouns: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },
  profileEdit: {
    width: 28, height: 28, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3,
    backgroundColor: Colors.sakuraDeep,
    borderRadius: Radius.pill,
    alignSelf: 'center',
  },
  premiumBadgeText: {
    fontFamily: FontFamily.uiMedium, fontSize: FontSize.body, color: Colors.vellum,
  },
  proCard: {
    padding: Spacing.s4,
    backgroundColor: Colors.sakuraDeep,
    borderRadius: Radius.r4,
  },
  proTitle: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: FontSize.h5,
    color: Colors.vellum,
  },
  proSub: {
    fontFamily: FontFamily.ui,
    fontSize: FontSize.caption,
    color: Colors.vellum,
    opacity: 0.8,
    marginTop: 4,
  },
  decoTL: {
    position: 'absolute',
    top: 130,
    left: 20,
  },
  decoBR: {
    position: 'absolute',
    bottom: 120,
    right: 30,
  },
});

