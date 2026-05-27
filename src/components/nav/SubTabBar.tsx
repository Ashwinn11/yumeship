import { Sparkle } from '@/components/deco/Sparkle';
import { Colors, FontFamily, FontSize, Radius, Shadow } from '@/constants/theme';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// design/spec.jsx — SubTabBar + TABS
// 7-tab horizontal scroller for F/O detail. Same pill treatment as RootTabBar.

export type DetailTab = 'profile' | 'albums' | 'scenarios' | 'storyline' | 'messages' | 'dates' | 'this-or-that' | 'love-letter';

const TABS: { id: DetailTab; ja: string; label: string }[] = [
  { id: 'profile',      ja: '本人', label: 'Profile' },
  { id: 'albums',       ja: '写真', label: 'Albums' },
  { id: 'scenarios',    ja: '話',   label: 'Scenarios' },
  { id: 'storyline',    ja: '年表', label: 'Storyline' },
  { id: 'messages',     ja: '便り', label: 'Messages' },
  { id: 'dates',        ja: '日',   label: 'Dates' },
  { id: 'this-or-that', ja: '択',   label: 'This or That' },
  { id: 'love-letter',  ja: '文',   label: 'Letters' },
];

type Props = {
  active: DetailTab;
  onPress: (tab: DetailTab) => void;
};

export function SubTabBar({ active, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
      >
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <Pressable key={t.id} onPress={() => onPress(t.id)} style={[styles.tab, on && styles.tabActive]}>
              {on && (
                <View style={styles.sparkle}>
                  <Sparkle size={8} color={Colors.butter} />
                </View>
              )}
              <Text style={[styles.ja, { opacity: on ? 1 : 0.6, color: on ? Colors.vellum : Colors.ink2 }]}>
                {t.ja}
              </Text>
              <Text style={[styles.label, { color: on ? Colors.vellum : Colors.ink2, fontWeight: on ? '600' : '500' }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.vellum,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 5,
    gap: 4,
    ...Shadow.s1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    position: 'relative',
    flexShrink: 0,
  },
  tabActive: {
    backgroundColor: Colors.sakuraDeep,
  },
  sparkle: {
    position: 'absolute',
    left: -2,
    top: -4,
  },
  ja: {
    fontFamily: FontFamily.ja,
    fontSize: FontSize.caption,
  },
  label: {
    fontFamily: FontFamily.ui,
    fontSize: FontSize.caption,
  },
});
