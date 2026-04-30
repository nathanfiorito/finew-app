import type { ReactNode } from "react";
import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DensityProvider, useDensity, useDensityStore } from "./DensityProvider.js";

const STORAGE_KEY = "finew:density";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-density");
  useDensityStore.setState({ density: "comfortable" });
});

afterEach(() => {
  localStorage.clear();
});

describe("DensityProvider", () => {
  it("defaults to comfortable when nothing is stored", () => {
    render(
      <DensityProvider>
        <span>x</span>
      </DensityProvider>,
    );
    expect(document.documentElement.dataset["density"]).toBe("comfortable");
  });

  it("applies stored value", () => {
    localStorage.setItem(STORAGE_KEY, "compact");
    render(
      <DensityProvider>
        <span>x</span>
      </DensityProvider>,
    );
    expect(document.documentElement.dataset["density"]).toBe("compact");
  });

  it("setDensity persists and updates dataset", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider>{children}</DensityProvider>
    );
    const { result } = renderHook(() => useDensity(), { wrapper });

    act(() => {
      result.current.setDensity("compact");
    });

    expect(document.documentElement.dataset["density"]).toBe("compact");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("compact");
    expect(result.current.density).toBe("compact");
  });
});
