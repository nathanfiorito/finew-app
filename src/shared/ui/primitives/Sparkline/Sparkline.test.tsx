import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sparkline } from "./Sparkline.js";

describe("<Sparkline>", () => {
  it("renders an svg with the path for multiple values", () => {
    const { container } = render(<Sparkline values={[1, 2, 3, 4]} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelectorAll("path").length).toBeGreaterThanOrEqual(1);
  });

  it("renders nothing for an empty values array", () => {
    const { container } = render(<Sparkline values={[]} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders a horizontal line for a single value", () => {
    const { container } = render(<Sparkline values={[5]} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelector("line")).not.toBeNull();
  });

  it.each(["gain", "loss", "neutral"] as const)(
    "applies the %s tone via stroke",
    (tone) => {
      const { container } = render(
        <Sparkline values={[1, 2, 3]} tone={tone} />,
      );
      const path = container.querySelector("path[stroke]");
      expect(path?.getAttribute("stroke")).toContain(
        tone === "gain" ? "--gain" : tone === "loss" ? "--loss" : "--accent",
      );
    },
  );

  it("uses an explicit color over the tone", () => {
    const { container } = render(
      <Sparkline values={[1, 2, 3]} tone="gain" color="#123456" />,
    );
    const path = container.querySelector("path[stroke]");
    expect(path?.getAttribute("stroke")).toBe("#123456");
  });

  it("forwards refs to the svg", () => {
    const ref = createRef<SVGSVGElement>();
    render(<Sparkline ref={ref} values={[1, 2, 3]} />);
    expect(ref.current?.tagName.toLowerCase()).toBe("svg");
  });
});
