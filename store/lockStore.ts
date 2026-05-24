import { create } from 'zustand';

type LockStore = {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
};

export const useLockStore = create<LockStore>()((set) => ({
  isLocked: false,
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
}));
