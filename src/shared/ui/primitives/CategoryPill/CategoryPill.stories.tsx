import type { JSX } from "react";
import { CategoryPill } from "./CategoryPill.js";

export const Default = (): JSX.Element => (
  <div
    style={{ display: "flex", gap: 8, padding: 16, flexWrap: "wrap" }}
  >
    <CategoryPill label="Mercado" color="var(--series-1)" />
    <CategoryPill label="Transporte" color="var(--series-2)" />
    <CategoryPill label="Restaurantes" color="var(--series-3)" />
    <CategoryPill label="Assinaturas" color="var(--series-4)" />
    <CategoryPill label="Saúde" color="var(--series-5)" />
    <CategoryPill label="Lazer" color="var(--series-6)" />
  </div>
);
