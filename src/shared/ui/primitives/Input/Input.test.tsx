import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input.js";

describe("<Input>", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("applies the %s size class", (size) => {
    render(<Input aria-label="x" size={size} />);
    expect(screen.getByLabelText("x")).toHaveClass(`fw-input-${size}`);
  });

  it("forwards refs to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("renders leading and trailing icons", () => {
    const { container } = render(
      <Input aria-label="x" iconLeading="search" iconTrailing="close" />,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("forwards onChange events as users type", () => {
    const onChange = vi.fn();
    render(<Input aria-label="x" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("x"), { target: { value: "hi" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders the error message and wires aria-invalid + aria-describedby", () => {
    render(<Input aria-label="x" error="Required" />);
    const input = screen.getByLabelText("x");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const errorEl = screen.getByText("Required");
    expect(errorEl).toHaveAttribute("role", "alert");
    expect(input.getAttribute("aria-describedby")).toBe(errorEl.id);
  });

  it("does not set aria-invalid when error is absent", () => {
    render(<Input aria-label="x" />);
    expect(screen.getByLabelText("x")).not.toHaveAttribute("aria-invalid");
  });
});
