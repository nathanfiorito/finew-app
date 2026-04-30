import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import { create } from "zustand";

export type Locale = "pt-BR" | "en-US";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const STORAGE_KEY = "finew:locale";

function readStored(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "en-US" ? "en-US" : "pt-BR";
  } catch {
    return "pt-BR";
  }
}

function safeWrite(value: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* noop */
  }
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "pt-BR",
  setLocale: (locale) => {
    safeWrite(locale);
    set({ locale });
  },
}));

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  return { locale, setLocale };
}

export function LocaleProvider({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    useLocaleStore.setState({ locale: readStored() });
  }, []);
  return <>{children}</>;
}
