import type { JSX } from "react";
import { Tabs } from "./Tabs.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 480 }}>
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Visão geral</Tabs.Trigger>
        <Tabs.Trigger value="transactions">Transações</Tabs.Trigger>
        <Tabs.Trigger value="budgets">Orçamentos</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">Visão geral do mês.</Tabs.Content>
      <Tabs.Content value="transactions">Lista de transações.</Tabs.Content>
      <Tabs.Content value="budgets">
        Acompanhamento de orçamentos.
      </Tabs.Content>
    </Tabs.Root>
  </div>
);
