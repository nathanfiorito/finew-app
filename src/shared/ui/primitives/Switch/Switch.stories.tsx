import { useState, type JSX } from "react";
import { Switch } from "./Switch.js";

export const Default = (): JSX.Element => {
  const [on, setOn] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Switch
        checked={on}
        onCheckedChange={setOn}
        label="Notificações por e-mail"
      />
    </div>
  );
};
