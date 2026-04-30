import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState.js";

describe("<EmptyState>", () => {
  it("renders the title", () => {
    render(<EmptyState title="Sem dados" />);
    expect(
      screen.getByRole("heading", { name: "Sem dados" }),
    ).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<EmptyState title="x" description="Importe um extrato." />);
    expect(screen.getByText("Importe um extrato.")).toBeInTheDocument();
  });

  it("renders an icon when iconName is provided", () => {
    const { container } = render(<EmptyState title="x" iconName="filter" />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("renders the action slot", () => {
    render(
      <EmptyState
        title="x"
        action={<button type="button">Importar</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Importar" }),
    ).toBeInTheDocument();
  });

  it("forwards refs to the wrapper", () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} title="x" />);
    expect(ref.current?.tagName).toBe("DIV");
  });
});
