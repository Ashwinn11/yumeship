import { useEffect } from 'react';
import { View, StyleSheet, AppState, Text, TextInput } from 'react-native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
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

import { InstrumentSerif_400Regular_Italic, InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { KleeOne_400Regular } from '@expo-google-fonts/klee-one';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { Fredoka_400Regular } from '@expo-google-fonts/fredoka';

// Globally override default fontFamily for Text and TextInput to Fredoka
const patchComponentStyle = (Component: any, defaultStyle: any) => {
  if (!Component) return;
  const originalRender = Component.render || (Component.type && Component.type.render);
  if (originalRender) {
    const target = Component.render ? Component : Component.type;
    target.render = function render(props: any, ref: any) {
      return originalRender.call(this, {
        ...props,
        style: [defaultStyle, props.style],
      }, ref);
    };
  }
};

patchComponentStyle(Text, { fontFamily: 'Fredoka' });
patchComponentStyle(TextInput, { fontFamily: 'Fredoka' });

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_Italic:  InstrumentSerif_400Regular_Italic,
    InstrumentSerif_Regular: InstrumentSerif_400Regular,
    KleeOne:                 KleeOne_400Regular,
    JetBrainsMono:           JetBrainsMono_400Regular,
    Fredoka:                 Fredoka_400Regular,
  });

  const { success, error } = useMigrations(db, migrations);
  const { isLocked, lock, unlock } = useLockStore();
  const { appLockEnabled, lockTimeout, onboardingComplete } = useSettingsStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // Redirect to onboarding on first launch
  useEffect(() => {
    if (!navigationState?.key) return;

    if (!onboardingComplete) {
      const inOnboarding = segments[0] === 'onboarding';
      if (!inOnboarding) {
        router.replace('/onboarding/welcome');
      }
    }
  }, [onboardingComplete, segments, navigationState?.key]);

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
