import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import { create } from "zustand";

type Density = "comfortable" | "compact";

interface DensityState {
  density: Density;
  setDensity: (d: Density) => void;
}

const STORAGE_KEY = "finew:density";

function readStored(): Density {
  if (typeof window === "undefined") return "comfortable";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "compact" ? "compact" : "comfortable";
  } catch {
    return "comfortable";
  }
}

function safeWrite(value: Density): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* noop */
  }
}

export const useDensityStore = create<DensityState>((set) => ({
  density: "comfortable",
  setDensity: (density) => {
    safeWrite(density);
    set({ density });
  },
}));

export function useDensity(): { density: Density; setDensity: (d: Density) => void } {
  const density = useDensityStore((s) => s.density);
  const setDensity = useDensityStore((s) => s.setDensity);
  return { density, setDensity };
}

export function DensityProvider({ children }: { children: ReactNode }): JSX.Element {
  const density = useDensityStore((s) => s.density);

  useEffect(() => {
    useDensityStore.setState({ density: readStored() });
  }, []);

  useEffect(() => {
    document.documentElement.dataset["density"] = density;
  }, [density]);

  return <>{children}</>;
}
