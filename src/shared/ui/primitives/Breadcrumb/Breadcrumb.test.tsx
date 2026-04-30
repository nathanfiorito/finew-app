import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumb } from "./Breadcrumb.js";

describe("<Breadcrumb>", () => {
  const items = [
    { label: "Início", href: "/" },
    { label: "Contas", href: "/contas" },
    { label: "Detalhes" },
  ];

  it("renders a nav with aria-label", () => {
    render(<Breadcrumb items={items} />);
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  });

  it("renders intermediate items as links", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the last item as plain text with aria-current", () => {
    render(<Breadcrumb items={items} />);
    const last = screen.getByText("Detalhes");
    expect(last).toHaveAttribute("aria-current", "page");
    expect(last.tagName).toBe("SPAN");
  });

  it("renders the custom separator between items", () => {
    const { container } = render(<Breadcrumb items={items} separator="›" />);
    expect(container.textContent).toContain("›");
  });

  it("forwards refs to the nav", () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} items={items} />);
    expect(ref.current?.tagName).toBe("NAV");
  });
});
