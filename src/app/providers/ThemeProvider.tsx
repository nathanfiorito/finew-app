import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  override: Theme | null;
  setTheme: (theme: Theme) => void;
  clearOverride: () => void;
}

const STORAGE_KEY = "finew:theme";

function readSystemPref(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredOverride(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function safeWrite(value: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* noop */
  }
}

function safeClear(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  override: null,
  setTheme: (theme) => {
    safeWrite(theme);
    set({ theme, override: theme });
  },
  clearOverride: () => {
    safeClear();
    set({ theme: readSystemPref(), override: null });
  },
}));

export function useTheme(): {
  theme: Theme;
  setTheme: (t: Theme) => void;
  clearOverride: () => void;
} {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const clearOverride = useThemeStore((s) => s.clearOverride);
  return { theme, setTheme, clearOverride };
}

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const theme = useThemeStore((s) => s.theme);
  const override = useThemeStore((s) => s.override);

  useEffect(() => {
    const storedOverride = readStoredOverride();
    const initialTheme = storedOverride ?? readSystemPref();
    useThemeStore.setState({ theme: initialTheme, override: storedOverride });
  }, []);

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);

  useEffect(() => {
    if (override !== null) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent): void => {
      useThemeStore.setState({ theme: e.matches ? "dark" : "light" });
    };
    mql.addEventListener("change", handler);
    return () => {
      mql.removeEventListener("change", handler);
    };
  }, [override]);

  return <>{children}</>;
}
