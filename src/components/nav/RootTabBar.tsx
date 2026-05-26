import { Sparkle } from '@/components/deco/Sparkle';
import { Colors, FontFamily, FontSize, Radius, Shadow } from '@/constants/theme';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// design/screens.jsx — RootTabBar + ROOT_TABS
// 4-tab pill nav. Active tab = sakura-deep pill + sparkle badge.

export type RootTab = 'home' | 'templates' | 'upcoming' | 'settings';

const TABS: { id: RootTab; ja: string; label: string }[] = [
  { id: 'home',      ja: '船', label: 'Home' },
  { id: 'templates', ja: '型', label: 'Templates' },
  { id: 'upcoming',  ja: '次', label: 'Upcoming' },
  { id: 'settings',  ja: '設', label: 'Settings' },
];

type Props = {
  active: RootTab;
  onPress: (tab: RootTab) => void;
};

export function RootTabBar({ active, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <Pressable key={t.id} onPress={() => onPress(t.id)} style={[styles.tab, on && styles.tabActive]}>
              {on && (
                <View style={styles.sparkle}>
                  <Sparkle size={9} color={Colors.butter} />
                </View>
              )}
              <Text style={[styles.ja, { opacity: on ? 1 : 0.55, color: on ? Colors.vellum : Colors.ink2 }]}>
                {t.ja}
              </Text>
              <Text style={[styles.label, { color: on ? Colors.vellum : Colors.ink2, fontWeight: on ? '600' : '500' }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.vellum,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 5,
    gap: 2,
    ...Shadow.s2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: Colors.sakuraDeep,
  },
  sparkle: {
    position: 'absolute',
    left: -3,
    top: -3,
  },
  ja: {
    fontFamily: FontFamily.ja,
    fontSize: FontSize.hairline,
  },
  label: {
    fontFamily: FontFamily.ui,
    fontSize: FontSize.hairline,
  },
});
