import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { SparkleCluster } from '@/components/deco/SparkleCluster';
import { IconBell, IconLock } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Toggle } from '@/components/ui/Toggle';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
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
        <View style={row.iconBox}>
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
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: Colors.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Mark size={26} />
          <Text style={styles.version}>v0.1.0</Text>
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
        {/* Pro card */}
        <View style={styles.proCard}>
          <View style={styles.proSparkle}>
            <SparkleCluster color={Colors.sakuraDeep} />
          </View>
          <View style={styles.proEyebrow}>
            <Heart size={12} color={Colors.sakuraDeep} />
            <Text style={styles.proLabel}>yumeship pro</Text>
          </View>
          <Text style={styles.proText}>iCloud sync.{'\n'}Coming soon.</Text>
        </View>

        <SettingGroup ja="鍵" name="App lock">
          <SettingRow
            label="Face ID lock"
            icon={<IconLock size={12} color={Colors.ink2} />}
            trailing={<Toggle value={true} onValueChange={() => { }} />}
          />
          <SettingRow
            label="Timeout"
            trailing={<MetaText>1 min</MetaText>}
          />
        </SettingGroup>

        <SettingGroup ja="便" name="Notifications">
          <SettingRow
            label="Allow notifications"
            icon={<IconBell size={12} color={Colors.ink2} />}
            trailing={<Toggle value={true} onValueChange={() => { }} />}
          />
          <SettingRow
            label="Discreet preview"
            trailing={<Toggle value={true} onValueChange={() => { }} />}
          />
        </SettingGroup>

        <SettingGroup ja="蔵" name="Data">
          <SettingRow label="Storage" trailing={<MetaText>0 MB</MetaText>} />
          <SettingRow
            label="Delete all data"
            destructive
            onPress={() => Alert.alert(
              'Delete everything?',
              'This removes all ships, headcanons, scenarios, messages, albums, and more. Cannot be undone.',
              [
                {
                  text: 'Delete everything',
                  style: 'destructive',
                  onPress: () => { deleteAllData(); router.replace('/onboarding'); },
                },
                { text: 'Cancel', style: 'cancel' },
              ],
            )}
          />
        </SettingGroup>
      </ScrollView>
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
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.h6,
    lineHeight: 24,
    color: Colors.ink,
    marginTop: Spacing.s1,
  },
});
