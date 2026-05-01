import type { JSX } from "react";
import { Sparkline } from "./Sparkline.js";

export const Default = (): JSX.Element => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: 16,
    }}
  >
    <Sparkline values={[1, 2, 3, 5, 4, 7, 6]} tone="neutral" />
    <Sparkline values={[10, 8, 12, 14, 11, 16]} tone="gain" />
    <Sparkline values={[20, 18, 14, 12, 9, 7]} tone="loss" />
  </div>
);
