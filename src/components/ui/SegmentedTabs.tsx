import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';

export type SegmentedTab<T extends string> = { key: T; label: string };

/** One pill "track" behind all segments, same chrome as community's feed
 *  tabs (global/following/activities) and the message-sender toggle — a
 *  single continuous track with a solid-fill active segment, rather than
 *  separately-bordered buttons. Used everywhere a screen needs this kind of
 *  in-place view switch, so it never has to be redrawn to match by hand. */
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
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.paperDeep,
    borderRadius: Radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: Radius.pill },
  tabActive: { backgroundColor: Colors.sakuraDeep },
  tabText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3, textTransform: 'capitalize' },
  tabTextActive: { color: '#fff', fontFamily: FontFamily.uiSemiBold },
});
