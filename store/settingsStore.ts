import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LockTimeout = 'immediate' | '1min' | '5min';

type SettingsStore = {
  appLockEnabled: boolean;
  lockTimeout: LockTimeout;
  notificationsEnabled: boolean;
  discreetNotifications: boolean;
  onboardingComplete: boolean;
  setAppLockEnabled: (v: boolean) => void;
  setLockTimeout: (v: LockTimeout) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setDiscreetNotifications: (v: boolean) => void;
  setOnboardingComplete: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      appLockEnabled: false,
      lockTimeout: '1min',
      notificationsEnabled: false,
      discreetNotifications: true,
      onboardingComplete: false,
      setAppLockEnabled: (v) => set({ appLockEnabled: v }),
      setLockTimeout: (v) => set({ lockTimeout: v }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setDiscreetNotifications: (v) => set({ discreetNotifications: v }),
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
