import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { RootTabBar, type RootTab } from '@/components/nav/RootTabBar';

const ROUTE_TO_TAB: Record<string, RootTab> = {
  index:     'home',
  templates: 'templates',
  upcoming:  'upcoming',
  settings:  'settings',
};

const TAB_TO_ROUTE: Record<RootTab, string> = {
  home:      'index',
  templates: 'templates',
  upcoming:  'upcoming',
  settings:  'settings',
};

type TabBarProps = {
  state: { index: number; routes: { name: string }[] };
  navigation: { navigate: (name: string) => void };
};

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name ?? 'index';
  const active = ROUTE_TO_TAB[activeRoute] ?? 'home';

  return (
    <View style={{ paddingBottom: insets.bottom }}>
      <RootTabBar
        active={active}
        onPress={(tab) => navigation.navigate(TAB_TO_ROUTE[tab])}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar state={props.state} navigation={props.navigation} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="templates" />
      <Tabs.Screen name="upcoming" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
