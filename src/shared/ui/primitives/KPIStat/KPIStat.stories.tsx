import type { JSX } from "react";
import { KPIStat } from "./KPIStat.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <KPIStat
      label="Saldo · abril"
      value={12483.9}
      delta={2.4}
      deltaLabel="vs. mês anterior"
      sparkline={[10, 11, 12, 13, 12, 14, 12.5]}
      sparkTone="gain"
    />
  </div>
);
