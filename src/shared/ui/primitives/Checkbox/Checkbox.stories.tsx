import { useState, type JSX } from "react";
import { Checkbox, type CheckedState } from "./Checkbox.js";

export const Default = (): JSX.Element => {
  const [checked, setChecked] = useState<CheckedState>(false);
  return (
    <div style={{ padding: 16 }}>
      <Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        label="Aceito os termos"
      />
    </div>
  );
};
