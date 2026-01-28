import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '@/types';

interface ThemeState {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: 'fantasy',
      setThemeName: (name) => set({ themeName: name }),
    }),
    {
      name: 'heroquest-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
