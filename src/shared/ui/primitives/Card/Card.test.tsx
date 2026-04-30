import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card.js";

describe("<Card>", () => {
  it("renders the children", () => {
    render(<Card>body</Card>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders the title in a header when provided", () => {
    render(<Card title="Saldo">body</Card>);
    expect(screen.getByRole("heading", { name: "Saldo" })).toBeInTheDocument();
  });

  it("renders an action slot in the header", () => {
    render(
      <Card title="Saldo" action={<button type="button">Ver</button>}>
        body
      </Card>,
    );
    expect(screen.getByRole("button", { name: "Ver" })).toBeInTheDocument();
  });

  it("omits the body padding when padded={false}", () => {
    const { container } = render(<Card padded={false}>body</Card>);
    expect(container.querySelector(".fw-card-body")).toBeNull();
  });

  it("forwards refs to the section element", () => {
    const ref = createRef<HTMLElement>();
    render(<Card ref={ref}>x</Card>);
    expect(ref.current?.tagName).toBe("SECTION");
  });
});
