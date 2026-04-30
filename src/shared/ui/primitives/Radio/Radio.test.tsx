import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Radio } from "./Radio.js";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("<Radio>", () => {
  it("renders one labeled radio per option", () => {
    render(<Radio aria-label="x" options={options} />);
    expect(screen.getByLabelText("Alpha")).toBeInTheDocument();
    expect(screen.getByLabelText("Beta")).toBeInTheDocument();
  });

  it("forwards refs to the group root", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Radio ref={ref} aria-label="x" options={options} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "radiogroup");
  });

  it("calls onValueChange when an option is clicked", () => {
    const onValueChange = vi.fn();
    render(
      <Radio aria-label="x" options={options} onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getByLabelText("Beta"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("respects controlled value", () => {
    render(
      <Radio
        aria-label="x"
        options={options}
        value="b"
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByLabelText("Beta")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("applies horizontal orientation", () => {
    const { container } = render(
      <Radio aria-label="x" options={options} orientation="horizontal" />,
    );
    expect(container.querySelector(".fw-radio-group")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  it("renders the error message and wires aria-invalid", () => {
    const { container } = render(
      <Radio aria-label="x" options={options} error="Required" />,
    );
    const group = container.querySelector(".fw-radio-group");
    expect(group).toHaveAttribute("aria-invalid", "true");
    const err = screen.getByText("Required");
    expect(err).toHaveAttribute("role", "alert");
    expect(group?.getAttribute("aria-describedby")).toBe(err.id);
  });
});
