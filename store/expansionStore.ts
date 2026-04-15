import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestPack } from '@/types';

interface ExpansionStore {
  activeExpansions: QuestPack[];
  toggleExpansion: (pack: QuestPack) => void;
  isExpansionActive: (pack: QuestPack) => boolean;
}

export const useExpansionStore = create<ExpansionStore>()(
  persist(
    (set, get) => ({
      // Base game is always active
      activeExpansions: ['base'] as QuestPack[],

      toggleExpansion: (pack) => {
        if (pack === 'base') return; // Can't deactivate base game
        set((state) => {
          const isActive = state.activeExpansions.includes(pack);
          return {
            activeExpansions: isActive
              ? state.activeExpansions.filter(p => p !== pack)
              : [...state.activeExpansions, pack],
          };
        });
      },

      isExpansionActive: (pack) => {
        return get().activeExpansions.includes(pack);
      },
    }),
    {
      name: 'heroquest-expansions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
