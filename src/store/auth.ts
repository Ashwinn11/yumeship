import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as ExpoCrypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User } from '@supabase/supabase-js';

import { supabase, supabaseRedirectUrl } from '@/lib/supabase';

// Required for expo-auth-session to close the browser after OAuth on Android
WebBrowser.maybeCompleteAuthSession();

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string | undefined;
  name: string | undefined;
  avatarUrl: string | undefined;
  provider: 'google' | 'apple' | undefined;
};

// ─── Module-level state ───────────────────────────────────────────────────────

let _user: AuthUser | null = null;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

function userFromSession(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  const u: User = session.user;
  const meta = u.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email,
    name: meta.full_name ?? meta.name ?? meta.user_name ?? undefined,
    avatarUrl: meta.avatar_url ?? meta.picture ?? undefined,
    provider: (u.app_metadata?.provider as AuthUser['provider']) ?? undefined,
  };
}

// ─── Bootstrap (call once in _layout.tsx) ────────────────────────────────────

let _bootstrapped = false;

export function bootstrapAuth() {
  if (_bootstrapped) return;
  _bootstrapped = true;

  // Restore existing session without blocking render
  supabase.auth.getSession().then(({ data: { session } }) => {
    _user = userFromSession(session);
    notify();
  });

  // Keep state in sync with future auth events
  supabase.auth.onAuthStateChange((_event, session) => {
    _user = userFromSession(session);
    notify();
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(_user);

  useEffect(() => {
    const refresh = () => setUser(_user);
    _listeners.add(refresh);
    return () => { _listeners.delete(refresh); };
  }, []);

  return user;
}

// ─── Sign-in with Google (both platforms, via Supabase OAuth proxy) ──────────
// Uses browser-based OAuth — no nonce required for this flow.
// iOS: openAuthSessionAsync catches the yumeship:// redirect and returns the
//      full URL directly — we exchange it here.
// Android: Chrome Custom Tab closes on custom-scheme redirect and
//          openAuthSessionAsync returns 'cancel'. The deep link is handled
//          by src/app/auth/callback.tsx instead.

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = supabaseRedirectUrl;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success') {
    const url = result.url;
    // Extract query string (everything between '?' and '#')
    const queryString = url.split('?')[1]?.split('#')[0] ?? '';
    const params = new URLSearchParams(queryString);
    const code = params.get('code');

    if (!code) {
      throw new Error('No code parameter found in redirect URL');
    }

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
  }
  // On Android result.type will be 'cancel' — the redirect is caught
  // as a deep link and handled by auth/callback.tsx instead.
}

// ─── Sign-in with Apple (iOS only) ────────────────────────────────────────────
// Per Supabase docs: nonce is REQUIRED for signInWithIdToken with Apple.
//   • Apple receives the SHA-256 *hashed* nonce
//   • Supabase receives the *raw* nonce
// Apple only provides fullName on the very first sign-in — must capture and
// persist it immediately via updateUser(), otherwise it's lost forever.

export async function signInWithApple(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  // 1. Generate raw nonce and its SHA-256 hash
  const rawNonce = ExpoCrypto.randomUUID();
  const hashedNonce = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  // 2. Request Apple credential — pass the HASHED nonce to Apple
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  const { identityToken, fullName } = credential;
  if (!identityToken) throw new Error('No identity token from Apple');

  // 3. Exchange with Supabase — pass the RAW nonce
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
    nonce: rawNonce,
  });

  if (error) throw error;

  // 4. Persist fullName — Apple ONLY provides this on the first sign-in.
  //    Save it immediately or it's gone on every subsequent login.
  if (fullName?.givenName || fullName?.familyName) {
    const full_name = [fullName.givenName, fullName.familyName]
      .filter(Boolean)
      .join(' ');
    await supabase.auth.updateUser({
      data: {
        full_name,
        given_name: fullName.givenName ?? undefined,
        family_name: fullName.familyName ?? undefined,
      },
    });
  }
}

// ─── Sign-out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  // onAuthStateChange fires and clears _user automatically
}

