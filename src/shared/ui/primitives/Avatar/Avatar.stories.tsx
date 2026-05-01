import type { JSX } from "react";
import { Avatar } from "./Avatar.js";

export const Default = (): JSX.Element => (
  <div
    style={{ display: "flex", gap: 12, padding: 16, alignItems: "center" }}
  >
    <Avatar initials="NF" size="sm" />
    <Avatar initials="NF" size="md" />
    <Avatar initials="NF" size="lg" />
  </div>
);
