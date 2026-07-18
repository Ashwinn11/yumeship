import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initDb } from '@/db/init';
import { configureRevenueCat } from '@/store/purchases';
import { refreshPremium } from '@/store/premium';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useMemo(() => {
    try {
      initDb();
    } catch (err) {
      console.error('Database initialization failed:', err);
    }

    try {
      configureRevenueCat();
      refreshPremium();
    } catch (err) {
      console.warn('Premium initialization failed:', err);
    }
  }, []);

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

  const updateCheckInFlight = useRef(false);

  useEffect(() => {
    async function checkForAppUpdate() {
      if (!Updates.isEnabled || updateCheckInFlight.current) return;

      updateCheckInFlight.current = true;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (err) {
        console.warn('Expo update check failed:', err);
      } finally {
        updateCheckInFlight.current = false;
      }
    }

    checkForAppUpdate();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkForAppUpdate();
      }
    });

    return () => subscription.remove();
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="ship/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="fo" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="stickers" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="messages" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="template" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
            <Stack.Screen name="paywall" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="terms" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="privacy" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
