import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(__dirname, "typography.css"), "utf8");

const CLASSES = [
  "t-display",
  "t-h1",
  "t-h2",
  "t-h3",
  "t-h4",
  "t-body",
  "t-body-strong",
  "t-body-sm",
  "t-caption",
  "t-micro",
  "t-money",
  "t-money-display",
] as const;

describe("typography.css contract", () => {
  it.each(CLASSES)("declares .%s with a font-family", (cls) => {
    const re = new RegExp(`\\.${cls}\\s*\\{[^}]*font-family\\s*:`);
    expect(re.test(css)).toBe(true);
  });
});
