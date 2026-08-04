import { Platform } from 'react-native';

import AvatarNotifications from './src/AvatarNotificationsModule';

export type AvatarNotificationInput = {
  /** shown next to the avatar — the F/O's name */
  senderName: string;
  body: string;
  /** local file uri (file://…) or absolute path; omit to fall back to a plain notification */
  avatarUri?: string;
  /** seconds from now to fire */
  seconds: number;
  /** groups repeat messages from the same F/O into one conversation thread */
  conversationId: string;
};

/**
 * True when this OS can render the sender's avatar *in place of* the app icon:
 * iOS 15+ Communication Notifications, or Android 9+ MessagingStyle.
 * Older versions fall back to a normal notification — the avatar is dropped,
 * nothing breaks.
 */
export function isAvatarNotificationSupported(): boolean {
  if (!AvatarNotifications?.isSupported) return false;
  try {
    return AvatarNotifications.isSupported();
  } catch {
    return false;
  }
}

/**
 * Schedules a notification whose icon is the sender's avatar. Resolves to the
 * native identifier, or null if it couldn't be scheduled — callers should fall
 * back to expo-notifications rather than treating null as fatal.
 *
 * Note this deliberately only supports a seconds-from-now trigger: the whole
 * point is the avatar, and both platforms want the intent donated close to the
 * delivery, so calendar/repeating schedules stay on expo-notifications.
 */
export async function scheduleAvatarNotification(
  input: AvatarNotificationInput,
): Promise<string | null> {
  if (!AvatarNotifications || !isAvatarNotificationSupported()) return null;
  try {
    return await AvatarNotifications.scheduleAsync(
      input.senderName,
      input.body,
      input.avatarUri ?? '',
      Math.max(1, Math.round(input.seconds)),
      input.conversationId,
    );
  } catch {
    return null;
  }
}

export async function cancelAvatarNotification(id: string): Promise<void> {
  if (!id || !AvatarNotifications?.cancelAsync) return;
  try {
    await AvatarNotifications.cancelAsync(id);
  } catch {
    // already delivered or cancelled
  }
}

export const AVATAR_NOTIFICATIONS_PLATFORM = Platform.OS;
