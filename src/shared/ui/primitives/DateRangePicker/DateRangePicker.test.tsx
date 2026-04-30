import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateRangePicker } from "./DateRangePicker.js";

describe("<DateRangePicker>", () => {
  it("renders the placeholder when no value is set", () => {
    render(
      <DateRangePicker aria-label="period" placeholder="Selecionar período" />,
    );
    expect(screen.getByRole("button", { name: "period" })).toHaveTextContent(
      "Selecionar período",
    );
  });

  it("renders the formatted range in pt-BR", () => {
    render(
      <DateRangePicker
        aria-label="period"
        locale="pt-BR"
        value={{
          from: new Date(2026, 0, 1),
          to: new Date(2026, 0, 31),
        }}
      />,
    );
    const trigger = screen.getByRole("button", { name: "period" });
    expect(trigger.textContent).toContain("01/01/2026");
    expect(trigger.textContent).toContain("31/01/2026");
  });

  it("renders the formatted range in en-US", () => {
    render(
      <DateRangePicker
        aria-label="period"
        locale="en-US"
        value={{
          from: new Date(2026, 0, 1),
          to: new Date(2026, 0, 31),
        }}
      />,
    );
    const trigger = screen.getByRole("button", { name: "period" });
    expect(trigger.textContent).toMatch(/01\/01\/2026/);
  });

  it.each(["sm", "md", "lg"] as const)("applies the %s size class", (size) => {
    render(<DateRangePicker aria-label="x" size={size} />);
    expect(screen.getByRole("button", { name: "x" })).toHaveClass(
      `fw-drp-${size}`,
    );
  });

  it("forwards refs to the trigger button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<DateRangePicker ref={ref} aria-label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders the error message and wires aria-invalid", () => {
    render(<DateRangePicker aria-label="x" error="Selecione um período" />);
    const trigger = screen.getByRole("button", { name: "x" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    const err = screen.getByText("Selecione um período");
    expect(err).toHaveAttribute("role", "alert");
    expect(trigger.getAttribute("aria-describedby")).toBe(err.id);
  });

  it("opens the calendar popover when clicked", async () => {
    render(<DateRangePicker aria-label="x" />);
    fireEvent.click(screen.getByRole("button", { name: "x" }));
    expect(await screen.findByRole("grid")).toBeInTheDocument();
  });

  it("calls onChange after selecting a day", async () => {
    const onChange = vi.fn();
    render(<DateRangePicker aria-label="x" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "x" }));
    const grid = await screen.findByRole("grid");
    const dayButtons = grid.querySelectorAll("button");
    expect(dayButtons.length).toBeGreaterThan(0);
    const firstDay = dayButtons[0];
    if (firstDay) fireEvent.click(firstDay);
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0]?.[0] as { from: Date | undefined };
    expect(arg.from).toBeInstanceOf(Date);
  });

  it("disables the trigger when disabled is set", () => {
    render(<DateRangePicker aria-label="x" disabled />);
    expect(screen.getByRole("button", { name: "x" })).toBeDisabled();
  });
});
