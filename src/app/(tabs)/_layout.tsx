import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Colors } from '@/constants/theme';

import { RootTabBar, type RootTab } from '@/components/nav/RootTabBar';

const ROUTE_TO_TAB: Record<string, RootTab> = {
  index:     'home',
  vault:     'vault',
  community: 'community',
  upcoming:  'upcoming',
  settings:  'settings',
};

const TAB_TO_ROUTE: Record<RootTab, string> = {
  home:      'index',
  vault:     'vault',
  community: 'community',
  upcoming:  'upcoming',
  settings:  'settings',
};

type TabBarProps = {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { navigate: (name: string) => void };
  descriptors: Record<string, { options: Record<string, unknown> }>;
};

function CustomTabBar({ state, navigation, descriptors }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index];
  const activeOptions = descriptors[activeRoute?.key ?? '']?.options ?? {};
  const tabBarStyle = activeOptions.tabBarStyle as { display?: string } | undefined;

  if (tabBarStyle?.display === 'none') return null;

  const active = ROUTE_TO_TAB[activeRoute?.name ?? 'index'] ?? 'home';

  return (
    <View style={{ paddingBottom: insets.bottom, backgroundColor: Colors.paper }}>
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
      tabBar={(props) => <CustomTabBar state={props.state} navigation={props.navigation} descriptors={props.descriptors} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="vault" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="upcoming" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
