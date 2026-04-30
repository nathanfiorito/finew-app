import type { ReactNode } from "react";
import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, useTheme, useThemeStore } from "./ThemeProvider.js";

const STORAGE_KEY = "finew:theme";

function setSystemPref(pref: "light" | "dark"): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: pref === "dark" && query.includes("dark"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  localStorage.clear();
});

describe("ThemeProvider", () => {
  it("applies system pref when no override is stored", () => {
    setSystemPref("dark");
    useThemeStore.setState({ theme: "dark", override: null });
    render(
      <ThemeProvider>
        <span>x</span>
      </ThemeProvider>,
    );
    expect(document.documentElement.dataset["theme"]).toBe("dark");
  });

  it("applies stored override over system pref", () => {
    setSystemPref("dark");
    useThemeStore.setState({ theme: "light", override: "light" });
    localStorage.setItem(STORAGE_KEY, "light");
    render(
      <ThemeProvider>
        <span>x</span>
      </ThemeProvider>,
    );
    expect(document.documentElement.dataset["theme"]).toBe("light");
  });

  it("setTheme persists to localStorage and updates the dataset", () => {
    setSystemPref("light");
    useThemeStore.setState({ theme: "light", override: null });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(document.documentElement.dataset["theme"]).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
    expect(result.current.theme).toBe("dark");
  });
});
