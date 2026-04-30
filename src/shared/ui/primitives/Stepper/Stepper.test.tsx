import { createRef, useState, type JSX } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Stepper } from "./Stepper.js";
import type { StepperMode, StepperStep } from "./Stepper.js";

const STEPS: StepperStep[] = [
  { value: "a", label: "Conta" },
  { value: "b", label: "Identidade" },
  { value: "c", label: "Resumo" },
];

function ControlledStepper({
  initial,
  mode,
  onChange,
}: {
  initial: string;
  mode?: StepperMode;
  onChange?: (n: string) => void;
}): JSX.Element {
  const [value, setValue] = useState(initial);
  return (
    <Stepper
      steps={STEPS}
      current={value}
      mode={mode}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    >
      Painel: {value}
    </Stepper>
  );
}

describe("<Stepper>", () => {
  it("marks the current step with aria-current=step", () => {
    render(<ControlledStepper initial="b" />);
    const triggers = screen.getAllByRole("tab");
    expect(triggers[1]).toHaveAttribute("aria-current", "step");
  });

  it("disables future steps in linear mode", () => {
    render(<ControlledStepper initial="a" mode="linear" />);
    const triggers = screen.getAllByRole("tab");
    expect(triggers[1]).toBeDisabled();
    expect(triggers[2]).toBeDisabled();
  });

  it("allows clicking previous steps in linear mode", () => {
    const onChange = vi.fn();
    render(<ControlledStepper initial="b" mode="linear" onChange={onChange} />);
    const trigger = screen.getByRole("tab", { name: /Conta/ });
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.mouseDown(trigger);
    fireEvent.click(trigger);
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("allows clicking future steps in free mode", () => {
    const onChange = vi.fn();
    render(<ControlledStepper initial="a" mode="free" onChange={onChange} />);
    const trigger = screen.getByRole("tab", { name: /Resumo/ });
    expect(trigger).not.toBeDisabled();
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.mouseDown(trigger);
    fireEvent.click(trigger);
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("renders the panel for the current step", () => {
    render(<ControlledStepper initial="b" />);
    expect(screen.getByText(/Painel: b/)).toBeInTheDocument();
  });

  it("forwards refs to the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stepper
        ref={ref}
        steps={STEPS}
        current="a"
        onChange={() => undefined}
      />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
