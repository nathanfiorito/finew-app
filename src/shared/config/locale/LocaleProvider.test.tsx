import type { ReactNode } from "react";
import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  LocaleProvider,
  useLocale,
  useLocaleStore,
} from "./LocaleProvider.js";

const STORAGE_KEY = "finew:locale";

beforeEach(() => {
  localStorage.clear();
  useLocaleStore.setState({ locale: "pt-BR" });
});

afterEach(() => {
  localStorage.clear();
});

describe("LocaleProvider", () => {
  it("defaults to pt-BR when nothing is stored", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      ),
    });
    expect(result.current.locale).toBe("pt-BR");
  });

  it("applies stored value", () => {
    localStorage.setItem(STORAGE_KEY, "en-US");
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      ),
    });
    expect(result.current.locale).toBe("en-US");
  });

  it("setLocale persists and updates the hook value", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      ),
    });
    act(() => {
      result.current.setLocale("en-US");
    });
    expect(result.current.locale).toBe("en-US");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en-US");
  });

  it("renders children", () => {
    const { container } = render(
      <LocaleProvider>
        <span>x</span>
      </LocaleProvider>,
    );
    expect(container.textContent).toBe("x");
  });
});
