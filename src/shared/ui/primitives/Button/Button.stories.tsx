import type { JSX } from "react";
import { Button } from "./Button.js";

export const Default = (): JSX.Element => (
  <div
    style={{
      display: "flex",
      gap: 12,
      padding: 16,
      alignItems: "center",
      flexWrap: "wrap",
    }}
  >
    <Button>Salvar</Button>
    <Button variant="secondary">Cancelar</Button>
    <Button variant="ghost">Detalhes</Button>
    <Button variant="danger">Excluir</Button>
    <Button loading>Carregando</Button>
    <Button iconLeading="plus">Adicionar</Button>
    <Button size="sm">Pequeno</Button>
    <Button size="lg">Grande</Button>
  </div>
);
