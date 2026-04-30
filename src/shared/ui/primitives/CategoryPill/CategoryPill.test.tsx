import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryPill } from "./CategoryPill.js";

describe("<CategoryPill>", () => {
  it("renders the label", () => {
    render(<CategoryPill label="Mercado" />);
    expect(screen.getByText("Mercado")).toBeInTheDocument();
  });

  it("applies the color to the dot via inline style", () => {
    const { container } = render(
      <CategoryPill label="x" color="var(--series-3)" />,
    );
    const dot = container.querySelector(".fw-pill-dot") as HTMLElement;
    expect(dot.style.background).toBe("var(--series-3)");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<CategoryPill ref={ref} label="x" />);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
