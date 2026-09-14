import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  cancelAvatarNotification,
  isAvatarNotificationSupported,
  scheduleAvatarNotification,
} from '@/../modules/avatar-notifications';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';

// Identifiers from the avatar module and from expo-notifications live in the
// same `notif_id` column, so tag ours to know which canceller to call later.
const AVATAR_PREFIX = 'av:';

// On iOS the avatar notifications sit in the same notification center that
// expo's cancel-all clears, but Android schedules them through AlarmManager,
// which that call knows nothing about. Keep the outstanding ids so a global
// wipe can reach them too.
const AVATAR_IDS_KEY = 'avatar_notif_ids';

function readAvatarIds(): string[] {
  try {
    const raw = JSON.parse(getGlobalSetting(AVATAR_IDS_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function rememberAvatarId(id: string) {
  // cap it so a long-lived install can't grow this without bound
  const next = [...readAvatarIds(), id].slice(-200);
  saveGlobalSetting(AVATAR_IDS_KEY, JSON.stringify(next));
}

function forgetAvatarId(id: string) {
  saveGlobalSetting(AVATAR_IDS_KEY, JSON.stringify(readAvatarIds().filter((x) => x !== id)));
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
  });
}

export async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'undetermined';
}

export function getNotifEnabled(): boolean {
  return getGlobalSetting('notif_enabled') !== 'false';
}

export function setNotifEnabled(v: boolean) {
  saveGlobalSetting('notif_enabled', String(v));
}

/**
 * Seconds from now for the one-shot arrival kinds, or null for 'everyday',
 * which repeats and so can't be expressed as a delay.
 */
function secondsUntilArrival(
  arrivalDay: 'now' | 'today' | 'tomorrow' | 'everyday',
  hour: number,
  minute: number,
  staggerIndex: number,
): number | null {
  if (arrivalDay === 'now') return 5 + staggerIndex * 5;
  if (arrivalDay === 'everyday') return null;
  const date = new Date();
  if (arrivalDay === 'tomorrow') date.setDate(date.getDate() + 1);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return Math.round((date.getTime() - Date.now()) / 1000);
}

export async function scheduleFoNotification(
  body: string,
  foName: string,
  arrivalDay: 'now' | 'today' | 'tomorrow' | 'everyday',
  hour: number,
  minute: number,
  staggerIndex = 0,
  /** local avatar uri — when present the F/O's face replaces the app icon */
  avatarUri?: string,
  /** stable per-F/O id so repeat messages thread as one conversation */
  conversationId?: string,
): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    if (avatarUri && isAvatarNotificationSupported()) {
      const seconds = secondsUntilArrival(arrivalDay, hour, minute, staggerIndex);
      if (seconds !== null) {
        const avatarId = await scheduleAvatarNotification({
          senderName: foName || 'F/O',
          body,
          avatarUri,
          seconds,
          conversationId: conversationId || foName || 'fo',
        });
        if (avatarId) {
          rememberAvatarId(avatarId);
          return `${AVATAR_PREFIX}${avatarId}`;
        }
      }
    }

    let trigger: Notifications.NotificationTriggerInput;

    if (arrivalDay === 'now') {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5 + (staggerIndex * 5),
        repeats: false,
      };
    } else if (arrivalDay === 'today' || arrivalDay === 'tomorrow') {
      const date = new Date();
      if (arrivalDay === 'tomorrow') {
        date.setDate(date.getDate() + 1);
      }
      date.setHours(hour, minute, 0, 0);

      // If the target time today has already passed, schedule it for tomorrow
      if (date.getTime() <= Date.now()) {
        date.setDate(date.getDate() + 1);
      }

      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: date,
      };
    } else {
      // everyday
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      };
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: foName || 'F/O',
        body,
      },
      trigger,
    });

    return identifier;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

export async function scheduleOneShotAtDate(
  body: string,
  foName: string,
  date: Date,
): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: foName || 'F/O',
        body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
    return identifier;
  } catch (error) {
    console.error('Failed to schedule one-shot notification:', error);
    return null;
  }
}

export async function cancelNotification(notifId: string): Promise<void> {
  if (!notifId) return;
  if (notifId.startsWith(AVATAR_PREFIX)) {
    const raw = notifId.slice(AVATAR_PREFIX.length);
    await cancelAvatarNotification(raw);
    forgetAvatarId(raw);
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
  } catch {
    // ignore if already cancelled
  }
}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore — nothing scheduled, or OS rejected the call
  }
  await Promise.all(readAvatarIds().map((id) => cancelAvatarNotification(id)));
  saveGlobalSetting(AVATAR_IDS_KEY, '[]');
}

// Schedules a yearly calendar notification for anniversaries/dates.
// dateStr must be YYYY-MM-DD. Returns the notification ID or null on failure.
export async function scheduleAnniversaryNotification(
  title: string,
  dateStr: string,
  hour: number = 9,
): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [, month, day] = parts;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'a special day',
        body: `${title} is today ♡`,
      },
      // YEARLY works on both platforms (CALENDAR is iOS-only) and takes a
      // JS-Date-style 0-based month, unlike the 1-based dateStr.
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.YEARLY,
        month: month - 1,
        day,
        hour,
        minute: 0,
      },
    });

    return identifier;
  } catch {
    return null;
  }
}

