import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

describe("self-hosted fonts", () => {
  it.each([
    "public/fonts/Inter-Variable.woff2",
    "public/fonts/SourceSerif4-Variable.woff2",
    "public/fonts/SourceSerif4-Variable-Italic.woff2",
  ])("ships %s", (rel) => {
    expect(existsSync(join(repoRoot, rel))).toBe(true);
  });
});
