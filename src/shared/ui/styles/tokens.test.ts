import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(__dirname, "tokens.css"), "utf8");

const REQUIRED_LIGHT = [
  "--bg",
  "--surface-0",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  "--fg-1",
  "--fg-2",
  "--fg-3",
  "--fg-4",
  "--border-1",
  "--border-2",
  "--border-strong",
  "--accent",
  "--accent-hover",
  "--accent-press",
  "--accent-soft",
  "--accent-fg",
  "--gain",
  "--gain-soft",
  "--loss",
  "--loss-soft",
  "--warn",
  "--warn-soft",
  "--info",
  "--info-soft",
  "--series-1",
  "--series-2",
  "--series-3",
  "--series-4",
  "--series-5",
  "--series-6",
  "--series-7",
  "--series-8",
  "--overlay",
  "--font-serif",
  "--font-sans",
  "--font-mono",
  "--num-tabular",
  "--num-oldstyle",
  "--t-display",
  "--t-h1",
  "--t-h2",
  "--t-h3",
  "--t-h4",
  "--t-body",
  "--t-body-sm",
  "--t-caption",
  "--t-micro",
  "--lh-tight",
  "--lh-snug",
  "--lh-normal",
  "--lh-loose",
  "--tracking-micro",
  "--tracking-tight",
  "--tracking-normal",
  "--space-0",
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-7",
  "--space-8",
  "--space-9",
  "--space-10",
  "--radius-0",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--hairline",
  "--shadow-0",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
  "--ease-standard",
  "--duration-1",
  "--duration-2",
  "--duration-3",
  "--content-max",
  "--sidebar-w",
  "--sidebar-w-collapsed",
  "--bottomtab-h",
  "--topbar-h",
];

const REQUIRED_DARK = [
  "--bg",
  "--surface-0",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  "--fg-1",
  "--fg-2",
  "--fg-3",
  "--fg-4",
  "--border-1",
  "--border-2",
  "--border-strong",
  "--accent",
  "--accent-hover",
  "--accent-press",
  "--accent-soft",
  "--accent-fg",
  "--gain",
  "--gain-soft",
  "--loss",
  "--loss-soft",
  "--warn",
  "--warn-soft",
  "--info",
  "--info-soft",
  "--series-1",
  "--series-2",
  "--series-3",
  "--series-4",
  "--series-5",
  "--series-6",
  "--series-7",
  "--series-8",
  "--overlay",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
];

const REQUIRED_DENSITY_COMPACT = [
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-7",
  "--t-display",
  "--t-h1",
  "--t-h2",
  "--t-h3",
  "--t-h4",
  "--t-body",
  "--t-body-sm",
];

function block(selector: string): string {
  const idx = css.indexOf(selector);
  if (idx === -1) throw new Error(`Selector ${selector} not found in tokens.css`);
  const open = css.indexOf("{", idx);
  if (open === -1) throw new Error(`No opening brace after ${selector}`);
  let depth = 1;
  let i = open + 1;
  while (i < css.length && depth > 0) {
    const c = css[i];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    i++;
  }
  if (depth !== 0) throw new Error(`Unbalanced braces after ${selector}`);
  return css.slice(open + 1, i - 1);
}

describe("tokens.css contract", () => {
  it("declares every required custom property in :root", () => {
    const body = block(":root");
    const missing = REQUIRED_LIGHT.filter((name) => !body.includes(`${name}:`));
    expect(missing).toEqual([]);
  });

  it('redefines theme-dependent custom properties under [data-theme="dark"]', () => {
    const body = block('[data-theme="dark"]');
    const missing = REQUIRED_DARK.filter((name) => !body.includes(`${name}:`));
    expect(missing).toEqual([]);
  });

  it("redefines compact-density spacing and type scale", () => {
    const body = block('[data-density="compact"]');
    const missing = REQUIRED_DENSITY_COMPACT.filter(
      (name) => !body.includes(`${name}:`),
    );
    expect(missing).toEqual([]);
  });
});
