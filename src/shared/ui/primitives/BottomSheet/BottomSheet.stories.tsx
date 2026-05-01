import { useState, type JSX } from "react";
import { BottomSheet } from "./BottomSheet.js";
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
        Abrir bottom sheet
      </Button>
      <BottomSheet open={open} onOpenChange={setOpen} title="Nova transação">
        <div style={{ padding: 16 }}>Formulário aqui.</div>
      </BottomSheet>
    </div>
  );
};
