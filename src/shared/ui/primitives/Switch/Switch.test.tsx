import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch.js";

describe("<Switch>", () => {
  it("renders an unchecked switch by default", () => {
    render(<Switch aria-label="x" />);
    expect(screen.getByRole("switch", { name: "x" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("renders the label and associates it", () => {
    render(<Switch label="Notifications" />);
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("toggles aria-checked and calls onCheckedChange when clicked", () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="x" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "x" });
    fireEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("respects controlled checked state", () => {
    render(<Switch aria-label="x" checked onCheckedChange={() => undefined} />);
    expect(screen.getByRole("switch", { name: "x" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("forwards refs to the underlying button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch ref={ref} aria-label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders the error message and wires aria-invalid", () => {
    render(<Switch aria-label="x" error="Required" />);
    const sw = screen.getByRole("switch", { name: "x" });
    expect(sw).toHaveAttribute("aria-invalid", "true");
    const err = screen.getByText("Required");
    expect(err).toHaveAttribute("role", "alert");
    expect(sw.getAttribute("aria-describedby")).toBe(err.id);
  });

  it("disables when disabled is set", () => {
    render(<Switch aria-label="x" disabled />);
    expect(screen.getByRole("switch", { name: "x" })).toBeDisabled();
  });
});
