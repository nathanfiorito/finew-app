import { useState, type JSX } from "react";
import { Stepper } from "./Stepper.js";

export const Default = (): JSX.Element => {
  const [current, setCurrent] = useState("account");
  return (
    <div style={{ padding: 16, maxWidth: 560 }}>
      <Stepper
        current={current}
        onChange={setCurrent}
        steps={[
          { value: "account", label: "Conta" },
          { value: "details", label: "Detalhes" },
          { value: "confirm", label: "Confirmar" },
        ]}
      >
        <div style={{ paddingTop: 24, color: "var(--fg-2)" }}>
          Conteúdo do passo atual: {current}
        </div>
      </Stepper>
    </div>
  );
};
