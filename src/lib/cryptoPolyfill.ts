/**
 * Polyfill global crypto for React Native / Expo (Hermes).
 *
 * Hermes provides a partial native crypto (getRandomValues on the prototype,
 * not as an own property) but lacks crypto.subtle. Trying to patch the native
 * crypto object via property assignment or even Object.defineProperty copying
 * the native getRandomValues fails because the native method is not accessible
 * as a plain own property.
 *
 * Solution: always define the ENTIRE crypto object using expo-crypto for both
 * getRandomValues and subtle.digest. This is safe — expo-crypto uses the same
 * underlying platform crypto APIs.
 *
 * Import ONCE, before createClient, at the top of supabase.ts.
 */

import * as ExpoCrypto from 'expo-crypto';


/** Mirrors crypto.getRandomValues — fills a Uint8Array with random bytes. */
function getRandomValues(arr: Uint8Array): Uint8Array {
  const bytes = ExpoCrypto.getRandomBytes(arr.length);
  arr.set(bytes);
  return arr;
}

/** SHA-256 an ArrayBuffer using expo-crypto, returns an ArrayBuffer. */
async function sha256Digest(data: ArrayBuffer): Promise<ArrayBuffer> {
  // Convert bytes to a string (PKCE verifiers are ASCII-only base64url).
  const bytes = new Uint8Array(data);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }

  const hex = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    str,
    { encoding: ExpoCrypto.CryptoEncoding.HEX }
  );

  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return out.buffer;
}

const cryptoShim = {
  getRandomValues,
  subtle: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    digest: (_algorithm: unknown, data: ArrayBuffer) => sha256Digest(data),
  },
};

try {
  Object.defineProperty(globalThis, 'crypto', {
    value: cryptoShim,
    writable: true,
    configurable: true,
  });
} catch (e) {
  // Last resort — direct assignment (works if crypto isn't yet defined)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).crypto = cryptoShim;
  } catch (e2) {
    // Silent fail
  }
}

// Polyfill TextEncoder if missing (required by Supabase generatePKCEChallenge)
if (typeof globalThis.TextEncoder === 'undefined') {
  class TextEncoder {
    encode(str: string): Uint8Array {
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
      }
      return arr;
    }
  }
  globalThis.TextEncoder = TextEncoder as any;
}

// Polyfill btoa if missing (required by Supabase generatePKCEChallenge)
if (typeof globalThis.btoa === 'undefined') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  globalThis.btoa = (input: string): string => {
    let str = input;
    let output = '';
    for (let block = 0, charCode, i = 0, map = chars;
      str.charAt(i | 0) || (map = '=', i % 1);
      output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
      charCode = str.charCodeAt(i += 3/4);
      if (charCode > 0xFF) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  };
}


