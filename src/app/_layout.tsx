import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'InstrumentSerif-Regular': require('../../assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic':  require('../../assets/fonts/InstrumentSerif-Italic.ttf'),
    'KleeOne-Regular':         require('../../assets/fonts/KleeOne-Regular.ttf'),
    'KleeOne-SemiBold':        require('../../assets/fonts/KleeOne-SemiBold.ttf'),
    'JetBrainsMono-Regular':   require('../../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Medium':    require('../../assets/fonts/JetBrainsMono-Medium.ttf'),
    'Fredoka-Regular':         require('../../assets/fonts/Fredoka-Regular.ttf'),
    'Fredoka-Medium':          require('../../assets/fonts/Fredoka-Medium.ttf'),
    'Fredoka-SemiBold':        require('../../assets/fonts/Fredoka-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ship" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="messages" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="new-ship" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="template" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
