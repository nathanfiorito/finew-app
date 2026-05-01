import type { JSX } from "react";
import { Button } from "../Button/Button.js";
import { Toaster, toast } from "./Toast.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, display: "flex", gap: 8 }}>
    <Button
      onClick={() => {
        toast.success("Lançamento salvo");
      }}
    >
      Sucesso
    </Button>
    <Button
      variant="danger"
      onClick={() => {
        toast.error("Saldo insuficiente para concluir o lançamento.");
      }}
    >
      Erro
    </Button>
    <Toaster />
  </div>
);
