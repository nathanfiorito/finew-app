import type { JSX } from "react";
import { Icon, type IconName } from "./Icon.js";

const NAMES: IconName[] = [
  "home",
  "list",
  "pie",
  "card",
  "target",
  "search",
  "bell",
  "plus",
  "menu",
  "user",
  "arrowUp",
  "arrowDown",
  "chevronUp",
  "chevronRight",
  "chevronLeft",
  "chevronDown",
  "close",
  "filter",
  "calendar",
  "cog",
  "wallet",
];

export const Default = (): JSX.Element => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
      gap: 16,
      padding: 16,
    }}
  >
    {NAMES.map((n) => (
      <div
        key={n}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          color: "var(--fg-3)",
        }}
      >
        <Icon name={n} size={24} />
        <span>{n}</span>
      </div>
    ))}
  </div>
);
