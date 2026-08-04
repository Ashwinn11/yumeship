import { requireOptionalNativeModule } from 'expo';

/**
 * Optional on purpose: the native side only exists in a fresh dev/production
 * build. In Expo Go, or on a binary built before this module landed, the
 * require returns null and every call site falls back to expo-notifications.
 */
export type AvatarNotificationsNativeModule = {
  isSupported(): boolean;
  scheduleAsync(
    senderName: string,
    body: string,
    avatarUri: string,
    seconds: number,
    conversationId: string,
  ): Promise<string | null>;
  cancelAsync(id: string): Promise<void>;
};

export default requireOptionalNativeModule<AvatarNotificationsNativeModule>(
  'AvatarNotifications',
);
