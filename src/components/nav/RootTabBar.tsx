import { Colors, FontFamily, Radius, Shadow } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  IconHomeOutline,
  IconJournalOutline,
  IconMailOutline,
  IconProfileOutline,
  IconPlus,
} from '@/components/ui';

export type RootTab = 'home' | 'vault' | 'upcoming' | 'settings';

type Props = {
  active: RootTab;
  onPress: (tab: RootTab) => void;
  onPlusPress?: () => void;
};

export function RootTabBar({ active, onPress, onPlusPress }: Props) {
  const tabsList: { id: RootTab; label: string; icon: (color: string) => React.ReactNode }[] = [
    { id: 'home', label: 'home', icon: (color) => <IconHomeOutline color={color} /> },
    { id: 'vault', label: 'vault', icon: (color) => <IconJournalOutline color={color} /> },
    { id: 'upcoming', label: 'upcoming', icon: (color) => <IconMailOutline color={color} /> },
    { id: 'settings', label: 'settings', icon: (color) => <IconProfileOutline color={color} /> },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {/* Left two tabs: home and vault */}
        {tabsList.slice(0, 2).map((t) => {
          const on = t.id === active;
          const activeColor = Colors.ink;
          const inactiveColor = Colors.ink3;
          return (
            <Pressable
              key={t.id}
              onPress={() => onPress(t.id)}
              style={[styles.tab, on && styles.tabActive]}
            >
              {t.icon(on ? activeColor : inactiveColor)}
              <Text style={[styles.label, { color: on ? activeColor : inactiveColor, fontFamily: on ? FontFamily.uiSemiBold : FontFamily.ui }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}

        {/* Center floating add button */}
        <Pressable style={styles.plusBtn} onPress={onPlusPress} id="tab-add-ship">
          <IconPlus color={Colors.vellum} size={18} />
        </Pressable>

        {/* Right two tabs: upcoming and settings */}
        {tabsList.slice(2).map((t) => {
          const on = t.id === active;
          const activeColor = Colors.ink;
          const inactiveColor = Colors.ink3;
          return (
            <Pressable
              key={t.id}
              onPress={() => onPress(t.id)}
              style={[styles.tab, on && styles.tabActive]}
            >
              {t.icon(on ? activeColor : inactiveColor)}
              <Text style={[styles.label, { color: on ? activeColor : inactiveColor, fontFamily: on ? FontFamily.uiSemiBold : FontFamily.ui }]}>
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
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.vellum,
    borderRadius: Radius.r5,
    borderWidth: 1.5,
    borderColor: Colors.line,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    ...Shadow.s2,
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.r3,
    minWidth: 64,
  },
  tabActive: {
    backgroundColor: Colors.sakuraSoft,
  },
  plusBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.s2,
  },
  label: {
    fontSize: 9,
    marginTop: 1,
  },
});
