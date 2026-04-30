import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tooltip } from "./Tooltip.js";

describe("<Tooltip>", () => {
  it("renders the trigger", () => {
    render(
      <Tooltip content="Atalho">
        <button type="button">Buscar</button>
      </Tooltip>,
    );
    expect(screen.getByRole("button", { name: "Buscar" })).toBeInTheDocument();
  });

  it("does not render the tooltip content by default", () => {
    render(
      <Tooltip content="Atalho">
        <button type="button">Buscar</button>
      </Tooltip>,
    );
    expect(screen.queryByText("Atalho")).toBeNull();
  });

  it("renders the tooltip content when open prop is true", async () => {
    render(
      <Tooltip content="Atalho" open>
        <button type="button">Buscar</button>
      </Tooltip>,
    );
    await waitFor(() => {
      expect(screen.getAllByText("Atalho").length).toBeGreaterThan(0);
    });
  });
});
