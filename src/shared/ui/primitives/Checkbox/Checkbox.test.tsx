import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox.js";

describe("<Checkbox>", () => {
  it("renders an unchecked checkbox by default", () => {
    render(<Checkbox aria-label="x" />);
    expect(screen.getByRole("checkbox", { name: "x" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("renders the label and associates it", () => {
    render(<Checkbox label="Accept" />);
    expect(screen.getByLabelText("Accept")).toBeInTheDocument();
  });

  it("toggles aria-checked and calls onCheckedChange when clicked", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox aria-label="x" onCheckedChange={onCheckedChange} />,
    );
    const cb = screen.getByRole("checkbox", { name: "x" });
    fireEvent.click(cb);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(cb).toHaveAttribute("aria-checked", "true");
  });

  it("respects controlled checked state", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox aria-label="x" checked onCheckedChange={onCheckedChange} />,
    );
    expect(screen.getByRole("checkbox", { name: "x" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("renders the indeterminate indicator", () => {
    render(<Checkbox aria-label="x" defaultChecked="indeterminate" />);
    expect(screen.getByRole("checkbox", { name: "x" })).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
  });

  it("forwards refs to the underlying button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} aria-label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders the error message and wires aria-invalid", () => {
    render(<Checkbox aria-label="x" error="Required" />);
    const cb = screen.getByRole("checkbox", { name: "x" });
    expect(cb).toHaveAttribute("aria-invalid", "true");
    const err = screen.getByText("Required");
    expect(err).toHaveAttribute("role", "alert");
    expect(cb.getAttribute("aria-describedby")).toBe(err.id);
  });

  it("disables when disabled is set", () => {
    render(<Checkbox aria-label="x" disabled />);
    expect(screen.getByRole("checkbox", { name: "x" })).toBeDisabled();
  });
});
