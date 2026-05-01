import type { JSX } from "react";
import { Tooltip } from "./Tooltip.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 64, display: "flex", justifyContent: "center" }}>
    <Tooltip content="Adicionar nova transação">
      <Button iconLeading="plus">Novo</Button>
    </Tooltip>
  </div>
);
