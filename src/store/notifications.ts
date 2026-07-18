import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';
import { getPremium } from './premium';

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

export function getDiscreetMode(): boolean {
  return getGlobalSetting('discreet_notif') === 'true';
}

export function setDiscreetMode(v: boolean) {
  saveGlobalSetting('discreet_notif', String(v));
}

export function getNotifEnabled(): boolean {
  return getGlobalSetting('notif_enabled') !== 'false';
}

export function setNotifEnabled(v: boolean) {
  saveGlobalSetting('notif_enabled', String(v));
}

// Premium, iOS-only feature: show a chosen photo on a notification instead of
// the app icon. The photo is chosen per F/O message (see FoCompose), not a
// single global setting — each ship's messages can carry their own F/O's photo.
// Re-checked at schedule time (not just when picked) so a lapsed subscription
// silently stops attaching it rather than erroring. Suppressed in discreet
// mode — showing a F/O's photo on the lock screen would defeat the whole
// point of hiding who the notification is from.
function getNotificationAttachments(photoUri?: string): Notifications.NotificationContentInput['attachments'] {
  if (!photoUri || Platform.OS !== 'ios' || !getPremium() || getDiscreetMode()) return undefined;
  return [{ identifier: 'notif-avatar', url: photoUri, type: null }];
}

export async function scheduleDailyNotification(
  body: string,
  hour: number,
  foName: string,
  isImmediate = false,
  minute = 0,
  photoUri = '',
): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    const discreet = getDiscreetMode();
    const trigger: Notifications.NotificationTriggerInput = isImmediate
      ? {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: discreet ? '♡' : (foName || 'F/O'),
        body: discreet ? 'a message for you~' : body,
        attachments: getNotificationAttachments(photoUri),
      },
      trigger,
    });

    return identifier;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

export async function cancelNotification(notifId: string): Promise<void> {
  if (!notifId) return;
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

    const discreet = getDiscreetMode();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: discreet ? '♡' : 'a special day',
        body: discreet ? 'a reminder for you~' : `${title} is today ♡`,
        attachments: getNotificationAttachments(),
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

