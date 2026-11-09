import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Check initial state from localStorage
  const savedMode = localStorage.getItem('isDarkMode');
  const initialMode = savedMode === 'true';

  // Apply initial state side effect
  if (typeof window !== 'undefined') {
    if (initialMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    isDarkMode: initialMode,
    toggleDarkMode: () => set((state) => {
      const nextMode = !state.isDarkMode;
      localStorage.setItem('isDarkMode', String(nextMode));
      if (typeof window !== 'undefined') {
        if (nextMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDarkMode: nextMode };
    }),
    setDarkMode: (value: boolean) => {
      localStorage.setItem('isDarkMode', String(value));
      if (typeof window !== 'undefined') {
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      set({ isDarkMode: value });
    },
  };
});
