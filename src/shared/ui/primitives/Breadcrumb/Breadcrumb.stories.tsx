import type { JSX } from "react";
import { Breadcrumb } from "./Breadcrumb.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16 }}>
    <Breadcrumb
      items={[
        { label: "Início", href: "/" },
        { label: "Contas", href: "/contas" },
        { label: "Detalhes" },
      ]}
    />
  </div>
);
