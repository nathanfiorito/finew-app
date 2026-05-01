import { useState, type JSX } from "react";
import { Drawer } from "./Drawer.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Abrir drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen} title="Filtros">
        <div style={{ padding: 16 }}>Filtros laterais.</div>
      </Drawer>
    </div>
  );
};
