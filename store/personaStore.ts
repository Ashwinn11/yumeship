import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PersonaStore = {
  activePersonaId: string | null;
  setActivePersona: (id: string) => void;
  clearActivePersona: () => void;
};

export const usePersonaStore = create<PersonaStore>()(
  persist(
    (set) => ({
      activePersonaId: null,
      setActivePersona: (id) => set({ activePersonaId: id }),
      clearActivePersona: () => set({ activePersonaId: null }),
    }),
    {
      name: 'persona-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
