import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge.js";

describe("<Badge>", () => {
  it("renders children", () => {
    render(<Badge>Pago</Badge>);
    expect(screen.getByText("Pago")).toBeInTheDocument();
  });

  it.each(["neutral", "warn", "gain", "loss", "info"] as const)(
    "applies the %s tone",
    (tone) => {
      const { container } = render(<Badge tone={tone}>x</Badge>);
      expect(container.firstElementChild).toHaveClass(`fw-badge-${tone}`);
    },
  );

  it("renders an icon when iconLeading is provided", () => {
    const { container } = render(<Badge iconLeading="bell">Aviso</Badge>);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
