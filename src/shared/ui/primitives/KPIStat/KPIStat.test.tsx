import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { KPIStat } from "./KPIStat.js";
import { useLocaleStore } from "../../../config/locale/index.js";

beforeEach(() => {
  useLocaleStore.setState({ locale: "pt-BR" });
});

afterEach(() => {
  useLocaleStore.setState({ locale: "pt-BR" });
});

describe("<KPIStat>", () => {
  it("renders the label and value", () => {
    const { container } = render(<KPIStat label="Saldo" value={12483.9} />);
    expect(screen.getByText("Saldo")).toBeInTheDocument();
    expect(container.textContent).toContain("12.483,90");
  });

  it("renders a positive delta with verbal aria-label (pt-BR)", () => {
    const { container } = render(
      <KPIStat label="x" value={1} delta={2.4} deltaLabel="vs. mês anterior" />,
    );
    const delta = container.querySelector(".fw-kpi-delta");
    expect(delta?.getAttribute("aria-label")).toContain("alta de 2,4 por cento");
    expect(delta?.getAttribute("aria-label")).toContain("vs. mês anterior");
  });

  it("renders a negative delta as 'baixa' in pt-BR", () => {
    const { container } = render(<KPIStat label="x" value={1} delta={-1.2} />);
    const delta = container.querySelector(".fw-kpi-delta");
    expect(delta?.getAttribute("aria-label")).toContain("baixa de 1,2 por cento");
  });

  it("renders an English aria-label under en-US", () => {
    useLocaleStore.setState({ locale: "en-US" });
    const { container } = render(
      <KPIStat label="x" value={1} delta={2.4} deltaLabel="vs. last month" />,
    );
    const delta = container.querySelector(".fw-kpi-delta");
    expect(delta?.getAttribute("aria-label")).toContain("up 2.4 percent");
    expect(delta?.getAttribute("aria-label")).toContain("vs. last month");
  });

  it("renders an inline sparkline when sparkline prop is set", () => {
    const { container } = render(
      <KPIStat label="x" value={1} sparkline={[1, 2, 3]} />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("forwards refs to the wrapper", () => {
    const ref = createRef<HTMLDivElement>();
    render(<KPIStat ref={ref} label="x" value={1} />);
    expect(ref.current?.tagName).toBe("DIV");
  });
});
