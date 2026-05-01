import type { JSX } from "react";
import { Money } from "./Money.js";

export const Default = (): JSX.Element => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: 16,
      fontSize: 16,
    }}
  >
    <div>
      <Money amount={12483.9} />
    </div>
    <div>
      <Money amount={-480} />
    </div>
    <div>
      <Money amount={1234.5} sign="always" />
    </div>
    <div>
      <Money amount={null} />
    </div>
    <div style={{ fontSize: 32 }}>
      <Money amount={42000} display sign="never" />
    </div>
  </div>
);
