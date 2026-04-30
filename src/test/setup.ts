import "@testing-library/jest-dom/vitest";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: storage,
});
Object.defineProperty(globalThis, "sessionStorage", {
  configurable: true,
  value: new MemoryStorage(),
});
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
  if (typeof window.matchMedia !== "function") {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query: string) => {
        const noop = (): void => undefined;
        return {
          matches: false,
          media: query,
          onchange: null,
          addEventListener: noop,
          removeEventListener: noop,
          addListener: noop,
          removeListener: noop,
          dispatchEvent: () => false,
        };
      },
    });
  }
}
