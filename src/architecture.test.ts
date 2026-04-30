import { describe, expect, it } from "vitest";
import { cruise } from "dependency-cruiser";
import type { ICruiseResult } from "dependency-cruiser";

const allowedFromTo: Record<string, readonly string[]> = {
  app: ["app", "pages", "widgets", "features", "entities", "shared"],
  pages: ["pages", "widgets", "features", "entities", "shared"],
  widgets: ["widgets", "features", "entities", "shared"],
  features: ["features", "entities", "shared"],
  entities: ["entities", "shared"],
  shared: ["shared"],
};

const layerOf = (modulePath: string): string | null => {
  const match = /^src\/(app|pages|widgets|features|entities|shared)\b/.exec(modulePath);
  return match ? (match[1] ?? null) : null;
};

describe("Architecture boundaries", (): void => {
  it("respects FSD layer dependencies and has no cycles", async (): Promise<void> => {
    const result = await cruise(
      ["src"],
      { tsConfig: { fileName: "tsconfig.json" }, tsPreCompilationDeps: true },
    );

    const output: ICruiseResult =
      typeof result.output === "string"
        ? (JSON.parse(result.output) as ICruiseResult)
        : result.output;

    const violations: string[] = [];

    for (const mod of output.modules) {
      const fromLayer = layerOf(mod.source);
      if (fromLayer === null) continue;

      // Forbid sibling-slice imports inside features (feature → other feature).
      if (fromLayer === "features") {
        const fromSlice = mod.source.split("/").slice(0, 3).join("/"); // src/features/<slice>
        for (const dep of mod.dependencies) {
          if (dep.module.startsWith("src/features/")) {
            const toSlice = dep.resolved.split("/").slice(0, 3).join("/");
            if (toSlice !== fromSlice) {
              violations.push(
                `feature→feature: ${mod.source} imports ${dep.resolved} (sibling slice ${toSlice})`,
              );
            }
          }
        }
      }

      for (const dep of mod.dependencies) {
        const toLayer = layerOf(dep.resolved);
        if (toLayer === null) continue;
        const allowed = allowedFromTo[fromLayer] ?? [];
        if (!allowed.includes(toLayer)) {
          violations.push(`layer: ${mod.source} (${fromLayer}) → ${dep.resolved} (${toLayer}) is forbidden`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
