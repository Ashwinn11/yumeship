import React from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, SafeAreaView, Switch,
} from 'react-native';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Mark, Toggle } from '@/components';
import { Sparkle, SparkleCluster, Heart } from '@/deco';
import { useSettingsStore } from '@/store/settingsStore';
import { useLockStore } from '@/store/lockStore';
import packageJson from '@/package.json';

function MiniGroup({ ja, name, children }: { ja: string; name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupJa}>{ja}</Text>
        <Text style={styles.groupName}>{name}</Text>
      </View>
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

function MiniSetting({
  label, trailing, destructive,
  icon,
}: {
  label: string;
  trailing?: React.ReactNode;
  destructive?: boolean;
  icon?: string;
}) {
  return (
    <View style={styles.setting}>
      {icon && (
        <View style={[styles.settingIcon, destructive && { backgroundColor: colors.peachSoft }]}>
          <Text style={{ fontSize: 12 }}>{icon}</Text>
        </View>
      )}
      <Text style={[styles.settingLabel, destructive && { color: colors.ember }]}>{label}</Text>
      {trailing}
    </View>
  );
}

export default function Settings() {
  const { appLockEnabled, setAppLockEnabled, notificationsEnabled, setNotificationsEnabled, discreetNotifications, setDiscreetNotifications } = useSettingsStore();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Mark size={26} />
          <Text style={styles.version}>v{packageJson.version}</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>settings</Text>
          <Sparkle size={14} color={colors.lavenderDeep} />
        </View>

        {/* Pro card */}
        <View style={styles.proCard}>
          <View style={styles.proSparkle}>
            <SparkleCluster color={colors.sakuraDeep} />
          </View>
          <View style={styles.proLabel}>
            <Heart size={12} color={colors.sakuraDeep} />
            <Text style={styles.proLabelText}>yumeship pro</Text>
          </View>
          <Text style={styles.proTitle}>iCloud sync.{'\n'}Coming soon.</Text>
        </View>

        {/* App lock */}
        <MiniGroup ja="鍵" name="App lock">
          <MiniSetting
            icon="🔒" label="Face ID lock"
            trailing={<Toggle on={appLockEnabled} onToggle={() => setAppLockEnabled(!appLockEnabled)} />}
          />
          <MiniSetting
            label="Timeout"
            trailing={<Text style={styles.settingMeta}>1 min</Text>}
          />
        </MiniGroup>

        {/* Notifications */}
        <MiniGroup ja="便" name="Notifications">
          <MiniSetting
            icon="🔔" label="Allow notifications"
            trailing={<Toggle on={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />}
          />
          <MiniSetting
            label="Discreet preview"
            trailing={<Toggle on={discreetNotifications} onToggle={() => setDiscreetNotifications(!discreetNotifications)} />}
          />
        </MiniGroup>

        {/* Data */}
        <MiniGroup ja="蔵" name="Data">
          <MiniSetting label="Storage" trailing={<Text style={styles.settingMeta}>142 MB</Text>} />
          <MiniSetting label="Delete all" destructive />
        </MiniGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.s3 + 2, paddingTop: spacing.s2, paddingBottom: spacing.s5 },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.s2,
    paddingVertical: spacing.s2,
  },
  version: { fontFamily: 'JetBrainsMono', fontSize: 10, color: colors.ink3, letterSpacing: 1.2 },

  titleRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.s2,
    paddingHorizontal: spacing.s2, marginTop: spacing.s3, marginBottom: spacing.s3,
  },
  title: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 34, lineHeight: 32, letterSpacing: -0.5, color: colors.ink,
  },

  proCard: {
    padding: spacing.s4, marginBottom: spacing.s3,
    backgroundColor: colors.sakuraSoft,
    borderWidth: 1, borderColor: colors.sakura,
    borderRadius: radii.r4,
    overflow: 'hidden', position: 'relative',
  },
  proSparkle: { position: 'absolute', top: 8, right: 10 },
  proLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.s1 },
  proLabelText: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.sakuraDeep,
    letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '600',
  },
  proTitle: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, lineHeight: 22, color: colors.ink,
  },

  group: { marginBottom: spacing.s3 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.s1 + 1, paddingHorizontal: spacing.s1 },
  groupJa: { fontFamily: 'KleeOne', fontSize: 11, color: colors.sakuraDeep, fontWeight: '600' },
  groupName: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3,
    letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '600',
  },
  groupBody: {
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r3, overflow: 'hidden',
  },

  setting: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.s2,
    padding: spacing.s2 + 1,
    paddingHorizontal: spacing.s3,
    borderBottomWidth: 1, borderBottomColor: colors.paperDeep,
  },
  settingIcon: {
    width: 22, height: 22, borderRadius: 5,
    backgroundColor: colors.paperDeep,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  settingLabel: { flex: 1, fontSize: 12, color: colors.ink, fontWeight: '500' },
  settingMeta: { fontSize: 11, color: colors.ink3 },
});
