import type { JSX } from "react";
import { EmptyState } from "./EmptyState.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 480 }}>
    <EmptyState
      iconName="filter"
      title="Sem dados suficientes para o gráfico"
      description="Registre ao menos duas transações neste período para visualizar a evolução."
      action={<Button iconLeading="plus">Adicionar transação</Button>}
    />
  </div>
);
