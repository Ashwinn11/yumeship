import { useEffect } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { db } from '@/db/client';
import { useLockStore } from '@/store/lockStore';
import { useSettingsStore } from '@/store/settingsStore';
import { authenticate } from '@/services/appLock';
import { colors } from '@/tokens/theme';
import LockScreen from './lock-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_Italic:  require('@expo-google-fonts/instrument-serif/400Regular_Italic'),
    InstrumentSerif_Regular: require('@expo-google-fonts/instrument-serif/400Regular'),
    DMSans:                  require('@expo-google-fonts/dm-sans/400Regular'),
    DMSans_Medium:           require('@expo-google-fonts/dm-sans/500Medium'),
    DMSans_SemiBold:         require('@expo-google-fonts/dm-sans/600SemiBold'),
    KleeOne:                 require('@expo-google-fonts/klee-one/400Regular'),
    JetBrainsMono:           require('@expo-google-fonts/jetbrains-mono/400Regular'),
    Caveat:                  require('@expo-google-fonts/caveat/400Regular'),
    Fredoka:                 require('@expo-google-fonts/fredoka/400Regular'),
  });

  const { success, error } = useMigrations(db, migrations);
  const { isLocked, lock, unlock } = useLockStore();
  const { appLockEnabled, lockTimeout, onboardingComplete } = useSettingsStore();

  // Redirect to onboarding on first launch
  useEffect(() => {
    if (!onboardingComplete) {
      router.replace('/onboarding/welcome');
    }
  }, [onboardingComplete]);

  // Lock on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' && appLockEnabled) {
        lock();
      }
    });
    return () => sub.remove();
  }, [appLockEnabled]);

  // Attempt unlock when lock screen is shown
  useEffect(() => {
    if (isLocked && appLockEnabled) {
      authenticate().then((ok) => { if (ok) unlock(); });
    }
  }, [isLocked]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded || error || !success) return null;

  if (isLocked && appLockEnabled) {
    return (
      <View style={styles.fill}>
        <LockScreen onUnlock={() => authenticate().then((ok) => { if (ok) unlock(); })} />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="fo/[id]" />
        <Stack.Screen name="fo/new" />
        <Stack.Screen name="album/[id]" />
        <Stack.Screen name="scenario/[id]" />
        <Stack.Screen name="message/[threadId]" />
        <Stack.Screen name="template/[type]" />
        <Stack.Screen name="polycule/index" />
        <Stack.Screen name="polycule/[id]" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.paper },
});
