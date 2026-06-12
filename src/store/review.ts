/**
 * Store-rating prompts
 *
 * Every feature counts content saves via trackMeaningfulAction(); the
 * native rating dialog is requested at engagement milestones, spaced
 * apart so the OS never swallows back-to-back attempts (iOS/Android
 * only display the dialog when *they* decide to — calls are requests,
 * not guarantees).
 */
import { Linking, Platform } from 'react-native';
import { isAvailableAsync, requestReview } from 'expo-store-review';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';

const APP_STORE_ID = '6773642234';
const ANDROID_PACKAGE = 'com.yumeship.app';

// First milestone lands in the honeymoon session, after the user has
// actually created things; later ones catch long-term users who were
// suppressed or dismissed earlier.
const MILESTONES = [3, 12, 30, 75, 150];
const MIN_GAP_MS = 14 * 86_400_000;

/** Call whenever the user saves content anywhere in the app. */
export function trackMeaningfulAction() {
  try {
    const n = parseInt(getGlobalSetting('review_actions_count', '0'), 10) + 1;
    saveGlobalSetting('review_actions_count', String(n));
    if (MILESTONES.includes(n)) void askForReview();
  } catch {
    // a rating prompt must never break a save
  }
}

/**
 * Requests the native in-app rating dialog, at most once per 14 days.
 * Also called directly at delight moments (export, purchase).
 */
export async function askForReview() {
  try {
    const last = parseInt(getGlobalSetting('review_last_ask_at', '0'), 10);
    if (last && Date.now() - last < MIN_GAP_MS) return;
    if (!(await isAvailableAsync())) return;
    saveGlobalSetting('review_last_ask_at', String(Date.now()));
    await requestReview();
  } catch {
    // ignore — OS may refuse, store app may be missing, etc.
  }
}

/** Opens the store's write-a-review page directly. Never throttled. */
export function openWriteReview() {
  const native = Platform.OS === 'android'
    ? `market://details?id=${ANDROID_PACKAGE}`
    : `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`;
  const web = Platform.OS === 'android'
    ? `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`
    : `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
  Linking.openURL(native).catch(() => Linking.openURL(web).catch(() => {}));
}
