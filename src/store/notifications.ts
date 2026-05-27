import * as Notifications from 'expo-notifications';
import { getGlobalSetting, saveGlobalSetting } from './onboarding';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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
): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    const discreet = getDiscreetMode();
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: discreet ? '♡' : (foName || 'F/O'),
        body: discreet ? 'a message for you~' : body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
    return identifier;
  } catch {
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
