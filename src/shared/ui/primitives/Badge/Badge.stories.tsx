import type { JSX } from "react";
import { Badge } from "./Badge.js";

export const Default = (): JSX.Element => (
  <div
    style={{ display: "flex", gap: 8, padding: 16, alignItems: "center" }}
  >
    <Badge tone="neutral">Pendente</Badge>
    <Badge tone="gain">Pago</Badge>
    <Badge tone="loss">Atrasado</Badge>
    <Badge tone="warn">Aviso</Badge>
    <Badge tone="info">Info</Badge>
    <Badge tone="gain" iconLeading="arrowUp">+12,4%</Badge>
  </div>
);
