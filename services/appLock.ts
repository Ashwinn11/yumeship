import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticate(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return true;

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return true;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock YumeShip',
    fallbackLabel: 'Use Passcode',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });

  return result.success;
}
