import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

/**
 * Deep-link landing screen for OAuth redirects.
 * Supabase redirects to yumeship://auth/callback?code=xxx after Google OAuth.
 * We grab the code, exchange it for a session, then push into the app.
 */
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    async function handleCallback() {
      try {
        let code = params.code;
        if (code) {
          // Strip any trailing hash symbol if present
          code = code.replace(/#$/, '');
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch (err) {
        console.warn('[auth/callback] session exchange failed:', err);
      } finally {
        // Always navigate back to the main app
        router.replace('/(tabs)');
      }
    }

    handleCallback();
  }, [params.code]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={Colors.sakuraDeep} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
