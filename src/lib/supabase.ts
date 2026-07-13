// Must be imported FIRST — patches global.crypto.subtle before Supabase initialises
import './cryptoPolyfill';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * The redirect URI that Supabase will call after OAuth.
 * Must be allow-listed in:
 *   Supabase → Auth → URL Configuration → Redirect URLs
 */
export const supabaseRedirectUrl = 'yumeship://auth/callback';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // PKCE is now fully supported thanks to the TextEncoder & subtle.digest polyfills
  },
});
