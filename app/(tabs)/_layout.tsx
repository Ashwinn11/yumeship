import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Sparkle } from '@/deco';

const TABS = [
  { id: 'index',     ja: '船', label: 'Home' },
  { id: 'templates', ja: '型', label: 'Templates' },
  { id: 'upcoming',  ja: '次', label: 'Upcoming' },
  { id: 'settings',  ja: '設', label: 'Settings' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.vellum,
        tabBarInactiveTintColor: colors.ink2,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="templates" />
      <Tabs.Screen name="upcoming" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

function CustomTabBar({ state, navigation }: any) {
  return (
    <View style={styles.barWrap}>
      <View style={styles.pill}>
        {TABS.map((tab, i) => {
          const active = state.index === i;
          return (
            <View
              key={tab.id}
              style={[styles.tab, active && styles.tabActive]}
            >
              {active && (
                <View style={styles.activeSparkle}>
                  <Sparkle size={9} color={colors.butter} />
                </View>
              )}
              <Text
                onPress={() => navigation.navigate(tab.id)}
                style={[styles.tabJa, { opacity: active ? 1 : 0.55, color: active ? colors.vellum : colors.ink2 }]}
              >
                {tab.ja}
              </Text>
              <Text
                onPress={() => navigation.navigate(tab.id)}
                style={[styles.tabLabel, { color: active ? colors.vellum : colors.ink2, fontWeight: active ? '600' : '500' }]}
              >
                {tab.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { display: 'none' },
  barWrap: {
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.s5,
    paddingTop: spacing.s1,
    backgroundColor: colors.paper,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: colors.vellum,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 5,
    gap: 2,
    ...shadows.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  tabActive: {
    backgroundColor: colors.sakuraDeep,
  },
  activeSparkle: { position: 'absolute', left: -3, top: -3 },
  tabJa: {
    fontSize: 11,
    fontFamily: 'KleeOne',
  },
  tabLabel: {
    fontSize: 11,
  },
});
