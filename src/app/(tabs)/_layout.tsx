import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { RootTabBar, type RootTab } from '@/components/nav/RootTabBar';
import { resetOnb } from '@/store/onboarding';
import { usePremium } from '@/store/premium';
import { useShips } from '@/store/ships';

const ROUTE_TO_TAB: Record<string, RootTab> = {
  index:    'home',
  vault:    'vault',
  upcoming: 'upcoming',
  settings: 'settings',
};

const TAB_TO_ROUTE: Record<RootTab, string> = {
  home:     'index',
  vault:    'vault',
  upcoming: 'upcoming',
  settings: 'settings',
};

type TabBarProps = {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { navigate: (name: string) => void };
  descriptors: Record<string, { options: Record<string, unknown> }>;
};

function CustomTabBar({ state, navigation, descriptors }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const ships = useShips();
  const premium = usePremium();
  const activeRoute = state.routes[state.index];
  const activeOptions = descriptors[activeRoute?.key ?? '']?.options ?? {};
  const tabBarStyle = activeOptions.tabBarStyle as { display?: string } | undefined;

  if (tabBarStyle?.display === 'none') return null;

  const active = ROUTE_TO_TAB[activeRoute?.name ?? 'index'] ?? 'home';

  function handlePlus() {
    if (!premium && ships.length >= 1) {
      router.push({ pathname: '/paywall', params: { reason: 'add-ship' } });
      return;
    }
    resetOnb();
    router.push({ pathname: '/onboarding/fo', params: { mode: 'new' } });
  }

  return (
    <View style={{ paddingBottom: insets.bottom }}>
      <RootTabBar
        active={active}
        onPress={(tab) => navigation.navigate(TAB_TO_ROUTE[tab])}
        onPlusPress={handlePlus}
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
      <Tabs.Screen name="upcoming" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
