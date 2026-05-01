import { useState, type JSX } from "react";
import { Radio } from "./Radio.js";

export const Default = (): JSX.Element => {
  const [value, setValue] = useState("monthly");
  return (
    <div style={{ padding: 16 }}>
      <Radio
        value={value}
        onValueChange={setValue}
        options={[
          { value: "monthly", label: "Mensal" },
          { value: "yearly", label: "Anual" },
        ]}
      />
    </div>
  );
};
