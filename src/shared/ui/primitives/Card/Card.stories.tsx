import type { JSX } from "react";
import { Card } from "./Card.js";
import { Money } from "../Money/Money.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <Card title="Saldo" action={<Button variant="ghost" size="sm">Ver</Button>}>
      <Money amount={12483.9} display />
    </Card>
  </div>
);
