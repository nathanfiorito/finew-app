import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button.js";

describe("<Button>", () => {
  it("renders a button element with the label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it.each(["primary", "secondary", "ghost", "danger"] as const)(
    "applies the %s variant class",
    (variant) => {
      render(<Button variant={variant}>x</Button>);
      expect(screen.getByRole("button")).toHaveClass(`fw-btn-${variant}`);
    },
  );

  it.each(["sm", "md", "lg"] as const)("applies the %s size class", (size) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole("button")).toHaveClass(`fw-btn-${size}`);
  });

  it("forwards refs to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>x</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders a leading icon when iconLeading is provided", () => {
    const { container } = render(<Button iconLeading="plus">Add</Button>);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("renders both icons when both slots are filled", () => {
    const { container } = render(
      <Button iconLeading="plus" iconTrailing="chevronRight">
        Next
      </Button>,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("disables and aria-busies when loading", () => {
    render(<Button loading>x</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("forwards onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    screen.getByRole("button").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        x
      </Button>,
    );
    screen.getByRole("button").click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
