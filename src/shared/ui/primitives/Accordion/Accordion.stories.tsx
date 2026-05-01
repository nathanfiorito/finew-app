import type { JSX } from "react";
import { Accordion } from "./Accordion.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 480 }}>
    <Accordion.Root type="single" collapsible>
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Quanto rendeu este mês?</Accordion.Trigger>
        <Accordion.Content>
          + R$ 248,00 em juros e dividendos.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Quais foram os maiores gastos?</Accordion.Trigger>
        <Accordion.Content>
          Mercado, transporte e assinaturas.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  </div>
);
