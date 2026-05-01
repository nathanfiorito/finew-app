import type { JSX } from "react";
import { Popover } from "./Popover.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 64, display: "flex", justifyContent: "center" }}>
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary">Filtros</Button>
      </Popover.Trigger>
      <Popover.Content>
        <div style={{ padding: 12, minWidth: 200 }}>
          Conteúdo do popover.
        </div>
      </Popover.Content>
    </Popover.Root>
  </div>
);
