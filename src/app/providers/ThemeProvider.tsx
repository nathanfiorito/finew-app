import type { JSX } from "react";
import { useEffect, type ReactNode } from "react";
import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
  },
}));

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return <>{children}</>;
}
