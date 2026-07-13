import { Colors, FontFamily, Radius, Shadow ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  IconHomeOutline,
  IconJournalOutline,
  IconMailOutline,
  IconProfileOutline,
  IconCommunityOutline,
} from '@/components/ui';

export type RootTab = 'home' | 'vault' | 'community' | 'upcoming' | 'settings';

type Props = {
  active: RootTab;
  onPress: (tab: RootTab) => void;
};

export function RootTabBar({ active, onPress }: Props) {
  const { column } = useIPad();
  const tabsList: { id: RootTab; label: string; icon: (color: string) => React.ReactNode }[] = [
    { id: 'home', label: 'home', icon: (color) => <IconHomeOutline color={color} /> },
    { id: 'vault', label: 'vault', icon: (color) => <IconJournalOutline color={color} /> },
    { id: 'community', label: 'community', icon: (color) => <IconCommunityOutline color={color} /> },
    { id: 'upcoming', label: 'upcoming', icon: (color) => <IconMailOutline color={color} /> },
    { id: 'settings', label: 'settings', icon: (color) => <IconProfileOutline color={color} /> },
  ];

  return (
    <View style={[styles.wrap, column]}>
      <View style={styles.track}>
        {tabsList.map((t) => {
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
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: Radius.r3,
  },
  tabActive: {
    backgroundColor: Colors.sakuraSoft,
  },
  label: {
    fontSize: sf(9),
    marginTop: 1,
  },
});
