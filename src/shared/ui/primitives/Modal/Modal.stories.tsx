import { useState, type JSX } from "react";
import { Modal } from "./Modal.js";
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
        Abrir modal
      </Button>
      <Modal open={open} onOpenChange={setOpen} title="Excluir transação?">
        Esta ação não pode ser desfeita.
      </Modal>
    </div>
  );
};
