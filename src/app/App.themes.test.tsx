import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { App } from "./App.js";
import { useThemeStore } from "./providers/ThemeProvider.js";
import { useDensityStore } from "./providers/DensityProvider.js";

const STORAGE_KEYS = ["finew:theme", "finew:density"];

const COMBOS: Array<{ theme: "light" | "dark"; density: "comfortable" | "compact" }> = [
  { theme: "light", density: "comfortable" },
  { theme: "light", density: "compact" },
  { theme: "dark", density: "comfortable" },
  { theme: "dark", density: "compact" },
];

beforeEach(() => {
  STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  useThemeStore.setState({ theme: "light", override: null });
  useDensityStore.setState({ density: "comfortable" });
});

afterEach(() => {
  STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
});

describe("App theme/density combinations", () => {
  it.each(COMBOS)(
    "renders cleanly with theme=$theme density=$density",
    ({ theme, density }) => {
      localStorage.setItem("finew:theme", theme);
      localStorage.setItem("finew:density", density);

      const errors: unknown[][] = [];
      const restore = console.error;
      console.error = (...args: unknown[]): void => {
        errors.push(args);
      };

      try {
        render(<App />);
      } finally {
        console.error = restore;
      }

      expect(document.documentElement.dataset["theme"]).toBe(theme);
      expect(document.documentElement.dataset["density"]).toBe(density);
      expect(errors).toEqual([]);
    },
  );
});
