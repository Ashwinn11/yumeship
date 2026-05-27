import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart } from '@/components/deco/Heart';
import { Pin } from '@/components/deco/Pin';
import { Sparkle } from '@/components/deco/Sparkle';
import { SparkleCluster } from '@/components/deco/SparkleCluster';
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
import { Mark } from '@/components/ui/Mark';
import { Toggle } from '@/components/ui/Toggle';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  getNotifEnabled, requestPermission, setNotifEnabled,
} from '@/store/notifications';
import { isPremium, manageSubscriptions, restorePurchases } from '@/store/purchases';
import { deleteAllData } from '@/store/ships';

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
  ja: { fontFamily: FontFamily.ja, fontSize: 11, color: Colors.sakuraDeep, fontWeight: '600' },
  name: {
    fontFamily: FontFamily.marker,
    fontSize: 9,
    color: Colors.ink3,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '600',
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
    fontWeight: '500',
    fontFamily: FontFamily.ui,
  },
});

function MetaText({ children }: { children: string }) {
  return <Text style={meta.text}>{children}</Text>;
}
const meta = StyleSheet.create({
  text: { fontSize: 11, color: Colors.ink3, fontFamily: FontFamily.ui },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notifEnabled, setNotifEnabledState] = useState(() => getNotifEnabled());
  const [storageLabel, setStorageLabel] = useState('—');
  const [premium, setPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    isPremium().then((v) => { setPremium(v); setCheckingPremium(false); });
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
      Alert.alert('Error', e?.message ?? 'Could not open subscription management.');
    }
  }

  async function handleRestorePurchases() {
    try {
      const { isPremium: active } = await restorePurchases();
      if (active) {
        setPremium(true);
        Alert.alert('Restored!', 'Your premium subscription has been restored.');
      } else {
        Alert.alert('Nothing to restore', 'No active subscription found for this Apple ID.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not restore purchases.');
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Background accents */}
      <View style={styles.decoTL} pointerEvents="none">
        <Pin size={18} color={Colors.sakuraDeep} />
      </View>
      <View style={styles.decoBR} pointerEvents="none">
        <Sparkle size={18} color={Colors.lavenderDeep} />
      </View>

      {/* Header */}
      <View style={styles.header}>
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
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {/* Pro card — dynamic based on subscription status */}
        {!checkingPremium && (
          premium ? (
            <View style={[styles.proCard, styles.proCardActive]}>
              <View style={styles.proSparkle}>
                <SparkleCluster color={Colors.sakuraDeep} />
              </View>
              <View style={styles.proEyebrow}>
                <Heart size={12} color={Colors.sakuraDeep} />
                <Text style={styles.proLabel}>yumeship premium</Text>
              </View>
              <Text style={styles.proText}>Active ✓{'\n'}Thank you for your support!</Text>
            </View>
          ) : (
            <Pressable
              style={styles.proCard}
              onPress={() => router.push('/paywall' as any)}
              id="settings-upgrade"
            >
              <View style={styles.proSparkle}>
                <SparkleCluster color={Colors.sakuraDeep} />
              </View>
              <View style={styles.proEyebrow}>
                <Heart size={12} color={Colors.sakuraDeep} />
                <Text style={styles.proLabel}>yumeship premium</Text>
              </View>
              <Text style={styles.proText}>Unlimited ships.{'\n'}Unlock everything →</Text>
            </Pressable>
          )
        )}

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
          deleteAllData();
          router.replace('/onboarding');
        }}
        onClose={() => setShowDeleteModal(false)}
        isDestructive={true}
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
    fontSize: 10,
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
    fontSize: 34,
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
  proCard: {
    padding: Spacing.s4,
    backgroundColor: Colors.sakuraSoft,
    borderWidth: 1,
    borderColor: Colors.sakura,
    borderRadius: Radius.r4,
    position: 'relative',
    overflow: 'hidden',
  },
  proCardActive: {
    borderColor: Colors.sakuraDeep,
  },
  proSparkle: {
    position: 'absolute',
    top: 8,
    right: 10,
  },
  proEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  proLabel: {
    fontFamily: FontFamily.marker,
    fontSize: 9,
    color: Colors.sakuraDeep,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  proText: {
    fontFamily: FontFamily.uiMedium,
    fontSize: FontSize.h6,
    lineHeight: 24,
    color: Colors.ink,
    marginTop: Spacing.s1,
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
