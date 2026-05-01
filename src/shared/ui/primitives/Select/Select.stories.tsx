import { useState, type JSX } from "react";
import { Select } from "./Select.js";

export const Default = (): JSX.Element => {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <div style={{ padding: 16, maxWidth: 320 }}>
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Selecione uma conta"
        options={[
          { value: "checking", label: "Conta corrente" },
          { value: "savings", label: "Poupança" },
          { value: "credit", label: "Cartão de crédito" },
        ]}
      />
    </div>
  );
};
