import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Select } from "./Select.js";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("<Select>", () => {
  it("renders the trigger with the placeholder when no value is set", () => {
    render(
      <Select aria-label="x" options={options} placeholder="Choose" />,
    );
    expect(screen.getByRole("combobox", { name: "x" })).toHaveTextContent(
      "Choose",
    );
  });

  it("renders the controlled value text", () => {
    render(
      <Select aria-label="x" options={options} value="b" onValueChange={() => undefined} />,
    );
    expect(screen.getByRole("combobox", { name: "x" })).toHaveTextContent(
      "Beta",
    );
  });

  it.each(["sm", "md", "lg"] as const)("applies the %s size class", (size) => {
    render(<Select aria-label="x" options={options} size={size} />);
    expect(screen.getByRole("combobox", { name: "x" })).toHaveClass(
      `fw-select-${size}`,
    );
  });

  it("forwards refs to the trigger", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Select ref={ref} aria-label="x" options={options} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders the error message and wires aria-invalid", () => {
    render(
      <Select aria-label="x" options={options} error="Required" />,
    );
    const trigger = screen.getByRole("combobox", { name: "x" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    const err = screen.getByText("Required");
    expect(err).toHaveAttribute("role", "alert");
    expect(trigger.getAttribute("aria-describedby")).toBe(err.id);
  });

  it("disables the trigger when disabled is set", () => {
    render(<Select aria-label="x" options={options} disabled />);
    expect(screen.getByRole("combobox", { name: "x" })).toBeDisabled();
  });
});
