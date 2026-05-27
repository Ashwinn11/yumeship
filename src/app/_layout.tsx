import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDb } from '@/db/init';
import { configureRevenueCat } from '@/store/purchases';
import { refreshPremium } from '@/store/premium';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useMemo(() => { initDb(); configureRevenueCat(); refreshPremium(); }, []);

  const [loaded] = useFonts({
    'InstrumentSerif-Italic': require('../../assets/fonts/InstrumentSerif-Italic.ttf'),
    'KleeOne-Regular': require('../../assets/fonts/KleeOne-Regular.ttf'),
    'Fredoka-Regular': require('../../assets/fonts/Fredoka-Regular.ttf'),
    'Fredoka-Medium': require('../../assets/fonts/Fredoka-Medium.ttf'),
    'Fredoka-SemiBold': require('../../assets/fonts/Fredoka-SemiBold.ttf'),
    'Caveat-Bold': require('../../assets/fonts/Caveat-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ship/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="messages" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="template" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
        <Stack.Screen name="paywall" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="terms" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
