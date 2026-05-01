import type { JSX } from "react";
import { Input } from "./Input.js";

export const Default = (): JSX.Element => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: 16,
      maxWidth: 320,
    }}
  >
    <Input name="email" placeholder="seu@email.com" />
    <Input
      name="invalid"
      placeholder="campo com erro"
      error="Formato inválido"
    />
  </div>
);
