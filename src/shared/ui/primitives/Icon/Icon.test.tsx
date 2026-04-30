import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./Icon.js";

describe("<Icon>", () => {
  it("renders the named lucide icon as an SVG", () => {
    const { container } = render(<Icon name="home" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("applies strokeWidth=1.75 by default", () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("stroke-width")).toBe("1.75");
  });

  it("respects an explicit strokeWidth override", () => {
    const { container } = render(<Icon name="plus" strokeWidth={2.25} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("stroke-width")).toBe("2.25");
  });

  it("forwards size to width and height", () => {
    const { container } = render(<Icon name="bell" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
  });
});
