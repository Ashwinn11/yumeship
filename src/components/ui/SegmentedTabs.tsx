import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';

export type SegmentedTab<T extends string> = { key: T; label: string };

/** A small pill-style tab row for switching between two or three views in
 *  place — same chrome as CardThemeSheet's own tab row, just reusable. */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View style={styles.row}>
      {tabs.map((t) => (
        <Pressable
          key={t.key}
          onPress={() => onChange(t.key)}
          style={[styles.tab, value === t.key && styles.tabActive]}
        >
          <Text style={[styles.tabText, value === t.key && styles.tabTextActive]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: Radius.pill, backgroundColor: Colors.paperDeep,
    borderWidth: 1, borderColor: Colors.line,
  },
  tabActive: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakuraDeep },
  tabText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2, textTransform: 'capitalize' },
  tabTextActive: { color: Colors.sakuraDeep },
});
