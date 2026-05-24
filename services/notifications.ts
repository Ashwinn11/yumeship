import * as Notifications from 'expo-notifications';
import { Anniversary } from '@/db/schema';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAnniversary(anniversary: Anniversary): Promise<string | null> {
  if (!anniversary.notificationEnabled || !anniversary.date) return null;

  const date = new Date(anniversary.date);
  const trigger: Notifications.CalendarTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: 9,
    minute: 0,
    repeats: anniversary.repeatYearly,
  };

  return Notifications.scheduleNotificationAsync({
    content: {
      // Discreet text — does not reveal app purpose on lock screen
      title: 'journal',
      body: 'don\'t forget to write today.',
    },
    trigger,
  });
}

export async function cancelAnniversary(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
