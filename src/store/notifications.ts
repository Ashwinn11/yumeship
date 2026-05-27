import * as Notifications from 'expo-notifications';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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

export async function scheduleDailyNotification(
  body: string,
  hour: number,
  foName: string,
  isImmediate = false,
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
          minute: 0,
        };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: discreet ? '♡' : (foName || 'F/O'),
        body: discreet ? 'a message for you~' : body,
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
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats: true,
        month,
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

